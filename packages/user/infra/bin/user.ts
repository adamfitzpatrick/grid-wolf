import { App } from 'aws-cdk-lib';
import { loadEnv, EnvironmentVariableName } from '@grid-wolf/shared/utils';
import { UserStack, UserStackProps } from '../lib/user-stack';

const environmentVars = loadEnv([
  EnvironmentVariableName.USER_AUTH_DOMAIN,
  EnvironmentVariableName.USER_POOL_CERTIFICATE_ARN,
  EnvironmentVariableName.APP_SUBDOMAIN,
  EnvironmentVariableName.HOSTED_ZONE
]);

const props: UserStackProps = {
  env: {
    account: environmentVars[EnvironmentVariableName.ACCOUNT],
    region: environmentVars[EnvironmentVariableName.REGION],
    prefix: environmentVars[EnvironmentVariableName.PREFIX]
  },
  certificateArn: environmentVars[EnvironmentVariableName.USER_POOL_CERTIFICATE_ARN],
  hostedZone: environmentVars[EnvironmentVariableName.HOSTED_ZONE],
  subdomain: environmentVars[EnvironmentVariableName.APP_SUBDOMAIN]
};

const app = new App();
new UserStack(app, `${props.env.prefix}UserStack`, props);
