import { Match, Template } from "aws-cdk-lib/assertions";
import { MapStack, MapStackProps } from "./map-stack";
import { App } from "aws-cdk-lib";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";
import { parameterNames } from "@grid-wolf/shared/constructs";

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
      dataTableName: 'table',
      deploySecretsArn: 'secrets-arn'
    }
    const app = new App();
    const stack = new MapStack(app, 'TestStack', props);
    template = Template.fromStack(stack);
  });

  test('should create a handler lambda and related permissions', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      Policies: [
        Match.anyValue(),
        {
          PolicyDocument: {
            Statement: [
              Match.anyValue(),
              {
                Action: [
                  'secretsmanager:GetSecretValue',
                  'secretsmanager:DescribeSecret'
                ],
                Resource: 'secrets-arn'
              },
              {
                Action: 's3:PutObject'
              }
            ]
          }
        }
      ]
    });
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'tst-grid-wolf-map-handler',
      Environment: {
        Variables: {
          [EnvironmentVariableName.DATA_TABLE_NAME]: 'tst-table',
          [EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID]: 'secrets-arn',
          [EnvironmentVariableName.CDN_HOST]: Match.anyValue(),
          [EnvironmentVariableName.CDN_PUBLIC_KEY_ID]: Match.anyValue()
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

  test('should create an S3 bucket for image storage', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [{
          BucketKeyEnabled: true,
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: "AES256"
          }
        }]
      },
      BucketName: `tst-${parameterNames.IMAGE_BUCKET_NAME}`,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      },
      CorsConfiguration: Match.anyValue(),
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    })
  });

  test('should create a CloudFront distro for image upload and retrieval', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: {
          TrustedKeyGroups: [ Match.anyValue() ],
          ViewerProtocolPolicy: 'https-only'
        },
        PriceClass: 'PriceClass_100'
      }
    });
  });
});
