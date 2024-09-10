#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CentralInfraStack, CentralInfraStackProps } from '../lib/central-infra-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils'
import { GridWolfStackProps } from '@grid-wolf/shared/constructs';

const envMap = loadEnv([EnvironmentVariableName.DATA_TABLE_NAME]);
const app = new cdk.App();

const props: CentralInfraStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  },
  dataTableName: EnvironmentVariableName.DATA_TABLE_NAME
};
new CentralInfraStack(app, `${props.env.prefix}CentralInfraStack`, props);
