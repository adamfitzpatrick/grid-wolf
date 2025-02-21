import { test as setup, expect, Page } from '@playwright/test'
import { EnvironmentVariableName } from '@grid-wolf/shared/utils'
import { resolve } from 'path';
import { setAuthData, getAuthData } from './authenticated-test';

export const AUTH_FILE_PATH = resolve(__dirname, '../auth');

const USERNAME       = process.env[EnvironmentVariableName.INT_TEST_USERNAME]!;
const PASSWORD       = process.env[EnvironmentVariableName.INT_TEST_PASSWORD]!;
const USER_ID        = process.env[EnvironmentVariableName.INT_TEST_USER_ID]!;
const USERNAME_2     = process.env[EnvironmentVariableName.INT_TEST_USERNAME_2]!;
const PASSWORD_2     = process.env[EnvironmentVariableName.INT_TEST_PASSWORD_2]!;
const USER_ID_2      = process.env[EnvironmentVariableName.INT_TEST_USER_ID_2]!;
const GAME_API_KEY   = process.env[EnvironmentVariableName.INT_TEST_GAME_API_KEY]!;
const MAP_API_KEY    = process.env[EnvironmentVariableName.INT_TEST_MAP_API_KEY]!;
const USER_API_KEY   = process.env[EnvironmentVariableName.INT_TEST_USER_API_KEY]!;
const ENTITY_API_KEY = process.env[EnvironmentVariableName.INT_TEST_ENTITY_API_KEY]!;
const AUTH_HOST      = process.env[EnvironmentVariableName.USER_AUTH_DOMAIN]!;
const CLIENT_ID      = process.env[EnvironmentVariableName.USER_AUTH_CLIENT_ID]!;
const REDIRECT_URI   = process.env[EnvironmentVariableName.USER_AUTH_REDIRECT_URI]!;
const LOGIN_PATH     = '/login';
const RESPONSE_TYPE  = 'token'
const SCOPE          = 'openid'

const doLogin = async (page: Page, username: string, password: string) => {
  const loginUrl = `https://dev.${AUTH_HOST}${LOGIN_PATH}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}` +
    `&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`;
  await page.goto(loginUrl);
  await page.locator('.modal-content.visible-md').getByRole('textbox', { name: 'name@host.com' }).fill(username);
  await page.locator('.modal-content.visible-md').getByRole('textbox', { name: 'password' }).fill(password);
  await page.getByRole('button', { name: 'submit' }).click();
  await page.waitForURL(`${REDIRECT_URI}/*`)
  
  const url = new URL(page.url());
  const searchParamsFromHash = new URLSearchParams(url.hash.replace(/^#/, ''));

  return searchParamsFromHash.get('access_token')!;
};

setup('set API keys', async () => {
  setAuthData({
    users: [],
    apiKey: {
      game: GAME_API_KEY,
      map: MAP_API_KEY,
      user: USER_API_KEY,
      entity: ENTITY_API_KEY
    }
  });
});

setup('authenticate user 1', async ({ page }) => {
  const existingAuthData = getAuthData();
  const accessToken = await doLogin(page, USERNAME, PASSWORD);
  expect(accessToken).not.toBeNull();

  const users = existingAuthData.users || [];
  setAuthData({
    ...existingAuthData,
    users: users.concat({
      userId: USER_ID,
      username: USERNAME,
      password: PASSWORD,
      accessToken,
    })
  });
});

setup('authenticate user 2', async ({ page }) => {
  const existingAuthData = getAuthData();
  const accessToken = await doLogin(page, USERNAME_2, PASSWORD_2);
  expect(accessToken).not.toBeNull();

  const users = existingAuthData.users || [];
  setAuthData({
    ...existingAuthData,
    users: users.concat({
      userId: USER_ID_2,
      username: USERNAME_2,
      password: PASSWORD_2,
      accessToken
    })
  })
});
