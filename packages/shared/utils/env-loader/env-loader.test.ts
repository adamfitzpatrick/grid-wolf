import { loadEnv, EnvironmentVariableName } from '.';

describe('loadEnv utility function', () => {

  beforeEach(() => {
    process.env[EnvironmentVariableName.ACCOUNT] = 'account';
    process.env[EnvironmentVariableName.REGION] = 'region';
    process.env[EnvironmentVariableName.PREFIX] = 'tst';
    process.env[EnvironmentVariableName.USER_AUTH_DOMAIN] = 'domain';
    process.env[EnvironmentVariableName.DATA_TABLE_NAME] = 'table';
  });


  test('should load all require environment variable for a given lambda', () => {
    expect(loadEnv([
      EnvironmentVariableName.USER_AUTH_DOMAIN,
    ])).toEqual({
      [EnvironmentVariableName.ACCOUNT]: 'account',
      [EnvironmentVariableName.REGION]: 'region',
      [EnvironmentVariableName.PREFIX]: 'tst',
      [EnvironmentVariableName.USER_AUTH_DOMAIN]: 'domain'
    });
    expect(loadEnv([
      EnvironmentVariableName.USER_AUTH_DOMAIN,
      EnvironmentVariableName.DATA_TABLE_NAME
    ])).toEqual({
      [EnvironmentVariableName.ACCOUNT]: 'account',
      [EnvironmentVariableName.REGION]: 'region',
      [EnvironmentVariableName.PREFIX]: 'tst',
      [EnvironmentVariableName.USER_AUTH_DOMAIN]: 'domain',
      [EnvironmentVariableName.DATA_TABLE_NAME]: 'table'
    });
  });

  test('should load standard environment vars if none are specified', () => {
    expect(loadEnv()).toEqual({
      [EnvironmentVariableName.ACCOUNT]: 'account',
      [EnvironmentVariableName.REGION]: 'region',
      [EnvironmentVariableName.PREFIX]: 'tst'
    })
  });

  test('should throw an error if any required environment variable is not available', () => {
    delete process.env[EnvironmentVariableName.DATA_TABLE_NAME];
    expect(() => loadEnv([EnvironmentVariableName.DATA_TABLE_NAME])).toThrow();
    delete process.env[EnvironmentVariableName.ACCOUNT];
    expect(() => loadEnv()).toThrow();
  });
});
