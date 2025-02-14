import { EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { test, expect, getAuthData } from '../authenticated-test';
import { randomUUID } from 'crypto'
import { resolve } from 'path';
import { PlayerGameDTO } from '@grid-wolf/user/lib/player-game-dto'
import { GameDTO } from '@grid-wolf/game/lib/game-dto';

const TEST_IMAGE_FILENAME = 'test-image.webp';
const TEST_IMAGE_PATH = resolve(__dirname, TEST_IMAGE_FILENAME);
const SUBDOMAIN = process.env[EnvironmentVariableName.APP_SUBDOMAIN];
const ENV = process.env[EnvironmentVariableName.PREFIX];

test.describe('when getting user info', () => {
  let gameId: string;
  let playerGame: PlayerGameDTO;
  let timestamp: number;

  test.beforeAll(() => {
    timestamp = new Date().getTime();
    gameId = randomUUID();
  });

  test.beforeEach(({ getAuthData }) => {
    playerGame = {
      playerId: getAuthData().userId,
      gameId,
      participationState: 'invited',
      timestamp
    };})

  test('authenticated users can add games which creates player entries', async ({ request, getAuthData }) => {
    const userId = getAuthData().userId
    const gameDto: GameDTO = {
      gameId: playerGame.gameId,
      ownerId: userId,
      name: 'game',
      players: [ userId ],
      timestamp,
      active: true
    };
    const response = await request.put('./game', {
      headers: { 'x-api-key': getAuthData().apiKey.game },
      data: gameDto
    });
    expect(response.ok()).toBeTruthy();
  });

  test('authenticated users can retrieve a game in which they are a player', async ({ request, getAuthData }) => {
    const response = await request.get(`./user/player-game/${playerGame.gameId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.user }
    });
    expect(await response.json()).toEqual(playerGame);
  });

  test('authenticated users receive "forbidden" when they request a game that does not exist', async ({ request, getAuthData }) => {
    const response = await request.get(`./user/player-game/not-a-game`, {
      headers: { 'x-api-key': getAuthData().apiKey.user }
    });
    expect(await response.status()).toEqual(403);
  });
  
  test('authenticated users can retrieve a list of games in which they are a player', async ({ request, getAuthData }) => {
    const response = await request.get('./user/player-game/list', {
      headers: { 'x-api-key': getAuthData().apiKey.user },
    });
    expect(await response.json()).toEqual([playerGame]);
  });

  test('authenticated users can accept game invitations', async ({ request, getAuthData }) => {
    const response = await request.patch(`./user/player-game/${playerGame.gameId}/accept`,{
      headers: { 'x-api-key': getAuthData().apiKey.user },
    });
    expect(response.ok()).toBeTruthy();
    playerGame.participationState = 'accepted';
    const verify = await request.get(`./user/player-game/${playerGame.gameId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.user }
    });
    expect(await verify.json()).toEqual(playerGame);
  });

  test('authenticated users can decline game invitations', async ({ request, getAuthData }) => {
    const response = await request.patch(`./user/player-game/${playerGame.gameId}/decline`,{
      headers: { 'x-api-key': getAuthData().apiKey.user },
    });
    expect(response.ok()).toBeTruthy();
    playerGame.participationState = 'declined';
    const verify = await request.get(`./user/player-game/${playerGame.gameId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.user }
    });
    expect(await verify.json()).toEqual(playerGame);
  });

  test('users cannot submit improper participant states', async ({ request, getAuthData }) => {
    const response = await request.patch(`./user/player-game/${playerGame.gameId}/other`,{
      headers: { 'x-api-key': getAuthData().apiKey.user },
    });
    expect(response.status()).toBe(400);
  })
});
