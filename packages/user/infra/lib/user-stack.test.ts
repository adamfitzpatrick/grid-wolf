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
      dataTableName: 'table',
      certificateArn: 'arn',
      hostedZone: 'zone',
      subdomain: 'subdomain'
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
    template.resourceCountIs('AWS::Route53::RecordSet', 2);
    template.hasResourceProperties('AWS::Cognito::UserPoolDomain', {
      Domain: Match.stringLikeRegexp('auth.subdomain.zone')
    });
  });

  test('should create a REST API and related handler', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Body: {
        paths: {
          '/player-game/{gameId}': Match.anyValue(),
          '/player-game/{gameId}/{participantAction}': Match.anyValue(),
          '/player-game/list': Match.anyValue()
        }
      }
    });
  });

  test('should add a base path mapping', () => {
    template.hasResourceProperties('AWS::ApiGateway::BasePathMapping', {});
  });

  test('should create a user event handler', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: Match.stringLikeRegexp('event-handler')
    });
  });
});
