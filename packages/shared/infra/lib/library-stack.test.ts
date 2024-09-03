import { GridWolfStackProps } from "@grid-wolf/shared/constructs";
import { LibraryStack } from "./library-stack";
import { Template } from "aws-cdk-lib/assertions";
import { App } from "aws-cdk-lib";

describe('LibraryStack', () => {
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
    const stack = new LibraryStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a lambda layer for library modules', () => {
    template.hasResourceProperties('AWS::Lambda::LayerVersion', {
      LayerName: 'tst-grid-wolf-library-layer'
    });
  })
})
