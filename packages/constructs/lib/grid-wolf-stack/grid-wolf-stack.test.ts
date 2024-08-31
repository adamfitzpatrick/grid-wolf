import { Construct } from "constructs";
import { GridWolfStack, GridWolfStackProps } from ".";
import { App, StackProps } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

class ExtensionStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfStackProps) {
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
    const props: GridWolfStackProps = {
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

  test('should generate consistent environment-specific resource names', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'tst-role'
    });
  });

  test('should generate consistent environment-specific resource ID values', () => {
    expect(stack.generateId('resource-id')).toBe('tstResourceId');
    expect(stack.generateId('ResourceId')).toBe('tstResourceId');
  });
});
