import { handler } from '.';
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { GameDTO, GameItem } from "../game-dto";
import { PlayerGameDTO } from '@grid-wolf/user/lib/player-game-dto';
import { invitationUpdateDetailType, InvitationUpdateDetail, InvitationUpdateEvent } from '../game-event';
import { PostConfirmationTriggerEvent } from 'aws-lambda';

process.env['EVENT_BUS'] = 'arn';
process.env['USER_POOL'] = 'arn';

jest.mock('stepinto-aws-tools/clients');

describe('user-event-handler', () => {
  let oldConsole: Console;
  let dao: DynamoItemDao<GameItem, GameDTO>;
  let getSpy: jest.Mock;
  let putSpy: jest.Mock;
  let game: GameDTO;
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
    dao = (DynamoItemDao as unknown as jest.MockInstance<DynamoItemDao<GameItem, GameDTO>, any>).mock.instances[0];
    getSpy = (dao.get as jest.Mock);
    putSpy = (dao.put as jest.Mock);
    putSpy.mockResolvedValue(null);

    game = {
      gameId: 'game',
      ownerId: 'owner',
      name: 'game',
      players: [
        'email@email.email'
      ],
      timestamp: 1,
      active: true
    };
    playerGame = {
      playerId: 'uuid',
      email: 'email@email.email',
      gameOwnerId: 'owner',
      gameId: 'game',
      participationState: 'invited',
      timestamp: 1
    }
  });

  afterEach(() => {
    getSpy.mockClear();
    putSpy.mockClear();
  });

  describe('game:InvitationUpdate event', () => {
    let event: InvitationUpdateEvent;

    beforeEach(() => {
      event = {
        id: 'id',
        account: 'account',
        version: '0',
        time: 'time',
        region: 'region',
        resources: [],
        source: 'source',
        "detail-type": invitationUpdateDetailType,
        detail: {
          gameId: 'game',
          playerGame
        }
      };
    });

    test('should update a game with player UUIDs', async () => {
      getSpy.mockResolvedValue(game)
      await handler(event);
      expect(getSpy).toHaveBeenCalledWith('owner', 'game');
      expect(putSpy).toHaveBeenCalledWith({
        ...game,
        players: ['uuid']
      });
    });

    test('should not update a game if the player email does not match the event', async () => {
      getSpy.mockResolvedValue(game)
      playerGame.email = 'other@email.com';
      await handler(event);

      expect(getSpy).toHaveBeenCalledWith('owner', 'game');
      expect(putSpy).not.toHaveBeenCalledWith(game);
    });
  });
});
