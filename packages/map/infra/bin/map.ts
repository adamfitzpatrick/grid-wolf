#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';
import { MapStack, MapStackProps } from '../lib/map-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';

config({ path: [ '../../.env.local', '../../.env.dev', '../../.env']});

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME,
  EnvironmentVariableName.SECRETS_ARN,
  EnvironmentVariableName.HOSTED_ZONE,
  EnvironmentVariableName.APP_SUBDOMAIN,
  EnvironmentVariableName.CDN_CERTIFICATE_ARN
]);
const app = new cdk.App();

const props: MapStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: envMap[EnvironmentVariableName.DATA_TABLE_NAME],
  deploySecretsArn: envMap[EnvironmentVariableName.SECRETS_ARN],
  hostedZone: envMap[EnvironmentVariableName.HOSTED_ZONE],
  subdomain: envMap[EnvironmentVariableName.APP_SUBDOMAIN],
  cdnCertificate: envMap[EnvironmentVariableName.CDN_CERTIFICATE_ARN]
};
new MapStack(app, `${props.env.prefix}MapStack`, props);
