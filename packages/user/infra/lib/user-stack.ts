import { parameterNames } from "@grid-wolf/shared/constructs";
import { Duration } from "aws-cdk-lib";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { AccountRecovery, OAuthScope, UserPool, UserPoolClient, UserPoolDomain } from "aws-cdk-lib/aws-cognito";
import { HostedZone, RecordSet, RecordTarget, RecordType } from "aws-cdk-lib/aws-route53";
import { UserPoolDomainTarget } from "aws-cdk-lib/aws-route53-targets";
import { ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { StepintoBaseStack, StepintoBaseProps } from 'stepinto-aws-tools/constructs';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { resolve } from "path";
import { SingleHandlerApi } from 'stepinto-aws-tools/constructs';
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { LambdaFunction as LambdaFunctionTarget } from "aws-cdk-lib/aws-events-targets";
import { gameInviteDetailType } from "../../lib/user-event";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnBasePathMapping } from "aws-cdk-lib/aws-apigateway";

const APP_NAME = 'grid-wolf-user';
const BASE_PATH = 'user';
const API_SUBDOMAIN_PART = 'api';
const COGNITO_SUBDOMAIN_PART = 'auth';
const API_SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const API_HANDLER_PATH = resolve(__dirname, '../../lib/user-api-handler');
const EVENT_HANDLER_PATH = resolve(__dirname, '../../lib/user-event-handler');

export interface UserStackProps extends Omit<StepintoBaseProps, 'appName'> {
  dataTableName: string;
  certificateArn: string;
  hostedZone: string;
  subdomain: string;
}

export class UserStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: UserStackProps) {
    super(scope, id, { appName: APP_NAME, ...props });

    const userPool = this.createUserPool(props);
    this.createApi(props, userPool);
    this.createEventHandler(props, userPool);
  }

  createUserPool(props: UserStackProps) {
    const userPool = new UserPool(this, this.generateId('pool'), {
      accountRecovery: AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
      deletionProtection: true,
      deviceTracking: {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: true
      },
      signInAliases: {
        email: true
      },
      userPoolName: this.generateName('pool'),
      passwordPolicy: {
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: false
      }
    });

    new UserPoolClient(this, this.generateId('client'), {
      userPool,
      userPoolClientName: this.generateName('client'),
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
    let domainName = `${COGNITO_SUBDOMAIN_PART}.${props.subdomain}.${props.hostedZone}`;
    if (props.env.prefix !== 'prd') {
      domainName = `${props.env.prefix}.${domainName}`;
    }
    const certificate = Certificate.fromCertificateArn(this, this.generateId('cert'), props.certificateArn);
    const userPoolDomain = new UserPoolDomain(this, this.generateId('domain'), {
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
    return userPool
  }

  createApi(props: UserStackProps, userPool: UserPool) {
    const api = new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      appName: this.appName,
      constructName: 'api',
      apiSpecPath: API_SPEC_PATH,
      userPoolArn: userPool.userPoolArn,
      handlerPath: API_HANDLER_PATH,
      layers: {},
      handlerTemplateKey: 'handler',
      authArnTemplateKey: 'authArn'
    });

    let domainName = `${API_SUBDOMAIN_PART}.${props.subdomain}.${props.hostedZone}`;
    if (props.env.prefix !== 'prd') {
      domainName = `${props.env.prefix}.${domainName}`;
    }
    new CfnBasePathMapping(this, this.generateId('api-path-mapping'), {
      domainName,
      basePath: BASE_PATH,
      restApiId: api.getApi().restApiId,
      stage: api.getStage().stageName
    });
  }

  createEventHandler(props: UserStackProps, userPool: UserPool) {
    const eventBusArn = StringParameter.valueForStringParameter(this, `/${props.env.prefix}${parameterNames.EVENT_BUS_ARN}`);
    const eventBus = EventBus.fromEventBusArn(this, this.generateId('event-bus'), eventBusArn);

    const loggingPolicy = new PolicyDocument({
      statements: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ],
        resources: ['*']
      })]
    });
    const workingPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'dynamodb:PutItem'
          ],
          resources: [`arn:aws:dynamodb:${props.env.region}:${props.env.account}:table/${props.env.prefix}-${props.dataTableName}`]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'events:PutEvents'
          ],
          resources: [
            eventBusArn
          ]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'cognito-idp:AdminGetUser'
          ],
          resources: [
            userPool.userPoolArn
          ]
        })
      ]
    });
    const role = new Role(this, this.generateId('event-handler-role'), {
      roleName: this.generateName('event-handler-role'),
      inlinePolicies: {
        loggingPolicy,
        workingPolicy
      },
      assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    });
    const lambda = new LambdaFunction(this, this.generateId('event-handler'), {
      functionName: this.generateName('event-handler'),
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset(EVENT_HANDLER_PATH),
      handler: 'index.handler',
      role,
      environment: {
        EVENT_BUS: eventBusArn,
        [EnvironmentVariableName.DATA_TABLE_NAME]: `${props.env.prefix}-${props.dataTableName}`,
        USER_POOL: userPool.userPoolId
      },
    });

    new Rule(this, this.generateId('rule'), {
      eventBus,
      eventPattern: {
        detailType: [gameInviteDetailType]
      },
      targets: [new LambdaFunctionTarget(lambda, {})]
    });
  }
}
