import { handler } from '.';
import { MapDAO, MapDTO } from '@grid-wolf/shared/domain';
import { APIGatewayProxyEvent } from 'aws-lambda';

let getSpy: jest.Mock;
let listSpy: jest.Mock;
let putSpy: jest.Mock;
let busboyOnSpy: jest.Mock;


jest.mock('@grid-wolf/shared/utils', () => {
  return {
    EnvironmentVariableName: { DATA_TABLE_NAME: 'table' },
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

  test('/map/{mapId} GET should return 403 error when map not found', async () => {
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
