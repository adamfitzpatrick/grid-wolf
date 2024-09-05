import { GridWolfStackProps } from "@grid-wolf/shared/constructs";
import { SharedStack } from "./shared-stack";
import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";

describe('SharedStack', () => {
  let props: GridWolfStackProps;
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
})
