import { GridWolfStack, parameterNames } from "@grid-wolf/shared/constructs";
import { GridWolfProps } from "@grid-wolf/shared/domain";
import { Duration } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { AccountRecovery, OAuthScope, UserPool, UserPoolClient, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { HostedZone, RecordSet, RecordTarget, RecordType } from "aws-cdk-lib/aws-route53";
import { UserPoolDomainTarget } from "aws-cdk-lib/aws-route53-targets";
import { ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

const SUBDOMAIN_PART = 'auth';

export interface UserStackProps extends GridWolfProps {
  certificateArn: string;
  hostedZone: string;
  subdomain: string;
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
      userPoolName: this.generateName('user-pool'),
      passwordPolicy: {
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false
      }
    });

    new UserPoolClient(this, this.generateId(unique('client')), {
      userPool,
      userPoolClientName: this.generateName('user-client'),
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

    const zone = HostedZone.fromLookup(this, this.generateId('zone'), {
      domainName: props.hostedZone
    });
    let domainName = `${SUBDOMAIN_PART}.${props.subdomain}.${props.hostedZone}`;
    if (props.env.prefix !== 'prd') {
      domainName = `${props.env.prefix}.${domainName}`;
    }
    const certificate = Certificate.fromCertificateArn(this, this.generateId('cert'), props.certificateArn);
    const userPoolDomain = new UserPoolDomain(this, this.generateId(unique('domain')), {
      userPool,
      customDomain: {
        domainName,
        certificate
      }
    });
    new RecordSet(this, this.generateId('arecord'), {
      zone,
      recordType: RecordType.A,
      recordName: domainName,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain))
    });
    new RecordSet(this, this.generateId('aaaarecord'), {
      zone,
      recordType: RecordType.AAAA,
      recordName: domainName,
      target: RecordTarget.fromAlias(new UserPoolDomainTarget(userPoolDomain))
    });

    new StringParameter(this, this.generateId('pool-arn'), {
      parameterName: `/${props.env.prefix}${parameterNames.USER_POOL_ARN}`,
      stringValue: userPool.userPoolArn,
      tier: ParameterTier.STANDARD
    });
  }
}
