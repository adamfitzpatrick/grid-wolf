import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CommonInfraStack } from '../lib/common-infra-stack';
import { GridWolfStackProps } from '@grid-wolf/constructs';

describe('CommonInfraStack', () => {
  let props: GridWolfStackProps;
  let template: Template

  beforeEach(() => {
    props = {
      env: {
        account: '1234',
        region: 'us-west-2',
        prefix: 'tst'
      }
    }
    const app = new App();
    const stack = new CommonInfraStack(app, 'testStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a shared DynamoDB data table', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      TableName: `${props.env.prefix}-grid-wolf-data-table`,
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
});
