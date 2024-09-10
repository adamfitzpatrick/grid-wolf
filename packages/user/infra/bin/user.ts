import { App } from 'aws-cdk-lib';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { UserStack, UserStackProps } from '../lib/user-stack';

const environmentVars = loadEnv([
  EnvironmentVariableName.USER_AUTH_DOMAIN
]);

const props: UserStackProps = {
  env: {
    account: environmentVars[EnvironmentVariableName.ACCOUNT],
    region: environmentVars[EnvironmentVariableName.REGION],
    prefix: environmentVars[EnvironmentVariableName.PREFIX]
  },
  domain: environmentVars[EnvironmentVariableName.USER_AUTH_DOMAIN]
};

const app = new App();
new UserStack(app, `${props.env.prefix}UserStack`, props);
