import { CfnOutput } from 'aws-cdk-lib';
import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { GridWolfStack, parameterNames } from '@grid-wolf/shared/constructs';
import { GridWolfProps } from '@grid-wolf/shared/domain';
import { HostedZone, RecordSet, RecordTarget, RecordType } from 'aws-cdk-lib/aws-route53';
import { DomainName, EndpointType } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ApiGateway, ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';

export interface CentralInfraStackProps extends GridWolfProps {
  dataTableName: string;
  hostedZone: string;
  apiCertificateArn: string;
}

export class CentralInfraStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: CentralInfraStackProps) {
    super(scope, id, props);

    const table = this.createDataTable(props.dataTableName);
    this.createApiDomain(props.env.prefix, props.hostedZone, props.apiCertificateArn);
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

  createApiDomain(envPrefix: string, zoneName: string, certificateArn: string) {
    let domainName = `${this.appName}.${zoneName}`;
    if (envPrefix !== 'prd') {
      domainName = `${envPrefix}.${domainName}`;
    }

    const zone = HostedZone.fromLookup(this, this.generateId('hosted-zone'), {
      domainName: zoneName
    });
    const certificate = Certificate.fromCertificateArn(this, this.generateId('api-cert'), certificateArn);

    const apiDomain = new DomainName(this, this.generateId('api-domain'), {
      endpointType: EndpointType.REGIONAL,
      domainName,
      certificate
    });
    new RecordSet(this, this.generateId('a-record'), {
      recordType: RecordType.A,
      zone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomain))
    });
    new RecordSet(this, this.generateId('aaaa-record'), {
      recordType: RecordType.AAAA,
      zone,
      recordName: domainName,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apiDomain))
    });
  }
}
