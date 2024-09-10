import { ApiHandler, ApiHandlerProps } from ".";
import { App, Stack } from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { Construct } from "constructs";
import { TracingConfig } from "aws-cdk-lib/aws-sns";
import { AssetCode, Code, LogFormat } from "aws-cdk-lib/aws-lambda";
import { EnvironmentVariableName } from "../../utils";

class TestStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiHandlerProps) {
    super(scope, id, props);

    new ApiHandler(this, 'TestConstruct', props);
  }
}

describe('api-handler construct', () => {
  let props: ApiHandlerProps
  let template: Template

  beforeEach(() => {
    jest.spyOn(Code, 'fromAsset').mockReturnValue(Code.fromInline('code') as any as AssetCode);
    props = {
      env: {
        account: 'account',
        region: 'us-west-2',
        prefix: 'tst'
      },
      constructName: 'apihandler-test',
      handlerPath: 'path',
      dataTableName: 'table'
    };
    const app = new App();
    const stack = new TestStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should include an execution role', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [{
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com'
          }
        }]
      },
      Policies : [{
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroups',
              'logs:CreateLogStreams',
              'logs:DescribeLogStreams',
              'logs:PutLogEvents'
            ],
            Resource: '*'
          }]
        }
      }, {
        PolicyDocument: {
          Statement: [{
            Effect: 'Allow',
            Action: [
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:Query'
            ],
            Resource: '*'
          }]
        }
      }],
      RoleName : 'tst-grid-wolf-apihandler-test-exec-role',
    });
  });

  test('should create the handler lambda function', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-apihandler-test-handler',
      Runtime: 'nodejs20.x',
      TracingConfig: {
        Mode: TracingConfig.ACTIVE
      },
      Environment: {
        Variables: {
          [EnvironmentVariableName.DATA_TABLE_NAME]: 'tst-table'
        }
      },
      Layers: [
        { 'Fn::ImportValue': Match.stringLikeRegexp('tst-grid-wolf-shared') },
        { 'Fn::ImportValue': Match.stringLikeRegexp('tst-grid-wolf-dependency')}
      ],
      Role: Match.anyValue()
    });
  });
});
