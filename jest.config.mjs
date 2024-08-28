export default async function () {
    return {
      testEnvironment: 'node',
      roots: ['<rootDir>/'],
      testMatch: ['**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      watchPathIgnorePatterns: [
        '<rootDir>/.+\.js$',
        '<rootDir>/.+\.d.ts$'
      ]
    }
  };
  