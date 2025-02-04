import { Match, Template } from "aws-cdk-lib/assertions";
import { GameStack, GameStackProps } from "./game-stack";
import { App } from "aws-cdk-lib";

describe('game-stack', () => {
  let props: GameStackProps;
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
    const stack = new GameStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a handler lambda', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-game-api-handler',
      Environment: {
        Variables: {
          STEPINTO_APP_DATA_TABLE_NAME: 'tst-table'
        }
      }
    });
  });

  test('should create a REST API for game data', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Body: {
        paths: {
          '/': Match.anyValue(),
          '/{gameId}': Match.anyValue(),
          '/list': Match.anyValue()
        }
      }
    })
  });

  test('should add a base path mapping', () => {
    template.hasResourceProperties('AWS::ApiGateway::BasePathMapping', {});
  });
});
