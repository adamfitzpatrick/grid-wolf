import { GridWolfProps } from "@grid-wolf/shared/domain";
import { SharedStack } from "./shared-stack";
import { Match, Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";
import { parameterNames } from "../../constructs";

describe('SharedStack', () => {
  let props: GridWolfProps;
  let template: Template;

  beforeEach(() => {
    props = {
      env: {
        account: 'account',
        region: 'region',
        prefix: 'tst'
      }
    };
    const app = new App();
    const stack = new SharedStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a lambda layer for NPM dependencies', () => {
    template.hasResourceProperties('AWS::Lambda::LayerVersion', {
      LayerName: 'tst-grid-wolf-dependency-layer'
    })
  });

  test('should create a lambda layer for shared modules', () => {
    template.hasResourceProperties('AWS::Lambda::LayerVersion', {
      LayerName: 'tst-grid-wolf-shared-layer'
    });
  });

  test('should create parameter store entries for lambda layers', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: parameterNames.SHARED_LAYER_PARAMETER,
      Value: Match.anyValue()
    });
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: parameterNames.DEPENDENCY_LAYER_PARAMETER,
      Value: Match.anyValue()
    });
  });
})
