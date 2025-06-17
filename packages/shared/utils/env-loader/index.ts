import {
  loadEnv as toolsLoadEnv,
  EnvironmentVariableName as StandardEnvironment,
} from "stepinto-aws-tools/utils";

export { EnvironmentVariableName as StandardEnvironment } from "stepinto-aws-tools/utils";

export enum FunctionalEnvironmentVariableName {
  HOSTED_ZONE = "GRID_WOLF_HOSTED_ZONE",
  API_CERTIFICATE_ARN = "GRID_WOLF_API_CERTIFICATE_ARN",
  CDN_CERTIFICATE_ARN = "GRID_WOLF_CDN_CERTIFICATE_ARN",
  USER_POOL_CERTIFICATE_ARN = "GRID_WOLF_USER_POOL_CERTIFICATE_ARN",
  APP_SUBDOMAIN = "GRID_WOLF_APP_SUBDOMAIN",
  SECRETS_ARN = "GRID_WOLF_SECRETS_ARN",
}

export enum IntegrationTestEnvironmentVariableName {
  USERNAME = "GRID_WOLF_INT_TEST_USERNAME",
  PASSWORD = "GRID_WOLF_INT_TEST_PASSWORD",
  USER_ID = "GRID_WOLF_INT_TEST_USER_ID",
  USERNAME_2 = "GRID_WOLF_INT_TEST_USERNAME_2",
  PASSWORD_2 = "GRID_WOLF_INT_TEST_PASSWORD_2",
  USER_ID_2 = "GRID_WOLF_INT_TEST_USER_ID_2",
  API_DOMAIN = "GRID_WOLF_INT_TEST_API_DOMAIN",
  USER_AUTH_DOMAIN = "GRID_WOLF_INT_TEST_USER_AUTH_DOMAIN",
  USER_AUTH_CLIENT_ID = "GRID_WOLF_INT_TEST_USER_AUTH_CLIENT_ID",
  USER_AUTH_REDIRECT_URI = "GRID_WOLF_INT_TEST_USER_AUTH_REDIRECT_URI",
  GAME_API_KEY = "GRID_WOLF_INT_TEST_GAME_API_KEY",
  MAP_API_KEY = "GRID_WOLF_INT_TEST_MAP_API_KEY",
  USER_API_KEY = "GRID_WOLF_INT_TEST_USER_API_KEY",
  ENTITY_API_KEY = "GRID_WOLF_INT_TEST_ENTITY_API_KEY",
  ENCOUNTER_API_KEY = "GRID_WOLF_INT_TEST_ENCOUNTER_API_KEY",
  AWS_SSO_PROFILE = "GRID_WOLF_INT_TEST_AWS_SSO_PROFILE",
}

export const LambdaEnvironmentVariableName = {
  SECRETS_EXT_LOG_LEVEL: "PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL",
  EVENT_BUS_ARN: "GRID_WOLF_EVENT_BUS_ARN",
  DATA_TABLE_NAME: StandardEnvironment.DATA_TABLE_NAME,
};

type EnvironmentVariable =
  StandardEnvironment
  | FunctionalEnvironmentVariableName
  | IntegrationTestEnvironmentVariableName;

export function loadEnv<E extends EnvironmentVariable>(variableNames?: E[]) {
  return toolsLoadEnv(variableNames);
}
