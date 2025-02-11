import { test as setup, expect } from '@playwright/test'
import { EnvironmentVariableName } from '@grid-wolf/shared/utils'
import { resolve } from 'path';
import { setAuthData } from './authenticated-test';

export const AUTH_FILE_PATH = resolve(__dirname, '../auth');

const USERNAME      = process.env[EnvironmentVariableName.INT_TEST_USERNAME]!;
const PASSWORD      = process.env[EnvironmentVariableName.INT_TEST_PASSWORD]!;
const USER_ID       = process.env[EnvironmentVariableName.INT_TEST_USER_ID]!;
const GAME_API_KEY  = process.env[EnvironmentVariableName.INT_TEST_GAME_API_KEY]!;
const MAP_API_KEY   = process.env[EnvironmentVariableName.INT_TEST_MAP_API_KEY]!;
const AUTH_HOST     = process.env[EnvironmentVariableName.USER_AUTH_DOMAIN]!;
const LOGIN_PATH    = '/login';
const CLIENT_ID     = process.env[EnvironmentVariableName.USER_AUTH_CLIENT_ID]!;
const REDIRECT_URI  = process.env[EnvironmentVariableName.USER_AUTH_REDIRECT_URI]!;
const RESPONSE_TYPE = 'token'
const SCOPE         = 'openid'

setup('authenticate', async ({ page }) => {
  const loginUrl = `https://dev.${AUTH_HOST}${LOGIN_PATH}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}` +
    `&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`;
  await page.goto(loginUrl);
  await page.locator('.modal-content.visible-md').getByRole('textbox', { name: 'name@host.com' }).fill(USERNAME);
  await page.locator('.modal-content.visible-md').getByRole('textbox', { name: 'password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'submit' }).click();
  await page.waitForURL(`${REDIRECT_URI}/*`)
  
  const url = new URL(page.url());
  const searchParamsFromHash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const accessToken = searchParamsFromHash.get('access_token')!;
  expect(accessToken).not.toBeNull();

  setAuthData({
    userId: USER_ID,
    username: USERNAME,
    password: PASSWORD,
    accessToken,
    apiKey: {
      game: GAME_API_KEY,
      map: MAP_API_KEY
    }
  });
});
