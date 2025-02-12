import { handler } from '.';
import { MapDTO, MapItem } from '../map-dto';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { DynamoItemDao } from 'stepinto-aws-tools/clients';

let fetchSpy: jest.Mock;
let getCdnSignedUrlSpy: jest.Mock;
let putObjectSpy: jest.Mock;
let getS3SignedUrlSpy: jest.Mock;

jest.mock('stepinto-aws-tools/clients');
jest.mock('node-fetch', () => {
  return (url: string) => fetchSpy(url);
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

  let dao: DynamoItemDao<MapItem, MapDTO>;
  let getSpy: jest.Mock;
  let getAllSpy: jest.Mock;
  let putSpy: jest.Mock;
  let deleteSpy: jest.Mock;

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
    process.env[EnvironmentVariableName.CDN_PUBLIC_KEY_ID] = 'key-pair';
    process.env[EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID] = 'secret-arn';
    process.env[EnvironmentVariableName.CDN_HOST] = 'cdn-host';
    dao = (DynamoItemDao as unknown as jest.MockInstance<DynamoItemDao<MapItem, MapDTO>, any>).mock.instances[0];
    getSpy = (dao.get as jest.Mock);
    getAllSpy = (dao.getAll as jest.Mock);
    putSpy = (dao.put as jest.Mock);
    deleteSpy = (dao.delete as jest.Mock);
    getCdnSignedUrlSpy = jest.fn();

    Authorization = `Bearer TOKEN`;
    mapDTO = {
      mapId: 'id',
      ownerId: 'user',
      name: 'map',
      imageUri: 'uri',
      gridData: {},
      timestamp: 1,
      active: true
    };
    event = {
      body: JSON.stringify(mapDTO),
      requestContext: {
        httpMethod: 'PUT',
        resourcePath: '/'
      },
      headers: {
        Authorization
      }
    } as any as APIGatewayProxyEvent
  });

  afterEach(() => {
    getSpy.mockClear();
    getAllSpy.mockClear();
    putSpy.mockClear();
  });

  test('PUT / should save map data to DynamoDB', async () => {
    putSpy.mockResolvedValue(undefined);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted',
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(putSpy).toHaveBeenCalledWith(mapDTO);
  });

  test('GET /{mapId} should get specific map data', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/{mapId}';
    event.pathParameters = {
      mapId: 'id'
    };
    getSpy.mockResolvedValue(mapDTO);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(mapDTO),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(getSpy).toHaveBeenCalledWith('user', 'id');
  });

  test('GET /{mapId} should return 403 error when map not found', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/{mapId}';
    event.pathParameters = {
      mapId: 'id'
    };
    getSpy.mockResolvedValue(null);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 403,
      body: 'forbidden',
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(getSpy).toHaveBeenCalledWith('user', 'id');
  });

  describe('DELETE /{mapId}', () => {
    beforeEach(() => {
      event.requestContext.httpMethod = 'DELETE';
      event.requestContext.resourcePath = '/{mapId}'
      event.body = '';
      event.pathParameters = {
        mapId: 'id'
      }
    });

    test('should remove a map item from DynamoDB', async () => {
      deleteSpy.mockResolvedValue(undefined);
  
      await expect(handler(event)).resolves.toEqual({
        statusCode: 202,
        body: 'accepted',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
      expect(deleteSpy).toHaveBeenCalledWith('user', 'id');
    });
  })


  describe('GET /save-image-url/{userId}/{filename}', () => {
    beforeEach(() => {
      process.env[EnvironmentVariableName.IMAGE_BUCKET_NAME] = 'bucket';
      putObjectSpy = jest.fn().mockReturnValue({});
      getS3SignedUrlSpy = jest.fn().mockResolvedValue('https://signed-url');

      event.requestContext.resourcePath = '/save-image-url/{userId}/{filename}';
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
        }),
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(putObjectSpy).toHaveBeenCalledWith({
        Bucket: 'bucket',
        Key: 'user/filename.jpg'
      });
      expect(getS3SignedUrlSpy).toHaveBeenCalledWith({}, {}, { expiresIn: 3600 });
    });

    test('should return 400 error if authenticated user does not match requested userId', async () => {
      event.pathParameters!.userId = 'otherUser';
      await expect(handler(event)).resolves.toEqual({
        statusCode: 400,
        body: 'bad request',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
    });
  });

  describe('GET /image-url/{userId}', () => {
    beforeEach(() => {
      // process.env[EnvironmentVariableName.CDN_HOST] = 'https://cdn-host.com';
      // process.env[EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID] = 'secret-arn';
      // process.env[EnvironmentVariableName.CDN_PUBLIC_KEY_ID] = 'key-pair';
  
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
      event.requestContext.resourcePath = '/image-url/{userId}';
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
        }),
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
  
      expect(fetchSpy).toHaveBeenCalledWith('http://localhost:2773/secretsmanager/get?secretId=secret-arn');
      expect(getCdnSignedUrlSpy).toHaveBeenCalledWith(expect.objectContaining({
        url: 'https://cdn-host/user',
        keyPairId: 'key-pair',
        privateKey: expect.anything(),
        policy: expect.any(String)
      }));
      const policyCall = JSON.parse(getCdnSignedUrlSpy.mock.calls[0][0].policy);
      expect(policyCall).toEqual(expect.objectContaining({
        Statement: [{
          Resource: 'https://cdn-host/user/*',
          Condition: { DateLessThan: { 'AWS:EpochTime': expect.any(Number) }}
        }]
      }))
    });

    test('should return 400 if submitted userId does not match authenticated user', async () => {
      event.pathParameters!.userId = 'wrongUser';
      await expect(handler(event)).resolves.toEqual({
        statusCode: 400,
        body: 'bad request',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
    });
  });

  test('GET /list should return all map data for the user', async () => {
    event.requestContext.resourcePath = '/list'
    event.requestContext.httpMethod = 'GET'
    getAllSpy.mockResolvedValue([ mapDTO ]);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([ mapDTO ]),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(getAllSpy).toHaveBeenCalledWith('user');
  });

  test('should throw if there is no matching resourcePath and method', async () => {
    event.requestContext.resourcePath = '/wrong';
    await expect(handler(event)).rejects.toThrow('No handler');

    event.requestContext.resourcePath = '/';
    event.requestContext.httpMethod = 'POST';
    await expect(handler(event)).rejects.toThrow('No handler');
  })
});
