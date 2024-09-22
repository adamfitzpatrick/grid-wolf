import { Match, Template } from "aws-cdk-lib/assertions";
import { MapStack, MapStackProps } from "./map-stack";
import { App } from "aws-cdk-lib";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";

describe('map-stack', () => {
  let props: MapStackProps;
  let template: Template

  beforeEach(() => {
    props = {
      env: {
        account: 'account',
        region: 'us-west-2',
        prefix: 'tst'
      },
      dataTableName: 'table'
    }
    const app = new App();
    const stack = new MapStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a handler lambda', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-map-handler',
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
          '/map': Match.anyValue(),
          '/map/{mapId}': Match.anyValue(),
          '/maps': Match.anyValue()
        }
      }
    })
  });

  test('should create a CloudFront distro for image uploads', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        AllowedMethods: [ 'GET', 'HEAD', 'OPTIONS', 'PUT' ],
        CachedMethods: [ 'GET', 'HEAD', 'OPTIONS' ]
      }
    });
  });
});
