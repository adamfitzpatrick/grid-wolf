import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from ".";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { EncounterItem, EncounterDTO } from "../encounter-dto";
import { GameDTO } from "@grid-wolf/game/lib/game-dto";
import { EntityDTO } from '@grid-wolf/entity/lib/entity-dto';

jest.mock('stepinto-aws-tools/clients');
const decodeSpy = jest.fn();
jest.mock('jsonwebtoken', () => {
  return {
    decode: (token: string) => { return decodeSpy(token); }
  };
});

describe('encounter handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let gameDTO: GameDTO;
  let encounterDTO: EncounterDTO;
  let event: APIGatewayProxyEvent;
  let daoEncounterPut: jest.Mock;
  let daoEncounterGet: jest.Mock;
  let daoEncounterGetAll: jest.Mock;
  let daoEncounterDelete: jest.Mock;
  let daoGameGet: jest.Mock;

  beforeAll(() => {
    oldConsole = { ...console };
    console.warn = (message: string) => { };
    console.debug = (message: string) => { };
    console.info = (message: string) => { };
  });

  afterAll(() => {
    console.warn = oldConsole.warn;
    console.debug = oldConsole.debug;
    console.info = oldConsole.info;
  });

  beforeEach(() => {
    Authorization = `Bearer TOKEN`;
    gameDTO = {
      gameId: 'game',
      ownerId: 'owner',
      name: 'Game',
      players: [
        'player'
      ],
      timestamp: 1,
      active: true
    };
    encounterDTO = {
      encounterId: 'id',
      gameId: 'game',
      name: 'name',
      nonPlayerCharacters: [
        'npc'
      ],
      timestamp: 1234,
      active: true
    };
    event = {
      body: JSON.stringify(encounterDTO),
      headers: {
        Authorization
      }
    } as any as APIGatewayProxyEvent

    // The following is a bit fragile; if the instantiation order in the SUT were to swap everything would be thrown off.
    // Given that this is for unit tests the risk is minor and easily resolved.
    const daoGameMock = (DynamoItemDao as unknown as jest.Mock<DynamoItemDao<EncounterItem, EncounterDTO>>).mock.instances[0];
    const daoEncounterMock = (DynamoItemDao as unknown as jest.Mock<DynamoItemDao<EncounterItem, EncounterDTO>>).mock.instances[1];
    daoEncounterPut = daoEncounterMock.put as jest.Mock;
    daoEncounterPut.mockResolvedValue(undefined);
    daoEncounterGet = daoEncounterMock.get as jest.Mock;
    daoEncounterGetAll = daoEncounterMock.getAll as jest.Mock;
    daoEncounterDelete = daoEncounterMock.delete as jest.Mock;
    daoGameGet = daoGameMock.get as jest.Mock;

    decodeSpy.mockReturnValue({ username: 'owner' })
  });

  afterEach(() => {
    daoEncounterPut.mockClear();
    daoEncounterGet.mockClear();
    daoEncounterGetAll.mockClear();
    daoEncounterDelete.mockClear();
    daoGameGet.mockClear();
  })

  describe('/ PUT', () => {
    beforeEach(() => {
      event.requestContext = {
        httpMethod: 'PUT',
        resourcePath: '/'
      } as any;
    });

    test('should save encounter data to dynamodb', async () => {
      daoGameGet.mockResolvedValue(gameDTO);
      await expect(handler(event)).resolves.toEqual({
        statusCode: 202,
        body: 'accepted',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterPut).toHaveBeenCalledWith(encounterDTO);
    });

    test('should return 403 if the attached game does not exist', async () => {
      daoGameGet.mockResolvedValue(null);
      await expect(handler(event)).resolves.toEqual({
        statusCode: 403,
        body: 'forbidden',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
    });
  
    test('should return 403 if Authorized user does not own the attached game', async () => {
      daoGameGet.mockResolvedValue({
        ...gameDTO,
        ownerId: 'other'
      });
  
      expect(await handler(event)).toEqual({
        statusCode: 400,
        body: 'bad request',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterPut).not.toHaveBeenCalled();
    });
  });

  describe('/{gameId}/{encounterId} GET', () => {
    beforeEach(() => {
      event.requestContext = {
        httpMethod: 'GET',
        resourcePath: '/{gameId}/{encounterId}'
      } as any;
      event.pathParameters = {
        gameId: 'game',
        encounterId: 'id'
      };
      daoGameGet.mockResolvedValue(gameDTO);
      daoEncounterGet.mockResolvedValue(encounterDTO);
    });

    test('should return the requested encounter data', async () => {
      await expect(handler(event)).resolves.toEqual({
        statusCode: 200,
        body: JSON.stringify(encounterDTO),
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterGet).toHaveBeenCalledWith('game', 'id');
    });
  
    test('should return 403 when the authorized user does not own the attached game', async () => {
      daoGameGet.mockResolvedValue(null);

      await expect(handler(event)).resolves.toEqual({
        statusCode: 403,
        body: 'forbidden',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterGet).not.toHaveBeenCalled();
    });
  
    test('should return 403 error when an encounter was not found', async () => {
      daoEncounterGet.mockResolvedValue(null);
  
      await expect(handler(event)).resolves.toEqual({
        statusCode: 403,
        body: 'forbidden',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterGet).toHaveBeenCalledWith('game', 'id');
    });
  });

  describe('/list/{gameId} GET', () => {
    beforeEach(() => {
      event.pathParameters = {
        gameId: 'game'
      };
      event.requestContext = {
        resourcePath: '/list/{gameId}',
        httpMethod: 'GET'
      } as any;
      daoGameGet.mockResolvedValue(gameDTO);
      daoEncounterGetAll.mockResolvedValue([encounterDTO]);
    });

    test('should return a list of encounter data for the game', async () => {
      await expect(handler(event)).resolves.toEqual({
        statusCode: 200,
        body: JSON.stringify([encounterDTO]),
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
  
      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterGetAll).toHaveBeenCalledWith('game');
    });

    test('should return 403 if the authorized user does not own the attached game', async () => {
      daoGameGet.mockResolvedValue(null);

      await expect(handler(event)).resolves.toEqual({
        statusCode: 403,
        body: 'forbidden',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });
  
      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterGetAll).not.toHaveBeenCalled();
    });
  });

  describe('/{gameId}/{encounterId} DELETE', () => {
    beforeEach(() => {
      event.requestContext = {
        resourcePath: '/{gameId}/{encounterId}',
        httpMethod: 'DELETE'
      } as any;
      event.pathParameters = {
        gameId: 'game',
        encounterId: 'id'
      };
      daoGameGet.mockResolvedValue(gameDTO);
      daoEncounterDelete.mockResolvedValue(null);
    });

    test('should remove an encounter item from DynamoDB', async () => {
      await expect(handler(event)).resolves.toEqual({
        statusCode: 202,
        body: 'accepted',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterDelete).toHaveBeenCalledWith('game', 'id');
    });

    test('should not remove an item and return no error if the authorized user does not own the attached game',
        async () => {
      // NOTE: Returning 202 when game does not exist maintains idepotemcy of DELETE operation
      daoGameGet.mockResolvedValue(null);

      await expect(handler(event)).resolves.toEqual({
        statusCode: 202,
        body: 'accepted',
        headers: {
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
          'Access-Control-Allow-Methods': '*',
          'Access-Control-Allow-Origin': '*',
        }
      });

      expect(daoGameGet).toHaveBeenCalledWith('owner', 'game');
      expect(daoEncounterDelete).not.toHaveBeenCalled();
    });
  });
});
