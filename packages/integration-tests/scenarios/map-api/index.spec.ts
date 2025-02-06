import { test, expect } from '../authenticated-test';
import { MapDTO } from '@grid-wolf/map/lib/map-dto';
import { randomUUID } from 'crypto'

test.describe('when managing maps', () => {
  let mapId1: string;
  let mapId2: string;
  let map1: MapDTO;
  let map2: MapDTO;

  test.beforeAll(({ getAuthData }) => {
    mapId1 = randomUUID();
    mapId2 = randomUUID();
    map1 = {
      mapId: mapId1,
      ownerId: getAuthData().userId,
      name: 'test-game-1',
      timestamp: new Date().getTime(),
      imageUri: 'image',
      gridData: {},
      active: true
    };
    map2 = {
      mapId: mapId2,
      ownerId: getAuthData().userId,
      name: 'test-game-2',
      imageUri: 'image',
      gridData: {},
      timestamp: new Date().getTime(),
      active: true
    }
  });

  test('authenticated users can save map data', async ({ request, getAuthData }) => {
    const response = await request.put('./map', {
      headers: { 'x-api-key': getAuthData().apiKey.map },
      data: map1
    });
    expect(response.ok()).toBeTruthy();
  });

  test('authenticated users can retrieve samed map data', async ({ request, getAuthData }) => {
    const response = await request.get(`./map/${mapId1}`, {
      headers: { 'x-api-key': getAuthData().apiKey.map }
    });
    expect(await response.json()).toEqual(map1);
  });

  test('authenticated users can retrieve a list of maps', async ({ request, getAuthData }) => {
    await request.put('./map', {
      headers: { 'x-api-key': getAuthData().apiKey.map },
      data: map2
    });
    const response = await request.get('./map/list', {
      headers: {
        'x-api-key': getAuthData().apiKey.map
      }
    });
    expect((await response.json()).length).toBe(2);
  });

  test('authenticated users can delete maps they have created', async ({ request, getAuthData }) => {
    const existingGames = await request.get('./map/list', {
      headers: { 'x-api-key': getAuthData().apiKey.map }
    });

    const promises = (await existingGames.json()).map(async (map: MapDTO) => {
      await request.delete('./map', {
        headers: { 'x-api-key': getAuthData().apiKey.map },
        data: map
      });
    });
    await Promise.all(promises);
    const response = await request.get('./map/list', {
      headers: { 'x-api-key': getAuthData().apiKey.map }
    });
    expect(await response.json()).toEqual([]);
  });

  test.fixme('authenticated users can obtain a URI for saving a map image', () => {});

  test.fixme('authenticated users can obtain a URI which works for map image retrieval', () => {});
});
