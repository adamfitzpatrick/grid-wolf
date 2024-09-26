#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MapStack, MapStackProps } from '../lib/map-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME,
  EnvironmentVariableName.DEPLOY_SECRETS_ARN
]);
const app = new cdk.App();

const props: MapStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: envMap[EnvironmentVariableName.DATA_TABLE_NAME],
  deploySecretsArn: envMap[EnvironmentVariableName.DEPLOY_SECRETS_ARN]
};
new MapStack(app, `${props.env.prefix}MapStack`, props);
