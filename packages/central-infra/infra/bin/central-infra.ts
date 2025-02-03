#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';
import { CentralInfraStack, CentralInfraStackProps } from '../lib/central-infra-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils'

config({ path: [ '../../.env.local', '../../.env.dev', '../../.env']});

const envMap = loadEnv([
  EnvironmentVariableName.DATA_TABLE_NAME,
  EnvironmentVariableName.HOSTED_ZONE,
  EnvironmentVariableName.API_CERTIFICATE_ARN
]);
const app = new cdk.App();

const props: CentralInfraStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: envMap[EnvironmentVariableName.DATA_TABLE_NAME],
  hostedZone: envMap[EnvironmentVariableName.HOSTED_ZONE],
  apiCertificateArn: envMap[EnvironmentVariableName.API_CERTIFICATE_ARN]
};
new CentralInfraStack(app, `${props.env.prefix}CentralInfraStack`, props);
