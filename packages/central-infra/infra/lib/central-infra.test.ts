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
      dataTableName: 'table'
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

  /*
  // TODO move to session package
  test('should create a record handler lambda', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'tst-grid-wolf-record-handler-exec-role',
      AssumeRolePolicyDocument: {
        Statement: [{
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com'
          }
        }]
      },
      Policies: [{
        PolicyName: 'loggingPolicy'
      }, {
        PolicyName: 'workingPolicy'
      }]
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-record-handler',
      Environment: {
        Variables: {
          DATA_TABLE_NAME: Match.anyValue()
        }
      },
      Handler: 'index.handler',
      Role: Match.objectLike({ 'Fn::GetAtt': Match.anyValue() }),
      Runtime: 'nodejs20.x',
      TracingConfig: {
        Mode: 'Active'
      },
      Layers: [{
        'Fn::ImportValue': 'tst-grid-wolf-dependency-layer'
      }, {
        'Fn::ImportValue': 'tst-grid-wolf-shared-layer'
      }]
    });
  });

  test('should create kinesis stream and attach lambda event source', () => {
    template.hasResourceProperties('AWS::Kinesis::Stream', {
      Name: 'tst-grid-wolf-setup-stream',
      StreamModeDetails: {
        StreamMode: 'ON_DEMAND'
      },
      StreamEncryption: {
        EncryptionType: 'KMS',
        KeyId: 'alias/aws/kinesis'
      }
    });
  });
  */
});
