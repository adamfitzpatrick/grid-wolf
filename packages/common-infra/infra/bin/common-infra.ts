#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CommonInfraStack } from '../lib/common-infra-stack';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/library/environment'
import { GridWolfStackProps } from '@grid-wolf/constructs';

const envMap = loadEnv([
  EnvironmentVariableName.ACCOUNT,
  EnvironmentVariableName.REGION,
  EnvironmentVariableName.PREFIX
]);
const app = new cdk.App();

const props: GridWolfStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  }
};
new CommonInfraStack(app, 'CommonInfraStack', props);
