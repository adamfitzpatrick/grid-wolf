#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GameStack, GameStackProps } from '../lib/game-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME
]);
const app = new cdk.App();

const props: GameStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: process.env[EnvironmentVariableName.DATA_TABLE_NAME]!
};
new GameStack(app, `${props.env.prefix}GameStack`, props);
