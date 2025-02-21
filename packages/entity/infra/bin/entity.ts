#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EntityStack, EntityStackProps } from '../lib/entity-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { config } from 'dotenv';

config({ path: [ '../../.env.local', '../../.env.dev', '../../.env']});

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME,
  EnvironmentVariableName.HOSTED_ZONE,
  EnvironmentVariableName.API_CERTIFICATE_ARN,
  EnvironmentVariableName.APP_SUBDOMAIN
]);
const app = new cdk.App();

const props: EntityStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: process.env[EnvironmentVariableName.DATA_TABLE_NAME]!,
  hostedZone: envMap[EnvironmentVariableName.HOSTED_ZONE],
  subdomain: envMap[EnvironmentVariableName.APP_SUBDOMAIN]
};
new EntityStack(app, `${props.env.prefix}EntityStack`, props);
