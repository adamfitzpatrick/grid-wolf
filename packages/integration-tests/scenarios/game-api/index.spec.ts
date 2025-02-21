import { test, expect, getAuthData } from '../authenticated-test';
import { GameDTO } from '@grid-wolf/game/lib/game-dto';
import { randomUUID } from 'crypto'

test.describe('when managing games', () => {
  let gameId1: string;
  let gameId2: string;
  let game1: GameDTO;
  let game2: GameDTO;
  let timestamp: number;

  test.beforeAll(() => {
    gameId1 = randomUUID();
    gameId2 = randomUUID();
    timestamp = new Date().getTime();
  });

  test.beforeEach(({ getAuthData }) => {
    game1 = {
      gameId: gameId1,
      ownerId: getAuthData().users[0].userId,
      name: 'test-game-1',
      players: [],
      timestamp,
      active: true
    };
    game2 = {
      gameId: gameId2,
      ownerId: getAuthData().users[0].userId,
      name: 'test-game-2',
      players: [],
      timestamp,
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

  test('users cannot save invalid game data', async ({ request, getAuthData }) => {
    const invalid = {
      ...game1,
      badField: 'bad'
    };
    const response = await request.put('./game', {
      headers: { 'x-api-key': getAuthData().apiKey.game },
      data: invalid
    });
    expect(response.ok()).toBeFalsy();
  });

  test('users cannot save game data owned by another user', async ({ request, getAuthData }) => {
    game1.ownerId = 'somebody-else';
    const response = await request.put('./game', {
      headers: { 'x-api-key': getAuthData().apiKey.game },
      data: game1
    });
    expect(response.ok()).toBeFalsy();
  });

  test('authenticated users can retrieve saved game data', async ({ request, getAuthData }) => {
    const response = await request.get(`./game/${gameId1}`, {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    expect(await response.json()).toEqual(game1);
  });
  
  test('authenticated users receive "access denied" when requesting non-existent game data', async ({ request, getAuthData }) => {
    const response = await request.get(`./game/not-a-game`, {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    expect(await response.status()).toBe(403);
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
    expect((await response.json()).length).toBeGreaterThanOrEqual(2);
  });

  test('authenticated users can delete games they have created', async ({ request, getAuthData }) => {
    const existingGamesResponse = await request.get('./game/list', {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    const existingGames = await existingGamesResponse.json() as GameDTO[];
    const promises = existingGames.map(async (game: GameDTO) => {
      await request.delete(`./game/${game.gameId}`, {
        headers: { 'x-api-key': getAuthData().apiKey.game }
      });
    });
    await Promise.all(promises);
    const response = await request.get('./game/list', {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    // Other tests may add games in the meantime.  We're only concerned about ones that we deleted
    const failedDelete = (await response.json() as GameDTO[])
      .filter(game => existingGames.some(existing => existing.gameId === game.gameId));
    expect(failedDelete).toEqual([]);
  });

  test('authenticated users can attempt to delete non-existent games without error', async ({ request, getAuthData }) => {
    const response = await request.delete(`./game/non-existent`, {
      headers: { 'x-api-key': getAuthData().apiKey.game }
    });
    expect(response.ok()).toBeTruthy();
  });
});
