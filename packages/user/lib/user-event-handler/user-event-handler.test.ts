import { handler } from '.';
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { PlayerGameDTO, PlayerGameItem } from "../player-game-dto";
import { gameInviteDetailType, GameInviteEvent } from '../user-event';
import { PostConfirmationTriggerEvent } from 'aws-lambda';
import { invitationUpdateDetailType } from '@grid-wolf/game/lib/game-event';

process.env['EVENT_BUS'] = 'arn';
process.env['USER_POOL'] = 'arn';

jest.mock('stepinto-aws-tools/clients');
let putEventsSpy = jest.fn();
let sendEventsSpy = jest.fn();
jest.mock('@aws-sdk/client-eventbridge', () => {
  return {
    PutEventsCommand: function (...args: any[]) { putEventsSpy(...args); },
    EventBridgeClient: function () {
      return {
        send: (...args: any[]) => sendEventsSpy(...args)
      };
    }
  }
});
let getUserSpy = jest.fn();
let sendCognitoSpy = jest.fn();
jest.mock('@aws-sdk/client-cognito-identity-provider', () => {
  return {
    AdminGetUserCommand: function (...args: any[]) { getUserSpy(...args); },
    CognitoIdentityProviderClient: function () {
      return {
        send: (...args: any[]) => sendCognitoSpy(...args)
      }
    }
  }
});

describe('user-event-handler', () => {
  let oldConsole: Console;
  let dao: DynamoItemDao<PlayerGameItem, PlayerGameDTO>;
  let getAllSpy: jest.Mock;
  let putSpy: jest.Mock;
  let deleteSpy: jest.Mock;
  let playerGame: PlayerGameDTO;

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
    dao = (DynamoItemDao as unknown as jest.MockInstance<DynamoItemDao<PlayerGameItem, PlayerGameDTO>, any>).mock.instances[0];
    getAllSpy = (dao.getAll as jest.Mock);
    putSpy = (dao.put as jest.Mock);
    putSpy.mockResolvedValue(null);
    deleteSpy = (dao.delete as jest.Mock);

    playerGame = {
      playerId: 'email@email.email',
      email: 'email@email.email',
      gameId: 'game',
      participationState: 'invited',
      timestamp: 1
    }
  });

  afterEach(() => {
    getAllSpy.mockClear();
    putSpy.mockClear();
    deleteSpy.mockClear();
    putEventsSpy.mockClear();
    sendEventsSpy.mockClear();
  });

  describe('user:GameInvite event', () => {
    test('should add a PlayerGame item for players without accounts', async () => {
      sendCognitoSpy.mockResolvedValue({
        Username: 'email@email.email',
        UserStatus: 'UNKNOWN'
      });
      const event: GameInviteEvent = {
        id: 'id',
        account: 'account',
        version: '0',
        time: 'time',
        region: 'region',
        resources: [],
        source: 'source',
        "detail-type": gameInviteDetailType,
        detail: {
          email: 'email@email.email',
          gameId: 'game'
        }
      };
      await handler(event);

      expect(getUserSpy).toHaveBeenCalledWith({
        UserPoolId: 'arn',
        Username: 'email@email.email'
      });
      expect(putSpy).toHaveBeenCalledWith({
        ...playerGame,
        timestamp: expect.anything()
      });
    });
    test('should add a PlayerGame item for a player with an account', async () => {
      sendCognitoSpy.mockResolvedValue({
        Username: 'email@email.email',
        UserStatus: 'CONFIRMED',
        UserAttributes: [{
          Name: 'sub',
          Value: 'uuid'
        }]
      });
      const event: GameInviteEvent = {
        id: 'id',
        account: 'account',
        version: '0',
        time: 'time',
        region: 'region',
        resources: [],
        source: 'source',
        "detail-type": gameInviteDetailType,
        detail: {
          email: 'email@email.email',
          gameId: 'game'
        }
      };
      await handler(event);

      expect(getUserSpy).toHaveBeenCalledWith({
        UserPoolId: 'arn',
        Username: 'email@email.email'
      });
      playerGame.playerId = 'uuid';
      expect(putSpy).toHaveBeenCalledWith({
        ...playerGame,
        timestamp: expect.anything()
      });
    });
  });

  describe('post-confirmation trigger event', () => {
    let event: PostConfirmationTriggerEvent;
    let playerGame2: PlayerGameDTO;

    beforeEach(() => {
      event = {
        version: '1',
        region: 'region',
        userPoolId: 'id',
        userName: 'userId',
        callerContext: {
            awsSdkVersion: 'version',
            clientId: 'client'
        },
        triggerSource: 'PostConfirmation_ConfirmSignUp',
        request: {
            userAttributes: {
                sub: 'userId',
                email_verified: 'true',
                'cognito:user_status': 'CONFIRMED',
                email: 'email@email.email'
            }
        },
        response: {}
      };
      playerGame2 = {
        playerId: 'email@email.email',
        gameId: 'game2',
        email: 'email@email.email',
        timestamp: 2,
        participationState: 'invited'
      }
    });

    test('should replace a PlayerGame email-keyed item with a userId-keyed one', async () => {
      getAllSpy.mockResolvedValue([playerGame, playerGame2]);

      const response = await handler(event);

      expect(response).toEqual(event);
      const updated1 = {
        ...playerGame,
        playerId: 'userId',
        timestamp: expect.anything()
      }
      const updated2 = {
        ...playerGame2,
        playerId: 'userId',
        timestamp: expect.anything()
      };
      expect(getAllSpy).toHaveBeenCalledWith('email@email.email');
      expect(putSpy).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining(updated1),
        expect.objectContaining(updated2)
      ]));
      expect(deleteSpy).toHaveBeenCalledWith('email@email.email', 'game');
      expect(deleteSpy).toHaveBeenCalledWith('email@email.email', 'game2');
      expect(putEventsSpy).toHaveBeenCalledWith({
        Entries: [{
          DetailType: invitationUpdateDetailType,
          Detail: expect.stringContaining('userId'),
          EventBusName: 'arn',
          Source: 'grid-wolf.user'
        }, {
          DetailType: invitationUpdateDetailType,
          Detail: expect.stringContaining('userId'),
          EventBusName: 'arn',
          Source: 'grid-wolf.user'
        }]
      });
      expect(sendEventsSpy).toHaveBeenCalled();
    });

    test('should not attempt to make a replacement if no PlayerGame has a matching email ID', async () => {
      getAllSpy.mockResolvedValue(null);

      const response = await handler(event);

      expect(response).toEqual(event);
      expect(getAllSpy).toHaveBeenCalledWith('email@email.email');
      expect(putSpy).not.toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
      expect(putEventsSpy).not.toHaveBeenCalled();
      expect(sendEventsSpy).not.toHaveBeenCalled();
    })
  });
});
