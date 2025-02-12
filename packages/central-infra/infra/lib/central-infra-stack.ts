import { AttributeType, BillingMode, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { HostedZone, RecordSet, RecordTarget, RecordType } from 'aws-cdk-lib/aws-route53';
import { DomainName, EndpointType } from 'aws-cdk-lib/aws-apigateway';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';
import { StepintoBaseStack, StepintoBaseProps } from 'stepinto-aws-tools/constructs';

export const APP_NAME = 'grid-wolf';
export const API_SUBDOMAIN_PART = 'api';

export interface CentralInfraStackProps extends Omit<StepintoBaseProps, 'appName'> {
  dataTableName: string;
  hostedZone: string;
  apiCertificateArn: string;
}

export class CentralInfraStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: CentralInfraStackProps) {
    super(scope, id, { appName: APP_NAME, ...props });

    this.createDataTable(props.env.prefix, props.dataTableName);
    this.createApiDomain(props.env.prefix, props.hostedZone, props.apiCertificateArn);
  }

  createDataTable(envPrefix: string, dataTableName: string) {
    const table = new Table(this, this.generateId('data-table'), {
      tableName: `${envPrefix}-${dataTableName}`,
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

    return table
  }

  createApiDomain(envPrefix: string, zoneName: string, certificateArn: string) {
    let domainName = `${API_SUBDOMAIN_PART}.${this.appName}.${zoneName}`;
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
