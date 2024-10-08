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
  ACCOUNT                   = 'GRID_WOLF_COMMON_TARGET_ACCOUNT_ID',
  REGION                    = 'GRID_WOLF_COMMON_TARGET_REGION',
  PREFIX                    = 'GRID_WOLF_COMMON_TARGET_ENV_PREFIX',
  USER_AUTH_DOMAIN          = 'GRID_WOLF_USER_AUTH_DOMAIN',
  DATA_TABLE_NAME           = 'GRID_WOLF_DYNAMO_DATA_TABLE_NAME',
  IMAGE_BUCKET_NAME         = 'GRID_WOLF_IMAGE_BUCKET_NAME',
  DEPLOY_SECRETS_ARN        = 'GRID_WOLF_DEPLOY_SECRETS_ARN',
  CDN_HOST                  = 'GRID_WOLF_CDN_HOST',
  CDN_PRIVATE_KEY_SECRET_ID = 'GRID_WOLF_CDN_PRIVATE_KEY_SECRET_ID',
  CDN_PUBLIC_KEY_ID         = 'GRID_WOLF_CDN_PUBLIC_KEY_ID'
}

const standardEnvironmentVars = [
  EnvironmentVariableName.ACCOUNT,
  EnvironmentVariableName.REGION,
  EnvironmentVariableName.PREFIX
]

interface EnvironmentMap {
  [key: string]: string
}

export function loadEnv(variableNames?: EnvironmentVariableName[]) {
  let envMap: EnvironmentMap = {};
  let errors = [];
  const names = standardEnvironmentVars.concat(variableNames || []);
  
  names.forEach(envVar => {
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
