import { UserStack, UserStackProps } from './user-stack';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';

describe('UserStack', () => {
  let props: UserStackProps;
  let template: Template;

  beforeEach(() => {
    props = {
      env: {
        account: 'account',
        region: 'region',
        prefix: 'tst'
      },
      domain: 'domain'
    };
    const app = new App();
    const stack = new UserStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a cognito user pool', () => {
    template.hasResourceProperties('AWS::Cognito::UserPool', {
      AccountRecoverySetting: {
        RecoveryMechanisms: [{
          Name: 'verified_email',
        }, {
          Name: 'verified_phone_number'
        }]
      },
      DeletionProtection: 'ACTIVE',
      DeviceConfiguration: {
        ChallengeRequiredOnNewDevice: true,
        DeviceOnlyRememberedOnUserPrompt: true
      },
      UserPoolName: 'tst-grid-wolf-user-pool'
    });
  });

  test('should create user pool client', () => {
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
      AccessTokenValidity : 1440,
      AllowedOAuthFlows : [ 'implicit' ],
      AllowedOAuthFlowsUserPoolClient : true,
      AllowedOAuthScopes : [ 'openid' ],
      CallbackURLs : [ 'http://localhost:3100' ],
      ClientName : 'tst-grid-wolf-user-client',
      EnableTokenRevocation : true,
      GenerateSecret : false,
      PreventUserExistenceErrors : 'ENABLED',
      TokenValidityUnits : {
        AccessToken: 'minutes'
      }
    });
  });

  test('should create user pool domain', () => {
    template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
      Domain: Match.stringLikeRegexp('tst-grid-wolf-stepinto')
    });
  });
});
