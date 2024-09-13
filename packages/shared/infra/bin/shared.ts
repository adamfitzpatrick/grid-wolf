#!/usr/bin/env node
import 'source-map-support/register';
import { App }from 'aws-cdk-lib';
import { SharedStack } from '../lib/shared-stack';
import { loadEnv, EnvironmentVariableName } from '../../utils'
import { GridWolfProps } from '../../domain/';

const envMap = loadEnv();
const app = new App();

const props: GridWolfProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  }
};
new SharedStack(app, `${props.env.prefix}SharedStack`, props);
