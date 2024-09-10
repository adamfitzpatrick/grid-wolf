import { Template } from "aws-cdk-lib/assertions";
import { SingleHandlerApi, SingleHandlerApiProps } from ".";
import { App, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import { ApiHandlerProps } from "../api-handler";
import { AssetCode, Code } from "aws-cdk-lib/aws-lambda";
import fs, { read } from 'fs';

let handlerSpy: jest.Mock;
jest.mock('../api-handler', () => {
  return {
    ApiHandler: function (scope: Construct, id: string, props: ApiHandlerProps) {
      return handlerSpy(scope, id, props);
    }
  }
});
let compileSpy: jest.Mock;
jest.mock('handlebars', () => {
  return {
    compile: (template: string) => compileSpy(template)
  }
});
let parseSpy: jest.Mock;
jest.mock('yaml', () => {
  return {
    parse: (yamlStr: string) => parseSpy(yamlStr)
  }
});

class TestStack extends Stack {
  constructor(scope: Construct, id: string, props: SingleHandlerApiProps) {
    super(scope, id, props);

    new SingleHandlerApi(this, 'aSingleHandlerApi', props);
  }
}

describe('SingleHandlerApi construct', () => {
  let props: SingleHandlerApiProps;
  let template: Template
  let setLambdaPermissionSpy: jest.SpyInstance;
  let readFileSpy: jest.SpyInstance;
  let evalSpy: jest.SpyInstance;

  beforeEach(() => {
    setLambdaPermissionSpy = jest.fn();
    handlerSpy = jest.fn().mockReturnValue({
      lambda: {
        functionName: 'function'
      },
      setLambdaPermission: setLambdaPermissionSpy
    });
    evalSpy = jest.fn().mockReturnValue('')
    compileSpy = jest.fn().mockReturnValue(evalSpy);
    parseSpy = jest.fn().mockReturnValue({ openapi: '3.0.0' });
    jest.spyOn(Code, 'fromAsset').mockReturnValue(Code.fromInline('code') as any as AssetCode);
    readFileSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('');

    props = {
      env: {
        account: 'account',
        region: 'region',
        prefix: 'tst'
      },
      dataTableName: 'table',
      constructName: 'handler',
      handlerPath: 'path',
      apiSpecPath: 'path',
      handlerTemplateKey: 'handler',
      defaultApiKey: 'key',
    };
    const app = new App();
    const stack = new TestStack(app, 'aTestStack', props);
    readFileSpy.mockRestore();
    template = Template.fromStack(stack);
  });

  test('should create the lambda handler function', () => {
    expect(handlerSpy).toHaveBeenCalledWith(
      expect.any(Construct),
      expect.anything(),
      props
    )
  });

  test('should create a rest API', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Body: { openapi: '3.0.0' }
    });
    template.hasResourceProperties('AWS::ApiGateway::ApiKey', {
      Value: 'key'
    });
    template.hasResourceProperties('AWS::ApiGateway::UsagePlan', {
      Throttle: {
        BurstLimit: 10,
        RateLimit: 1
      }
    });
    template.hasResourceProperties('AWS::ApiGateway::UsagePlanKey', {
      KeyType: 'API_KEY'
    });
    template.hasResourceProperties('AWS::ApiGateway::Deployment', {});
    template.hasResourceProperties('AWS::ApiGateway::Stage', {
      StageName: 'tst'
    });
    template.hasResourceProperties('AWS::ApiGateway::Account', {});
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [{
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: { Service: 'apigateway.amazonaws.com' }
        }]
      }
    });
    expect(compileSpy).toHaveBeenCalled();
    expect(evalSpy).toHaveBeenCalledWith({
      handler: 'function'
    });
    expect(parseSpy).toHaveBeenCalled();
    expect(setLambdaPermissionSpy).toHaveBeenCalledWith('apigateway.amazonaws.com')
  });
});
