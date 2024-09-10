import { Construct } from "constructs";
import { GridWolfStack } from ".";
import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { GridWolfProps } from "../../domain";

class ExtensionStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfProps) {
    super(scope, id, props);

    new Role(this, this.generateId('role'), {
      roleName: this.generateName('role'),
      assumedBy: new ServicePrincipal('iam.amazonaws.com')
    });
  }
}

describe('GridWolfStack', () => {
  let stack: ExtensionStack;
  let template: Template;

  beforeEach(() => {
    const props: GridWolfProps = {
      env: {
        account: '1234',
        region: 'region',
        prefix: 'tst'
      }
    }
    const app = new App();
    stack = new ExtensionStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });


  test('should tag all resources', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      Tags: [{
        Key: 'application',
        Value: 'grid-wolf'
      }, {
        Key: 'owner',
        Value: 'adam@stepinto.io'
      }, {
        Key: 'purpose',
        Value: 'business'
      }]
    })
  });

  test('should provide the application name', () => {
    expect(stack.appName).toBe('grid-wolf');
  });
});
