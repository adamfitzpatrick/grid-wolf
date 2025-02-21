import { Match, Template } from "aws-cdk-lib/assertions";
import { EntityStack, EntityStackProps } from "./entity-stack";
import { App } from "aws-cdk-lib";

describe('entity-stack', () => {
  let props: EntityStackProps;
  let template: Template;

  beforeEach(() => {
    props = {
      env: {
        account: 'account',
        region: 'us-west-2',
        prefix: 'tst'
      },
      dataTableName: 'table',
      hostedZone: 'zone.com',
      subdomain: 'subdomain'
    };
    const app = new App();
    const stack = new EntityStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a handler lambda', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-entity-api-handler',
      Environment: {
        Variables: {
          STEPINTO_APP_DATA_TABLE_NAME: 'tst-table'
        }
      }
    });
  });

  test('should create a REST API for entity data', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Body: {
        paths: {
          '/': Match.anyValue(),
          '/{entityId}': Match.anyValue(),
          '/list': Match.anyValue()
        }
      }
    });
  });

  test('should add a base path mapping', () => {
    template.hasResourceProperties('AWS::ApiGateway::BasePathMapping', {});
  });
});
