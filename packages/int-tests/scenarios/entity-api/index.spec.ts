import { test, expect } from '../authenticated-test';
import { EntityDTO } from '@grid-wolf/entity/lib/entity-dto';
import { randomUUID } from 'crypto'

test.describe('when managing entities', () => {
  let entityId1: string;
  let entityId2: string;
  let entity1: EntityDTO;
  let entity2: EntityDTO;
  let timestamp: number;

  test.beforeAll(() => {
    entityId1 = randomUUID();
    entityId2 = randomUUID();
    timestamp = new Date().getTime();
  });

  test.beforeEach(({ getAuthData }) => {
    entity1 = {
      entityId: entityId1,
      ownerId: getAuthData().users[0].userId,
      name: 'test-entity-1',
      maxHealth: 10,
      movementSpeed: 30,
      attributes: [],
      timestamp,
      active: true
    };
    entity2 = {
      entityId: entityId2,
      ownerId: getAuthData().users[0].userId,
      name: 'test-entity-2',
      maxHealth: 10,
      movementSpeed: 30,
      attributes: [{
        name: 'attack',
        value: 10
      }],
      timestamp,
      active: true
    }
  });

  test('authenticated users can save entity data', async ({ request, getAuthData }) => {
    const response = await request.put('./entity', {
      headers: { 'x-api-key': getAuthData().apiKey.entity },
      data: entity1
    });
    expect(response.ok()).toBeTruthy();
  });

  test('users cannot save invalid entity data', async ({ request, getAuthData }) => {
    const invalid = {
      ...entity1,
      badField: 'bad'
    };
    const response = await request.put('./entity', {
      headers: { 'x-api-key': getAuthData().apiKey.entity },
      data: invalid
    });
    expect(response.ok()).toBeFalsy();
  });

  test('users cannot save entity data owned by another user', async ({ request, getAuthData }) => {
    entity1.ownerId = 'somebody-else';
    const response = await request.put('./entity', {
      headers: { 'x-api-key': getAuthData().apiKey.entity },
      data: entity1
    });
    expect(response.ok()).toBeFalsy();
  });

  test('authenticated users can retrieve saved entity data', async ({ request, getAuthData }) => {
    const response = await request.get(`./entity/${entityId1}`, {
      headers: { 'x-api-key': getAuthData().apiKey.entity }
    });
    expect(await response.json()).toEqual(entity1);
  });
  
  test('authenticated users receive "access denied" when requesting non-existent entity data', async ({ request, getAuthData }) => {
    const response = await request.get(`./entity/not-a-entity`, {
      headers: { 'x-api-key': getAuthData().apiKey.entity }
    });
    expect(await response.status()).toBe(403);
  });

  test('authenticated users can retrieve a list of entitys', async ({ request, getAuthData }) => {
    await request.put('./entity', {
      headers: { 'x-api-key': getAuthData().apiKey.entity },
      data: entity2
    });
    const response = await request.get('./entity/list', {
      headers: {
        'x-api-key': getAuthData().apiKey.entity
      }
    });
    expect((await response.json()).length).toBeGreaterThanOrEqual(2);
  });

  test('authenticated users can delete entitys they have created', async ({ request, getAuthData }) => {
    const existingEntitysResponse = await request.get('./entity/list', {
      headers: { 'x-api-key': getAuthData().apiKey.entity }
    });
    const existingEntitys = await existingEntitysResponse.json() as EntityDTO[];
    const promises = existingEntitys.map(async (entity: EntityDTO) => {
      await request.delete(`./entity/${entity.entityId}`, {
        headers: { 'x-api-key': getAuthData().apiKey.entity }
      });
    });
    await Promise.all(promises);
    const response = await request.get('./entity/list', {
      headers: { 'x-api-key': getAuthData().apiKey.entity }
    });
    // Other tests may add entitys in the meantime.  We're only concerned about ones that we deleted
    const failedDelete = (await response.json() as EntityDTO[])
      .filter(entity => existingEntitys.some(existing => existing.entityId === entity.entityId));
    expect(failedDelete).toEqual([]);
  });

  test('authenticated users can attempt to delete non-existent entitys without error', async ({ request, getAuthData }) => {
    const response = await request.delete(`./entity/non-existent`, {
      headers: { 'x-api-key': getAuthData().apiKey.entity }
    });
    expect(response.ok()).toBeTruthy();
  });
});
