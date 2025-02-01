import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from ".";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { GameItem, GameDTO } from "../game-dto";

jest.mock('stepinto-aws-tools/clients');
jest.mock('jsonwebtoken', () => {
  return {
    decode: () => ({ username: 'user' })
  };
});

describe('game handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let gameDTO: GameDTO;
  let event: APIGatewayProxyEvent;
  let daoPut: jest.Mock;
  let daoGet: jest.Mock;
  let daoGetAll: jest.Mock;
  let daoDelete: jest.Mock;

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
    Authorization = `Bearer TOKEN`;
    gameDTO = {
      gameId: 'id',
      ownerId: 'user',
      name: 'name',
      players: [],
      timestamp: 1234,
      active: true
    };
    event = {
      body: JSON.stringify(gameDTO),
      requestContext: {
        httpMethod: 'PUT',
        resourcePath: '/game'
      },
      headers: {
        Authorization
      }
    } as any as APIGatewayProxyEvent

    const daoMock = (DynamoItemDao as unknown as jest.Mock<DynamoItemDao<GameItem, GameDTO>>).mock.instances[0];
    daoPut = daoMock.put as jest.Mock;
    daoPut.mockResolvedValue(undefined);
    daoGet = daoMock.get as jest.Mock;
    daoGetAll = daoMock.getAll as jest.Mock;
    daoDelete = daoMock.delete as jest.Mock;
  });

  afterEach(() => {
    daoPut.mockClear();
    daoGet.mockClear();
    daoGetAll.mockClear();
    daoDelete.mockClear();
  })

  test('/game PUT should save game data to dynamodb', async () => {
    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted',
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(daoPut).toHaveBeenCalledWith(gameDTO);
  });

  test('/game PUT should return 400 if Authorized user does not match request body user', async () => {
    gameDTO.ownerId = 'otherperson';
    event.body = JSON.stringify(gameDTO);

    expect(await handler(event)).toEqual({
      statusCode: 400,
      body: 'bad request',
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });

    expect(daoPut).not.toHaveBeenCalled();
  });

  test('/game/{gameId} GET should return data obtained from dynamodb', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    daoGet.mockResolvedValue(gameDTO);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(gameDTO),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(daoGet).toHaveBeenCalledWith('user', 'id');
  });

  test('/game/{gameId} GET should return 403 error when game not found', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    daoGet.mockResolvedValue(null);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 403,
      body: 'forbidden',
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });
    expect(daoGet).toHaveBeenCalledWith('user', 'id');
  });

  test('/games GET should return a list of game data for the user', async () => {
    event.requestContext.resourcePath = '/games';
    event.requestContext.httpMethod = 'GET';
    daoGetAll.mockResolvedValue([ gameDTO ]);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([ gameDTO ]),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });

    expect(daoGetAll).toHaveBeenCalledWith('user');
  });

  test('/game DELETE should remove an item from DynamoDB', async () => {
    event.requestContext.resourcePath = '/game'
    event.requestContext.httpMethod = 'DELETE';
    daoDelete.mockResolvedValue({});

    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted',
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });

    expect(daoDelete).toHaveBeenCalledWith('user', 'id');
  });

  test('/game DELETE should return a 400 if authorized user does not match delete request', async () => {
    gameDTO.ownerId = 'otherperson';
    event.body = JSON.stringify(gameDTO);
    event.requestContext.resourcePath = '/game'
    event.requestContext.httpMethod = 'DELETE';
    daoDelete.mockResolvedValue({});

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
