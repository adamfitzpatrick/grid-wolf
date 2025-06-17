import { EnvironmentVariableName as StandardEnvironment } from "stepinto-aws-tools/utils";
import { loadEnv, FunctionalEnvironmentVariableName } from ".";

describe("loadEnv utility function", () => {
  beforeEach(() => {
    process.env[StandardEnvironment.ACCOUNT] = "account";
    process.env[StandardEnvironment.REGION] = "region";
    process.env[StandardEnvironment.PREFIX] = "tst";
    process.env[FunctionalEnvironmentVariableName.HOSTED_ZONE] = "zone";
    process.env[FunctionalEnvironmentVariableName.DATA_TABLE_NAME] = "table";
  });

  test("should load all require environment variable for a given lambda", () => {
    expect(
      loadEnv<FunctionalEnvironmentVariableName>([FunctionalEnvironmentVariableName.HOSTED_ZONE])
    ).toEqual({
      [StandardEnvironment.ACCOUNT]: "account",
      [StandardEnvironment.REGION]: "region",
      [StandardEnvironment.PREFIX]: "tst",
      [FunctionalEnvironmentVariableName.HOSTED_ZONE]: "zone",
    });
    expect(
      loadEnv<FunctionalEnvironmentVariableName>([
        FunctionalEnvironmentVariableName.HOSTED_ZONE,
        FunctionalEnvironmentVariableName.DATA_TABLE_NAME,
      ])
    ).toEqual({
      [StandardEnvironment.ACCOUNT]: "account",
      [StandardEnvironment.REGION]: "region",
      [StandardEnvironment.PREFIX]: "tst",
      [FunctionalEnvironmentVariableName.HOSTED_ZONE]: "zone",
      [FunctionalEnvironmentVariableName.DATA_TABLE_NAME]: "table",
    });
  });

  test("should load standard environment vars if none are specified", () => {
    expect(loadEnv<FunctionalEnvironmentVariableName>()).toEqual({
      [StandardEnvironment.ACCOUNT]: "account",
      [StandardEnvironment.REGION]: "region",
      [StandardEnvironment.PREFIX]: "tst",
    });
  });

  test("should throw an error if any required environment variable is not available", () => {
    delete process.env[FunctionalEnvironmentVariableName.DATA_TABLE_NAME];
    expect(() =>
      loadEnv<FunctionalEnvironmentVariableName>([
        FunctionalEnvironmentVariableName.DATA_TABLE_NAME,
      ])
    ).toThrow();
    delete process.env[StandardEnvironment.ACCOUNT];
    expect(() => loadEnv<FunctionalEnvironmentVariableName>()).toThrow();
  });
});
