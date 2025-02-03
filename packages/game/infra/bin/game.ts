#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GameStack, GameStackProps } from '../lib/game-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { config } from 'dotenv';

config({ path: [ '../../.env.local', '../../.env.dev', '../../.env']});

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME,
  EnvironmentVariableName.HOSTED_ZONE,
  EnvironmentVariableName.API_CERTIFICATE_ARN
]);
const app = new cdk.App();

const props: GameStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: process.env[EnvironmentVariableName.DATA_TABLE_NAME]!,
  hostedZone: envMap[EnvironmentVariableName.HOSTED_ZONE]
};
new GameStack(app, `${props.env.prefix}GameStack`, props);
