import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { GridWolfStack, GridWolfStackProps, outputs } from '@grid-wolf/constructs';


export class CommonInfraStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfStackProps) {
    
    super(scope, id, props);const table = new Table(this, this.generateId('TorrensDiesDataTable'), {
      tableName:this.generateName(`${this.appName}-data-table`),
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
  }
}
