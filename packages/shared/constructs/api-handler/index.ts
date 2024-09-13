import { Construct } from "constructs";
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Code, Function as LambdaFunction, LayerVersion, LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda'
import { Duration, Fn } from "aws-cdk-lib";
import { outputs } from "..";
import { EnvironmentVariableName } from "../../utils";
import { GridWolfConstruct, GridWolfConstructProps } from "../grid-wolf-construct";

export interface ApiHandlerProps extends GridWolfConstructProps {
  handlerPath: string;
  dataTableName: string;
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
    const workingPolicy = new PolicyDocument({
      statements: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:Query'
        ],
        resources: ['*']
      })]
    });

    const role = new Role(this, this.generateId('exec-role'), {
      roleName: this.generateName('exec-role'),
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        loggingPolicy,
        workingPolicy
      }
    });

    const sharedLayer = LayerVersion.fromLayerVersionArn(this, this.generateId('shared-layer'),
      Fn.importValue(this.generateEnvGeneralName(outputs.SHARED_LAYER_NAME)));
    const dependencyLayer = LayerVersion.fromLayerVersionArn(this, this.generateId('dep-layer'),
      Fn.importValue(this.generateEnvGeneralName(outputs.DEPENDENCY_LAYER_NAME)));
    this._lambda = new LambdaFunction(this, this.generateId('handler'), {
      functionName: this.generateName('handler'),
      runtime: Runtime.NODEJS_20_X,
      code: Code.fromAsset(props.handlerPath),
      handler: 'index.handler',
      tracing: Tracing.ACTIVE,
      environment: {
        [EnvironmentVariableName.DATA_TABLE_NAME]: this.generateEnvGeneralName(props.dataTableName)
      },
      layers: [
        sharedLayer,
        dependencyLayer
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
