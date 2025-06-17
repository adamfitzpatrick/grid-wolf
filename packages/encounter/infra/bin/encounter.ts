#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EncounterStack, EncounterStackProps } from '../lib/encounter-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { config } from 'dotenv';

config({ path: [ '../../.env.local', '../../.env.dev', '../../.env']});

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME,
  EnvironmentVariableName.HOSTED_ZONE,
  EnvironmentVariableName.APP_SUBDOMAIN
]);
const app = new cdk.App();

const props: EncounterStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: process.env[EnvironmentVariableName.DATA_TABLE_NAME]!,
  hostedZone: envMap[EnvironmentVariableName.HOSTED_ZONE],
  subdomain: envMap[EnvironmentVariableName.APP_SUBDOMAIN]
};
new EncounterStack(app, `${props.env.prefix}EncounterStack`, props);
