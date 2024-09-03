import { config } from 'dotenv';
import { resolve } from 'path';

const ENV_PATH = resolve(__dirname, '../../../../');
config({
  path: [
    resolve(ENV_PATH, '.env.local'),
    resolve(ENV_PATH, '.env')
  ]
});

export enum EnvironmentVariableName {
  ACCOUNT = 'GRID_WOLF_COMMON_TARGET_ACCOUNT_ID',
  REGION = 'GRID_WOLF_COMMON_TARGET_REGION',
  PREFIX = 'GRID_WOLF_COMMON_TARGET_ENV_PREFIX'
}

interface EnvironmentMap {
  [key: string]: string
}

export function loadEnv(variableName: EnvironmentVariableName[]) {
  let envMap: EnvironmentMap = {};
  let errors = [];

  variableName.forEach(envVar => {
    envMap[envVar] = process.env[envVar]!
    if (!envMap[envVar]) { errors.push(envVar) }
  });

  checkEnvironment(envMap);
  return envMap;
}

function checkEnvironment(envMap: EnvironmentMap) {
  const message = Object.keys(envMap).reduce((missing, current) => {
    if (!envMap[current]) { missing = `${current}, ${missing}` };
    return missing;
  }, '');
  if (message.length > 0) {
    throw new Error(`${message} environment value cannot be found`);
  }
}
