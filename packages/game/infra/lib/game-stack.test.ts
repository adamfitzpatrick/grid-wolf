import { Match, Template } from "aws-cdk-lib/assertions";
import { GameStack, GameStackProps } from "./game-stack";
import { App } from "aws-cdk-lib";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";

describe('game-stack', () => {
  let props: GameStackProps;
  let template: Template

  beforeEach(() => {
    props = {
      env: {
        account: 'account',
        region: 'us-west-2',
        prefix: 'tst'
      },
      dataTableName: 'table',
      defaultApiKey: 'key'
    }
    const app = new App();
    const stack = new GameStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a handler lambda', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-game-handler',
      Environment: {
        Variables: {
          [EnvironmentVariableName.DATA_TABLE_NAME]: 'tst-table'
        }
      }
    });
  });

  test('should create a REST API for game data', () => {
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Body: {
        paths: {
          '/game': Match.anyValue(),
          '/game/{gameId}': Match.anyValue(),
          '/games': Match.anyValue()
        }
      }
    })
  });
});
