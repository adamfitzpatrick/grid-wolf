import { AccountEnvironment, generateNameGenerator, generateIdGenerator } from '.';

describe('naming-tools', () => {
  let env: AccountEnvironment;

  beforeEach(() => {
    env = {
      account: 'account',
      region: 'region',
      prefix: 'tst'
    };
  });

  test('should provide methods for consistent name generation', () => {
    expect(generateNameGenerator(env)('unique')).toBe('tst-unique');
  });

  test('should generate consistent environment-specific resource ID values', () => {
    expect(generateIdGenerator(env)('resource-id')).toBe('tstResourceId');
    expect(generateIdGenerator(env)('ResourceId')).toBe('tstResourceId');
  });
})
