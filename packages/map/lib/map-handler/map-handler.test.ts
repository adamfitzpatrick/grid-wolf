import { handler } from '.';
import { MapDTO } from '@grid-wolf/shared/domain';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';

let fetchSpy: jest.Mock;
let getSpy: jest.Mock;
let listSpy: jest.Mock;
let putSpy: jest.Mock;
let getCdnSignedUrlSpy: jest.Mock;
let putObjectSpy: jest.Mock;
let getS3SignedUrlSpy: jest.Mock;

jest.mock('node-fetch', () => {
  return (url: string) => fetchSpy(url);
});
jest.mock('@grid-wolf/shared/utils', () => {
  const originalModule = jest.requireActual('@grid-wolf/shared/utils');

  return {
    ...originalModule,
    DynamoClient: function () {
      return {
        get: (...params: any) => getSpy(...params),
        list: (params: any) => listSpy(params),
        put: (params: any) => putSpy(params)
      }
    }
  }
});
jest.mock('jsonwebtoken', () => {
  return {
    decode: () => ({ username: 'user' })
  };
});
jest.mock('@aws-sdk/cloudfront-signer', () => {
  return {
    getSignedUrl: (params: any) => getCdnSignedUrlSpy(params)
  }
});
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: function () { return {}; },
    PutObjectCommand: function (params: any) { return putObjectSpy(params) }
  }
});
jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: (...params: any[]) => getS3SignedUrlSpy(...params)
  }
})

describe('map handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let mapDTO: MapDTO;
  let event: APIGatewayProxyEvent;

  beforeAll(() => {
    oldConsole = { ...console };
    console.warn = (message: string) => {};
    console.debug = (message: string) => {};
    console.info = (message: string) => {};
  });

  afterAll(() => {
    console.warn = oldConsole.warn;
    console.debug = oldConsole.debug;
    console.info = oldConsole.info;
  });

  beforeEach(() => {
    getSpy = jest.fn();
    listSpy = jest.fn();
    putSpy = jest.fn();
    getCdnSignedUrlSpy = jest.fn();

    Authorization = `Bearer TOKEN`;
    mapDTO = {
      id: 'id',
      userId: 'user',
      name: 'map',
      timestamp: 1234,
      imageName: 'image'
    };
    event = {
      body: JSON.stringify(mapDTO),
      requestContext: {
        httpMethod: 'PUT',
        resourcePath: '/map'
      },
      headers: {
        Authorization
      }
    } as any as APIGatewayProxyEvent
  });

  test('PUT /map should save map data to DynamoDB', async () => {
    putSpy.mockResolvedValue(mapDTO);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted'
    });
    expect(putSpy).toHaveBeenCalledWith(mapDTO);
  });

  test('GET /map/{mapId} should get specific map data', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/map/{mapId}';
    event.pathParameters = {
      mapId: 'id'
    };
    getSpy.mockResolvedValue(mapDTO);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(mapDTO)
    });
    expect(getSpy).toHaveBeenCalledWith('user', 'id');
  });

  test('GET /map/{mapId} should return 403 error when map not found', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/map/{mapId}';
    event.pathParameters = {
      mapId: 'id'
    };
    getSpy.mockRejectedValue('not found');

    await expect(handler(event)).resolves.toEqual({
      statusCode: 403,
      body: 'forbidden'
    });
    expect(getSpy).toHaveBeenCalledWith('user', 'id');
  });

  describe('GET /map/save-image-url/{userId}/{filename}', () => {

    beforeEach(() => {
      process.env[EnvironmentVariableName.IMAGE_BUCKET_NAME] = 'bucket';
      putObjectSpy = jest.fn().mockReturnValue({});
      getS3SignedUrlSpy = jest.fn().mockResolvedValue('https://signed-url');

      event.requestContext.resourcePath = '/map/save-image-url/{userId}/{filename}';
      event.requestContext.httpMethod = 'GET';
      event.pathParameters = {
        userId: 'user',
        filename: 'filename.jpg'
      }
    });

    test('should return a pre-signed URL for saving objects to S3', async () => {
      await expect(handler(event)).resolves.toEqual({
        statusCode: 200,
        body: JSON.stringify({
          userId: 'user',
          filename: 'filename.jpg',
          url: 'https://signed-url'
        })
      });

      expect(putObjectSpy).toHaveBeenCalledWith({
        Bucket: 'bucket',
        Key: 'user/filename.jpg'
      });
      expect(getS3SignedUrlSpy).toHaveBeenCalledWith({}, {});
    });

    test('should return 400 error if authenticated user does not match requested userId', async () => {
      event.pathParameters!.userId = 'otherUser';
      await expect(handler(event)).resolves.toEqual({
        statusCode: 400,
        body: 'bad request'
      });
    });
  });

  describe('GET /map/image-url/{userId}', () => {
    beforeEach(() => {
      process.env[EnvironmentVariableName.CDN_HOST] = 'https://cdn-host.com';
      process.env[EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID] = 'secret-arn';
      process.env[EnvironmentVariableName.CDN_PUBLIC_KEY_ID] = 'key-pair';
  
      fetchSpy = jest.fn().mockResolvedValue({
        json: () => {
          return Promise.resolve({
            SecretString: JSON.stringify({ 'cdn-private-key': 'private-key' })
          });
        }
      });
      getCdnSignedUrlSpy.mockReturnValue(
        'https://cdn-host.com/userId?Policy=abcdef&Key-Pair-Id=key-pair&Signature=1234asdf'
      );
  
      event.requestContext.httpMethod = 'GET';
      event.requestContext.resourcePath = '/map/image-url/{userId}';
      event.pathParameters = {
        userId: 'user'
      };
    });

    test('should return signed URL components', async () => {
      await expect(handler(event)).resolves.toEqual({
        statusCode: 200,
        body: JSON.stringify({
          userId: 'user',
          policy: 'abcdef',
          keyPairId: 'key-pair',
          signature: '1234asdf'
        })
      });
  
      expect(fetchSpy).toHaveBeenCalledWith('http://localhost:2773/secretsmanager/get?secretId=secret-arn');
      expect(getCdnSignedUrlSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://cdn-host.com/user',
        keyPairId: 'key-pair',
        privateKey: expect.anything(),
        policy: expect.any(String)
      }));
      const policyCall = JSON.parse(getCdnSignedUrlSpy.mock.calls[0][0].policy);
      expect(policyCall).toEqual(expect.objectContaining({
        Statement: [{
          Resource: 'https://cdn-host.com/user/*',
          Condition: { DateLessThan: { 'AWS:EpochTime': expect.any(Number) }}
        }]
      }))
    });

    test('should return 400 if submitted userId does not match authenticated user', async () => {
      event.pathParameters!.userId = 'wrongUser';
      await expect(handler(event)).resolves.toEqual({
        statusCode: 400,
        body: 'bad request'
      });
    });
  });

  test('GET /maps should return all map data for the user', async () => {
    event.requestContext.resourcePath = '/maps'
    event.requestContext.httpMethod = 'GET'
    listSpy.mockResolvedValue([ mapDTO ]);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([ mapDTO ])
    });
    expect(listSpy).toHaveBeenCalledWith('user');
  })
});
