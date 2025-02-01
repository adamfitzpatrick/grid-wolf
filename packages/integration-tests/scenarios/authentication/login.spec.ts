import { test, expect } from '../authenticated-test';
import jwt from 'jsonwebtoken';

test('can obtain an access token for a pre-defined user', async ({ page, getAuthData }) => {
  const authData = getAuthData()!;
  expect(authData).toEqual({
    username: expect.anything(),
    password: expect.anything(),
    userId: expect.anything(),
    accessToken: expect.stringMatching(/.+/),
    apiKey: expect.anything()
  });
  expect(jwt.decode(authData.accessToken)).toHaveProperty('username', authData.userId);
});
