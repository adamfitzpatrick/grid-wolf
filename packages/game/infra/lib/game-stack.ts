import { parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from 'stepinto-aws-tools/constructs';
import { CfnBasePathMapping } from "aws-cdk-lib/aws-apigateway";
import { StepintoBaseProps, StepintoBaseStack } from 'stepinto-aws-tools/constructs';
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { EnvironmentVariableName } from "stepinto-aws-tools/utils";
import { EventBus, Rule } from "aws-cdk-lib/aws-events";
import { invitationUpdateDetailType } from "../../lib/game-event";
import { LambdaFunction as LambdaFunctionTarget} from 'aws-cdk-lib/aws-events-targets';

const APP_NAME = 'grid-wolf-game';
const BASE_PATH = 'game';
const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib/game-handler');
const EVENT_HANDLER_PATH = resolve(__dirname, '../../lib/game-event-handler');
const API_SUBDOMAIN_PART = 'api';

export interface GameStackProps extends Omit<StepintoBaseProps, 'appName'> {
  dataTableName: string;
  hostedZone: string;
  subdomain: string;
}

export class GameStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: GameStackProps) {
    super(scope, id, { appName: APP_NAME, ...props });

    const userPoolArn = StringParameter.valueForStringParameter(this, `/${props.env.prefix}${parameterNames.USER_POOL_ARN}`);
    const eventBusArn = StringParameter.valueForStringParameter(this, `/${props.env.prefix}${parameterNames.EVENT_BUS_ARN}`);
    const eventBus = EventBus.fromEventBusArn(this, this.generateId('event-bus'), eventBusArn);
    const eventsPolicy = new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'events:PutEvents'
        ],
        resources: [
          eventBusArn
        ]
      });
    const api = new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      appName: this.appName,
      constructName: 'api',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      usesSecrets: false,
      handler: 'index.handler',
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler',
      additionalEnvironmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'error',
        EVENT_BUS: eventBusArn
      },
      layers: {},
      userPoolArn,
      additionalHandlerPolicies: [ eventsPolicy ]
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
            'dynamodb:PutItem',
            'dynamodb:GetItem'
          ],
          resources: [`arn:aws:dynamodb:${props.env.region}:${props.env.account}:table/${props.env.prefix}-${props.dataTableName}`]
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
    const eventHandler = new LambdaFunction(this, this.generateId('event-handler'), {
      functionName: this.generateName('event-handler'),
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset(EVENT_HANDLER_PATH),
      handler: 'index.handler',
      role,
      environment: {
        EVENT_BUS: eventBusArn,
        [EnvironmentVariableName.DATA_TABLE_NAME]: `${props.env.prefix}-${props.dataTableName}`
      },
    });
    new Rule(this, this.generateId('rule'), {
      eventBus,
      eventPattern: {
        detailType: [invitationUpdateDetailType]
      },
      targets: [new LambdaFunctionTarget(eventHandler, {})]
    })
  }
}
