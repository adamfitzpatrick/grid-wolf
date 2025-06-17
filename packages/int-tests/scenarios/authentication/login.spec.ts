import { test, expect } from '../authenticated-test';
import jwt from 'jsonwebtoken';

test('can obtain an access token for a pre-defined user', async ({ page, getAuthData }) => {
  const authData = getAuthData()!;
  expect(authData).toEqual({
    users: [{
      username: expect.anything(),
      password: expect.anything(),
      userId: expect.anything(),
      accessToken: expect.stringMatching(/.+/),
    }, {
      username: expect.anything(),
      password: expect.anything(),
      userId: expect.anything(),
      accessToken: expect.stringMatching(/.+/),
    }],
    apiKey: expect.anything()
  });
  expect(jwt.decode(authData.users[0].accessToken)).toHaveProperty('username', authData.users[0].userId);
  expect(jwt.decode(authData.users[1].accessToken)).toHaveProperty('username', authData.users[1].userId);
});
