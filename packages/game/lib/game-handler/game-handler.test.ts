import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from ".";
import { GameDTO } from "@grid-wolf/shared/domain";

let getSpy: jest.Mock;
let listSpy: jest.Mock;
let putSpy: jest.Mock;

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

describe('game handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let gameDTO: GameDTO;
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
    gameDTO = {
      id: 'id',
      userId: 'user',
      name: 'name',
      timestamp: 1234
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
    putSpy.mockResolvedValue(gameDTO);
  });

  test('/game PUT should save game data to dynamodb', async () => {
    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted'
    });
    expect(putSpy).toHaveBeenCalledWith(gameDTO);
  });

  test('/game PUT should return 401 if Authorized user does not match request body user', async () => {
    gameDTO.userId = 'otherperson';
    event.body = JSON.stringify(gameDTO);

    expect(await handler(event)).toEqual({
      statusCode: 400,
      body: 'bad request'
    });

    expect(putSpy).not.toHaveBeenCalled();
  });

  test('/game/{gameId} GET should return data obtained from dynamodb', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    getSpy.mockResolvedValue(gameDTO);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(gameDTO)
    });
    expect(getSpy).toHaveBeenCalledWith('user', 'id');
  });

  test('/game/{gameId} GET should return 403 error when game not found', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    getSpy.mockRejectedValue('not found')

    await expect(handler(event)).resolves.toEqual({
      statusCode: 403,
      body: 'forbidden'
    });
    expect(getSpy).toHaveBeenCalledWith('user', 'id');
  });

  test('/games GET should return a list of game data for the user', async () => {
    event.requestContext.resourcePath = '/games'
    event.requestContext.httpMethod = 'GET'
    listSpy.mockReturnValue([ gameDTO ]);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([ gameDTO ])
    });

    expect(listSpy).toHaveBeenCalledWith('user');
  });
});
