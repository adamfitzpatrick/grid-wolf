import { APIGatewayProxyEvent } from "aws-lambda";
import { PlayerGameDTO, PlayerGameItem } from "../player-game-dto";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { handler } from ".";

jest.mock('stepinto-aws-tools/clients');
jest.mock('jsonwebtoken', () => {
  return {
    decode: () => ({ username: 'user' })
  };
});

describe('user handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let playerGameDTO: PlayerGameDTO;
  let event: APIGatewayProxyEvent;
  let daoPut: jest.Mock;
  let daoGet: jest.Mock;
  let daoGetAll: jest.Mock;

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
    playerGameDTO = {
      gameId: 'id',
      playerId: 'user',
      email: 'email@email.com',
      participationState: 'invited',
      timestamp: 1234
    };
    event = {
      pathParameters: {
        gameId: 'id'
      },
      requestContext: {
        httpMethod: 'GET',
        resourcePath: '/player-game/{gameId}'
      },
      headers: {
        Authorization
      }
    } as any as APIGatewayProxyEvent

    const daoMock = (DynamoItemDao as unknown as jest.Mock<DynamoItemDao<PlayerGameItem, PlayerGameDTO>>)
      .mock.instances[0];
    daoPut = daoMock.put as jest.Mock;
    daoPut.mockResolvedValue(undefined);
    daoGet = daoMock.get as jest.Mock;
    daoGetAll = daoMock.getAll as jest.Mock;
  });

  afterEach(() => {
    daoPut.mockClear();
    daoGet.mockClear();
    daoGetAll.mockClear();
  })

  describe('GET /player-game/{gameId}', () => {
    test('should retrieve a single player game data item', async () => {
      daoGet.mockResolvedValue(playerGameDTO);
      await expect(handler(event)).resolves.toEqual({
        statusCode: 200,
        body: JSON.stringify(playerGameDTO),
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
      expect(daoGet).toHaveBeenCalledWith('user', 'id');
    });

    test('should return 403 if the player game does not exist', async () => {
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
    })
  });

  describe('PATCH /player-game/{gameId}/{participantAction}', () => {
    beforeEach(() => {
      event.requestContext.resourcePath = '/player-game/{gameId}/{participantAction}';
      event.requestContext.httpMethod = 'PATCH';
      event.pathParameters!['participantAction'] = 'accept'
    });

    test('should update the player game data with a new participantState', async () => {
      daoGet.mockResolvedValue(playerGameDTO);
      await expect(handler(event)).resolves.toEqual({
        statusCode: 202,
        body: 'accepted',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGet).toHaveBeenCalledWith('user', 'id');
      playerGameDTO.participationState = 'accepted';
      expect(daoPut).toHaveBeenCalledWith(playerGameDTO)
    });

    test('should return 403 if the player game does not exist', async () => {
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
      expect(daoPut).not.toHaveBeenCalled();
    })

    test('should return status 400 if an invalid participantAction is provided', async () => {
      event.pathParameters!['participantAction'] = 'other';
      daoGet.mockResolvedValue(playerGameDTO);
      await expect(handler(event)).resolves.toEqual({
        statusCode: 400,
        body: 'bad request',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGet).not.toHaveBeenCalled();
      expect(daoPut).not.toHaveBeenCalled();
    });
  });

  test('GET /player-game/list should return a list of player game data for the user', async () => {
    event.requestContext.resourcePath = '/player-game/list';
    daoGetAll.mockResolvedValue([ playerGameDTO ]);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([ playerGameDTO ]),
      headers: {
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Origin': '*',
      }
    });

    expect(daoGetAll).toHaveBeenCalledWith('user');});
})
