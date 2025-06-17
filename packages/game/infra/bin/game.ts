#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GameStack, GameStackProps } from '../lib/game-stack';
import { loadEnv, StandardEnvironment, FunctionalEnvironmentVariableName } from '@grid-wolf/shared/utils';
import { config } from 'dotenv';

config({ path: [ '../../.env.local', '../../.env.dev', '../../.env']});

const envMap = loadEnv([
  StandardEnvironment.DATA_TABLE_NAME,
  FunctionalEnvironmentVariableName.HOSTED_ZONE,
  FunctionalEnvironmentVariableName.APP_SUBDOMAIN
]);
const app = new cdk.App();

const props: GameStackProps = {
  env: {
    account: envMap[StandardEnvironment.ACCOUNT],
    region: envMap[StandardEnvironment.REGION],
    prefix: envMap[StandardEnvironment.PREFIX]
  },
  dataTableName: process.env[StandardEnvironment.DATA_TABLE_NAME]!,
  hostedZone: envMap[FunctionalEnvironmentVariableName.HOSTED_ZONE],
  subdomain: envMap[FunctionalEnvironmentVariableName.APP_SUBDOMAIN]
};
new GameStack(app, `${props.env.prefix}GameStack`, props);
