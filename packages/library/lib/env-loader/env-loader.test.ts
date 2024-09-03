import { loadEnv, EnvironmentVariableName } from '.';

describe('loadEnv utility function', () => {
  let oldProcessEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    process.env[EnvironmentVariableName.ACCOUNT] = 'account',
      process.env[EnvironmentVariableName.REGION] = 'region',
      process.env[EnvironmentVariableName.PREFIX] = 'tst'
  });


  test('should load all require environment variable for a given lambda', () => {
    expect(loadEnv([
      EnvironmentVariableName.ACCOUNT,
      EnvironmentVariableName.PREFIX
    ])).toEqual({
      [EnvironmentVariableName.ACCOUNT]: 'account',
      [EnvironmentVariableName.PREFIX]: 'tst'
    });
    expect(loadEnv([
      EnvironmentVariableName.ACCOUNT,
      EnvironmentVariableName.REGION,
      EnvironmentVariableName.PREFIX
    ])).toEqual({
      [EnvironmentVariableName.ACCOUNT]: 'account',
      [EnvironmentVariableName.REGION]: 'region',
      [EnvironmentVariableName.PREFIX]: 'tst'
    });
  });

  test('should throw an error if any required environment variable is not available', () => {
    delete process.env[EnvironmentVariableName.ACCOUNT];
    expect(() => loadEnv([EnvironmentVariableName.ACCOUNT]))
      .toThrow();
  });
});
