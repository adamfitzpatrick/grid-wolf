#!/usr/bin/env node
import 'source-map-support/register';
import { App }from 'aws-cdk-lib';
import { LibraryStack } from '../lib/library-stack';
import { loadEnv, EnvironmentVariableName } from '../../utils'
import { GridWolfStackProps } from '../../constructs/grid-wolf-stack';

const envMap = loadEnv([
  EnvironmentVariableName.ACCOUNT,
  EnvironmentVariableName.REGION,
  EnvironmentVariableName.PREFIX
]);
const app = new App();

const props: GridWolfStackProps = {
  env: {
    account: envMap[EnvironmentVariableName.ACCOUNT],
    region: envMap[EnvironmentVariableName.REGION],
    prefix: envMap[EnvironmentVariableName.PREFIX]
  }
};
new LibraryStack(app, 'LibraryStack', props);
