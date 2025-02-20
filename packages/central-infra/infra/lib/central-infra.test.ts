import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CentralInfraStack, CentralInfraStackProps } from './central-infra-stack';

describe('CentralInfraStack', () => {
  let props: CentralInfraStackProps;
  let template: Template

  beforeEach(() => {
    props = {
      env: {
        account: '1234',
        region: 'us-west-2',
        prefix: 'tst'
      },
      dataTableName: 'table',
      hostedZone: 'zone',
      apiCertificateArn: 'arn'
    }
    const app = new App();
    const stack = new CentralInfraStack(app, 'testStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a shared DynamoDB data table', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: `${props.env.prefix}-table`,
      AttributeDefinitions: [{
        AttributeName: 'pk',
        AttributeType: 'S'
      }, {
        AttributeName: 'sk',
        AttributeType: 'S'
      }],
      BillingMode: 'PAY_PER_REQUEST',
      DeletionProtectionEnabled: true,
      KeySchema: [{
        AttributeName: 'pk',
        KeyType: 'HASH'
      }, {
        AttributeName: 'sk',
        KeyType: 'RANGE'
      }],
      PointInTimeRecoverySpecification: {
        PointInTimeRecoveryEnabled: true
      },
      StreamSpecification: {
        StreamViewType: 'NEW_IMAGE'
      }
    })
  });

  test('should create a custom API Gateway domain and related records', () => {
    template.hasResourceProperties('AWS::ApiGateway::DomainName', {
      RegionalCertificateArn: 'arn',
      DomainName: 'tst.api.grid-wolf.zone',
    });
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'A'
    });
    template.hasResourceProperties('AWS::Route53::RecordSet', {
      Type: 'AAAA'
    });
  });

  test('should create an application-wide event bus', () => {
    template.hasResourceProperties('AWS::Events::EventBus', {});
  })
});
