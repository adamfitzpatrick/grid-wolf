import { EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { APIRequestContext, test as base, expect } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const AUTH_FILE_PATH = resolve(__dirname, './.auth.json');
const API_DOMAIN = process.env[EnvironmentVariableName.API_DOMAIN];
const API_BASE_URL = `https://dev.${API_DOMAIN}`;

export interface ApiKeys {
  game: string;
  map: string;
  user: string;
}

export interface AuthData {
  username: string;
  password: string;
  userId: string;
  accessToken: string;
  idToken?: string;
  apiKey: ApiKeys
}

let _authData: AuthData | null;

export const setAuthData = (authData: AuthData) => {
  _authData = authData;
  writeFileSync(AUTH_FILE_PATH, JSON.stringify(authData));
}

export const getAuthData = (): AuthData => {
  if (!_authData) {
    _authData = JSON.parse(readFileSync(AUTH_FILE_PATH, 'utf-8'));
  }
  return _authData!;
}

interface AuthenticatedFixture {
  getAuthData: typeof getAuthData;
  request: APIRequestContext;
  keyedRequest: (keyName: keyof ApiKeys) => Promise<APIRequestContext>
}

const test = base.extend<AuthenticatedFixture>({
  getAuthData: async ({}, use) => {
    await use(getAuthData);
  },
  request: async ({ playwright }, use) => {
    const authenticatedRequest = await playwright.request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${getAuthData().accessToken}`,
        'content-type': 'application/json'
      }
    });
    await use(authenticatedRequest)
  }
});

export { test, expect }
