import { CfnOutput } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { GridWolfStack, parameterNames } from '@grid-wolf/shared/constructs';
import { GridWolfProps } from '@grid-wolf/shared/domain';

export interface CentralInfraStackProps extends GridWolfProps {
  dataTableName: string;
}

export class CentralInfraStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: CentralInfraStackProps) {
    super(scope, id, props);

    const table = this.createDataTable(props.dataTableName);
    // TODO move to session package
    // const recordHandler = this.createRecordHandler(table, dependencyLayer);
    //this.createStream(recordHandler);
  }

  createDataTable(dataTableName: string) {
    const table = new Table(this, this.generateId(parameterNames.DATA_TABLE_NAME), {
      tableName: this.generateName(dataTableName),
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
      exportName: this.generateName(parameterNames.DATA_TABLE_NAME),
      value: table.tableName
    });
    return table
  }

  /*
  // TODO move to session package
  createRecordHandler(table: Table, dependencyLayer: LayerVersion) {
    const sharedLayerArn = Fn.importValue(this.generateName(parameterNames.SHARED_LAYER_NAME));
    const sharedLayer = LayerVersion
      .fromLayerVersionArn(this, this.generateId(parameterNames.SHARED_LAYER_NAME), sharedLayerArn);
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
        sharedLayer
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
  */
}
