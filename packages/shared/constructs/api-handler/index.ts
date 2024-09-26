import { Construct } from "constructs";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function as LambdaFunction, LayerVersion, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { Duration, Fn } from "aws-cdk-lib";
import { parameterNames } from "..";
import { EnvironmentVariableName } from "../../utils";
import { GridWolfConstruct, GridWolfConstructProps } from "../grid-wolf-construct";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

const SECRETS_LAMBDA_EXTENSION_ARN =
  'arn:aws:lambda:us-west-2:345057560386:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12';

export interface ApiHandlerProps extends GridWolfConstructProps {
  handlerPath: string;
  dataTableName: string;
  additionalEnvironmentVariables?: { [key: string]: string };
  additionalHandlerPolicies?: PolicyStatement[]
}

export class ApiHandler extends GridWolfConstruct {
  private _lambda: LambdaFunction;

  constructor(scope: Construct, id: string, props: ApiHandlerProps) {
    super(scope, id, props);

    const loggingPolicy = new PolicyDocument({
      statements: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:DescribeLogStreams',
          'logs:PutLogEvents'
        ],
        resources: ['*']
      })]
    });
    const additionalPolicies = props.additionalHandlerPolicies || [];
    const statements = [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:Query'
        ],
        resources: ['*']
      }),
      ...additionalPolicies
    ];
    const workingPolicy = new PolicyDocument({
      statements
    });

    const role = new Role(this, this.generateId('exec-role'), {
      roleName: this.generateName('exec-role'),
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        loggingPolicy,
        workingPolicy
      }
    });

    const sharedLayerArn = StringParameter.valueForStringParameter(this,
      parameterNames.SHARED_LAYER_PARAMETER);
    const dependencyLayerArn = StringParameter.valueForStringParameter(this,
      parameterNames.DEPENDENCY_LAYER_PARAMETER);
    const sharedLayer = LayerVersion.fromLayerVersionArn(this, this.generateId('shared-layer'),
      sharedLayerArn);
    const dependencyLayer = LayerVersion.fromLayerVersionArn(this, this.generateId('dep-layer'),
      dependencyLayerArn);
    const secretsExtensionsLayer = LayerVersion.fromLayerVersionArn(
      this,
      this.generateId('secrets-layer'),
      SECRETS_LAMBDA_EXTENSION_ARN
    );
    
    const additionalEnvironmentVariables = props.additionalEnvironmentVariables || {};
    const environment = {
      [EnvironmentVariableName.DATA_TABLE_NAME]: this.generateEnvGeneralName(props.dataTableName),
      ...additionalEnvironmentVariables
    }
    this._lambda = new LambdaFunction(this, this.generateId('handler'), {
      functionName: this.generateName('handler'),
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset(props.handlerPath),
      handler: 'index.handler',
      tracing: Tracing.ACTIVE,
      environment,
      layers: [
        sharedLayer,
        dependencyLayer,
        secretsExtensionsLayer
      ],
      role,
      timeout: Duration.minutes(1),
      loggingFormat: LoggingFormat.JSON
    });
  }

  get lambda() {
    return this._lambda;
  }

  setLambdaPermission(principalStr: string) {
    this._lambda.addPermission(this.generateId('lambda-perm'), {
      action: 'lambda:InvokeFunction',
      principal: new ServicePrincipal(principalStr)
    });
  }
}
