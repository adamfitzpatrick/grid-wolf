import { EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { test, expect } from '../authenticated-test';
import { MapDTO } from '@grid-wolf/map/lib/map-dto';
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs';
import { resolve } from 'path';

const TEST_IMAGE_FILENAME = 'test-image.webp';
const TEST_IMAGE_PATH = resolve(__dirname, TEST_IMAGE_FILENAME);
const SUBDOMAIN = process.env[EnvironmentVariableName.APP_SUBDOMAIN];
const ENV = process.env[EnvironmentVariableName.PREFIX];

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
      await request.delete(`./map/${map.mapId}`, {
        headers: { 'x-api-key': getAuthData().apiKey.map }
      });
    });
    await Promise.all(promises);
    const response = await request.get('./map/list', {
      headers: { 'x-api-key': getAuthData().apiKey.map }
    });
    expect(await response.json()).toEqual([]);
  });

  test('authenticated users can obtain a URI for saving a map image', async ({ playwright, request, getAuthData }) => {
    const saveUriResponse = await request.get(`./map/save-image-url/${getAuthData().userId}/${TEST_IMAGE_FILENAME}`, {
      headers: { 'x-api-key': getAuthData().apiKey.map }
    });
    const saveInfo = await saveUriResponse.json();
    expect(saveInfo).toEqual({
      userId: getAuthData().userId,
      filename: TEST_IMAGE_FILENAME,
      url: expect.stringContaining('PutObject')
    });

    const testFile = readFileSync(TEST_IMAGE_PATH);
    const saveRequestContext = await playwright.request.newContext();
    const saveResponse = await saveRequestContext.put(saveInfo.url, {
      data: testFile
    });
    expect(saveResponse.ok()).toBeTruthy();
  });

  test('authenticated users can obtain a URI which works for map image retrieval', async ({ playwright, request, getAuthData }) => {
    const getUriResponse = await request.get(`./map/image-url/${getAuthData().userId}`, {
      headers: { 'x-api-key': getAuthData().apiKey.map }
    });
    const getInfo = await getUriResponse.json()
    expect(getInfo).toEqual({
      userId: getAuthData().userId,
      policy: expect.anything(),
      keyPairId: expect.anything(),
      signature: expect.anything()
    });
    const url = `https://${ENV}.images.${SUBDOMAIN}.stepinto.io/${getInfo.userId}/${TEST_IMAGE_FILENAME}?Policy=${getInfo.policy}&` +
        `Signature=${getInfo.signature}&Key-Pair-Id=${getInfo.keyPairId}`;
    const getRequestContext = await playwright.request.newContext();
    const response = await getRequestContext.get(url);
    expect(response.ok()).toBeTruthy();
  });
});
