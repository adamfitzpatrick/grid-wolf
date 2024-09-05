#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CentralInfraStack } from '../lib/central-infra-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils'
import { GridWolfStackProps } from '@grid-wolf/shared/constructs';

const envMap = loadEnv();
const app = new cdk.App();

const props: GridWolfStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  }
};
new CentralInfraStack(app, `${props.env.prefix}CentralInfraStack`, props);
