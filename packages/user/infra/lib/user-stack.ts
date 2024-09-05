import { GridWolfStack, GridWolfStackProps } from "@grid-wolf/shared/constructs";
import { Duration } from "aws-cdk-lib";
import { AccountRecovery, CfnUserPoolUser, OAuthScope, UserPool, UserPoolClient, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export interface UserStackProps extends GridWolfStackProps {
  domain: string;
}

export class UserStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: UserStackProps) {
    super(scope, id, props);

    const unique = (part: string) => `${this.appName}-user-${part}`
    const userPool = new UserPool(this, this.generateId(unique('pool')), {
      accountRecovery: AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
      deletionProtection: true,
      deviceTracking: {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: true
      },
      signInAliases: {
        email: true
      },
      userPoolName: this.generateName(unique('pool')),
      passwordPolicy: {
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false
      }
    });

    new UserPoolClient(this, this.generateId(unique('client')), {
      userPool,
      userPoolClientName: this.generateName(unique('client')),
      accessTokenValidity: Duration.hours(24),
      enableTokenRevocation: true,
      generateSecret: false,
      preventUserExistenceErrors: true,
      oAuth: {
        flows: {
          implicitCodeGrant: true
        },
        scopes: [ OAuthScope.OPENID ],
        callbackUrls: [ 'http://localhost:3100' ]
      }
    });

    new UserPoolDomain(this, this.generateId(unique('domain')), {
      userPool,
      cognitoDomain: {
        domainPrefix: this.generateName('grid-wolf-stepinto')
      }
    });
  }
}
