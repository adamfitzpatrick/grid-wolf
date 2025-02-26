import { GameDTO } from '@grid-wolf/game/lib/game-dto';
import { EncounterDTO } from '@grid-wolf/encounter/lib/encounter-dto';
import { test, expect, getAuthData } from '../authenticated-test';
import { randomUUID } from 'crypto';

test.describe('when managing encounters', () => {
  let gameId: string;
  let encounterId: string;
  let game: GameDTO
  let encounter: EncounterDTO;

  test.beforeAll(() => {
    gameId = randomUUID();
    encounterId = randomUUID();
  });

  test.beforeEach(({ getAuthData }) => {
    const leaderId = getAuthData().users[0].userId;
    const playerId = getAuthData().users[1].userId;

    game = {
      ownerId: leaderId,
      gameId,
      name: 'game',
      players: [
        playerId
      ],
      timestamp: 1,
      active: true
    }

    encounter = {
      gameId,
      encounterId,
      name: 'encounter',
      nonPlayerCharacters: [],
      timestamp: 1,
      active: true
    }
  });

  test('authorized users can save encounter data', async ({ request, getAuthData }) => {
    await request.put('./game', {
      headers: { 'x-api-key': getAuthData().apiKey.game },
      data: game
    });
    const response = await request.put('./encounter', {
      headers: { 'x-api-key': getAuthData().apiKey.encounter },
      data: encounter
    });
    expect(response.ok()).toBeTruthy();
  });

  test('users cannot save improperly formatted data', async ({ request, getAuthData }) => {
    const response = await request.put('./encounter', {
      headers: { 'x-api-key': getAuthData().apiKey.encounter },
      data: {
        ...encounter,
        extra: 'field'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('users cannot save data for a game that does not exist', async ({ request, getAuthData }) => {
    const response = await request.put('./encounter', {
      headers: { 'x-api-key': getAuthData().apiKey.encounter },
      data: {
        ...encounter,
        gameId: 'other'
      }
    });
    expect(response.status()).toBe(403);
  });

  test('users cannot save data for a game they do not own', async ({ request, getAuthData }) => {
    encounter.gameId = 'other';
    const response = await request.put('./encounter', {
      headers: { 'x-api-key': getAuthData().apiKey.encounter },
      data: encounter
    });
    expect(response.status()).toBe(403);
  });

  test('authorized users can retrieve encounter data', async ({ request, getAuthData }) => {
    const response = await request.get(`./encounter/${gameId}/${encounterId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(await response.json()).toEqual(encounter);
  });

  test('users cannot retrieve encounters attached to games they do not own', async ({ user2Request, getAuthData }) => {
    const response = await user2Request.get(`./encounter/${gameId}/${encounterId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(response.status()).toBe(403);
  });

  test('attempts to get non-existent games return a 403 response', async ({ request, getAuthData }) => {
    const response = await request.get(`./encounter/${gameId}/missing`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(response.status()).toBe(403);
  });

  test('authorized users can retrieve a list of encounters for a game they own', async ({ request, getAuthData }) => {
    const response = await request.get(`./encounter/list/${gameId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(await response.json()).toEqual([encounter]);
  });

  test('users cannot retrieve encounters for games they do not own', async ({ user2Request, getAuthData }) => {
    const response = await user2Request.get(`./encounter/list/${gameId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(response.status()).toBe(403);
  });

  test('users can attempt to delete encounters attached to games they do not own without any effect',
      async ({ user2Request, request, getAuthData }) => {
    const response = await user2Request.delete(`./encounter/${gameId}/${encounterId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(response.ok()).toBeTruthy;

    const getResponse = await request.get(`./encounter/${gameId}/${encounterId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(await getResponse.json()).toEqual(encounter);
  });

  test('authorized users can delete encounters they have created', async ({ request, getAuthData }) => {
    const response = await request.delete(`./encounter/${gameId}/${encounterId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(response.ok()).toBeTruthy;

    const getResponse = await request.get(`./encounter/${gameId}/${encounterId}`);
    expect(getResponse.ok()).toBeFalsy();
  });

  test('authorized users can delete non-existent encounters without error', async ({ request, getAuthData }) => {
    const response = await request.delete(`./encounter/${gameId}/missing`, {
      headers: { 'x-api-key': getAuthData().apiKey.encounter }
    });
    expect(response.ok()).toBeTruthy;
  });
});
