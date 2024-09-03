import { CfnOutput, Fn, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { GridWolfStack, GridWolfStackProps, outputs } from '@grid-wolf/constructs';
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Code, Function as LambdaFunction, LayerVersion, Runtime, StartingPosition, Tracing } from 'aws-cdk-lib/aws-lambda';
import { resolve } from 'path';
import { DATA_TABLE_NAME } from '@grid-wolf/constructs/lib/outputs';
import { Stream, StreamEncryption, StreamMode } from 'aws-cdk-lib/aws-kinesis';
import { KinesisEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const DEPENDENCY_LAYER_PATH = resolve(__dirname, '../../lib/dependency-layer/');
const RECORD_HANDLER_PATH = resolve(__dirname, '../../lib/kinesis-record-handler/');

export class CommonInfraStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfStackProps) {
    
    super(scope, id, props);

    const table = this.createDataTable();
    const dependencyLayer = this.createDependencyLayer();
    const recordHandler = this.createRecordHandler(table, dependencyLayer);
    this.createStream(recordHandler);
  }

  createDataTable() {
    const table = new Table(this, this.generateId(this.generateId(DATA_TABLE_NAME)), {
      tableName:this.generateName(DATA_TABLE_NAME),
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      deletionProtection: true,
      pointInTimeRecovery: true,
      stream: StreamViewType.NEW_IMAGE
    });

    new CfnOutput(this, 'DataTableName', {
      exportName: outputs.DATA_TABLE_NAME,
      value: table.tableName
    });
    return table
  }

  createDependencyLayer() {
    const unique = `${this.appName}-dependency-layer`
    return new LayerVersion(this, this.generateId(unique), {
      removalPolicy: RemovalPolicy.DESTROY,
      layerVersionName: this.generateName(unique),
      code: Code.fromAsset(DEPENDENCY_LAYER_PATH)
    });
  }

  createRecordHandler(table: Table, dependencyLayer: LayerVersion) {
    const libraryLayerArn = Fn.importValue(this.generateName(outputs.LIBRARY_LAYER_NAME));
    const libraryLayer = LayerVersion
      .fromLayerVersionArn(this, this.generateId(outputs.LIBRARY_LAYER_NAME), libraryLayerArn);
    const handlerUnique = `${this.appName}-record-handler`;
    const loggingPolicy = new PolicyDocument({
      statements: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:DescribeLogStreams',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ],
        resources: ['*']
      })]
    });
    const workingPolicy = new PolicyDocument({
      statements: [new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'kinesis:GetShardIterator',
          'kinesis:GetRecords',
          'kinesis:DescribeStreamSummary',
          'kinesis:ListStreams'
        ],
        resources: ['*']
      }), new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'DynamoDB:PutItem'
        ],
        resources: ['*']
      })]
    });
    const roleUnique = `${handlerUnique}-exec-role`;
    const role = new Role(this, this.generateId(roleUnique), {
      roleName: this.generateName(roleUnique),
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        loggingPolicy,
        workingPolicy
      }
    });

    const lambda = new LambdaFunction(this, this.generateId(handlerUnique), {
      functionName: this.generateName(handlerUnique),
      code: Code.fromAsset(RECORD_HANDLER_PATH),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_20_X,
      role,
      tracing: Tracing.ACTIVE,
      environment: {
        DATA_TABLE_NAME: table.tableName
      },
      layers: [
        dependencyLayer,
        libraryLayer
      ]
    });
    lambda.addPermission(this.generateId(`${handlerUnique}-eventsource-permission`), {
      principal: new ServicePrincipal('kinesis.amazonaws.com'),
      action: 'lambda:InvokeFunction'
    });
    return lambda;
  }

  createStream(recordHandler: LambdaFunction) {
    const streamUnique = `${this.appName}-setup-stream`;
    const stream = new Stream(this, this.generateId(streamUnique), {
      streamName: this.generateName(streamUnique),
      encryption: StreamEncryption.MANAGED,
      streamMode: StreamMode.ON_DEMAND
    });
    recordHandler.addEventSource(new KinesisEventSource(stream, {
      startingPosition: StartingPosition.TRIM_HORIZON
    }));
  }
}
