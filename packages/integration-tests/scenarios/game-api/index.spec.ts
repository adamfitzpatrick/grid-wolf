import { test, expect } from '../authenticated-test';
import { GameDTO } from '@grid-wolf/game/lib/game-dto';
import { randomUUID } from 'crypto'

test.describe('when managing games', () => {
  let gameId1: string;
  let gameId2: string;
  let game1: GameDTO;
  let game2: GameDTO;

  test.beforeAll(({ getAuthData }) => {
    gameId1 = randomUUID();
    gameId2 = randomUUID();
    game1 = {
      gameId: gameId1,
      ownerId: getAuthData().userId,
      name: 'test-game-1',
      players: [],
      timestamp: new Date().getTime(),
      active: true
    };
    game2 = {
      gameId: gameId2,
      ownerId: getAuthData().userId,
      name: 'test-game-2',
      players: [],
      timestamp: new Date().getTime(),
      active: true
    }
  });

  test('authenticated users can save game data', async ({ request, getAuthData }) => {
    const response = await request.put('./game', {
      headers: { 'x-api-key': getAuthData().apiKey.game },
      data: game1
    });
    expect(response.ok()).toBeTruthy();
  });

  test('authenticated users can retrieve samed game data', async ({ request, getAuthData }) => {
    const response = await request.get(`./game/${gameId1}`, {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    expect(await response.json()).toEqual(game1);
  });

  test('authenticated users can retrieve a list of games', async ({ request, getAuthData }) => {
    await request.put('./game', {
      headers: { 'x-api-key': getAuthData().apiKey.game },
      data: game2
    });
    const response = await request.get('./game/list', {
      headers: {
        'x-api-key': getAuthData().apiKey.game
      }
    });
    expect((await response.json()).length).toBe(2);
  });

  test('authenticated users can delete games they have created', async ({ request, getAuthData }) => {
    const existingGames = await request.get('./game/list', {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });

    const promises = (await existingGames.json()).map(async (game: GameDTO) => {
      await request.delete('./game', {
        headers: { 'x-api-key': getAuthData().apiKey.game },
        data: game
      });
    });
    await Promise.all(promises);
    const response = await request.get('./game/list', {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    expect(await response.json()).toEqual([]);
  });
});
