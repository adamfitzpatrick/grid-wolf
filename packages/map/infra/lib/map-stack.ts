import { GridWolfStack, parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from '@grid-wolf/shared/constructs';
import { GridWolfProps } from "@grid-wolf/shared/domain";
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import {
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  Distribution,
  KeyGroup,
  PriceClass,
  PublicKey,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { HttpMethods } from 'aws-cdk-lib/aws-s3'
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";

const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib/map-handler');

export interface MapStackProps extends GridWolfProps {
  dataTableName: string;
  deploySecretsArn: string;
}

export class MapStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: MapStackProps) {
    super(scope, id, props);
    const unique = (component: string) => `${this.appName}-map-${component}`;
    const publicKey = StringParameter.valueForStringParameter(this, parameterNames.CDN_PUBLIC_KEY_PARAM);

    const imageBucket = new Bucket(this, this.generateId(unique('images')), {
      bucketKeyEnabled: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: this.generateName(parameterNames.IMAGE_BUCKET_NAME),
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      cors: [{
        allowedMethods: [ HttpMethods.PUT ],
        allowedOrigins: ['*'],
        allowedHeaders: [ 'Content-Type' ]
      }]
    });

    const cdnPublicKey = new PublicKey(this, this.generateId(unique('public-key')), {
      encodedKey: publicKey
    });
    const keyGroup = new KeyGroup(this, this.generateId(unique('key-group')), {
      items: [
        cdnPublicKey
      ]
    });
    const distro = new Distribution(this, this.generateId(unique('distro')), {
      defaultBehavior: {
        origin: new S3Origin(imageBucket),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        cachedMethods: CachedMethods.CACHE_GET_HEAD,
        compress: true,
        trustedKeyGroups: [
          keyGroup
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY
      },
      priceClass: PriceClass.PRICE_CLASS_100
    });

    new SingleHandlerApi(this, this.generateId(unique('api')), {
      ...props,
      constructName: 'map',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler',
      additionalEnvironmentVariables: {
        [EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID]: props.deploySecretsArn,
        [EnvironmentVariableName.CDN_HOST]: `https://${distro.domainName}`,
        [EnvironmentVariableName.CDN_PUBLIC_KEY_ID]: cdnPublicKey.publicKeyId,
        [EnvironmentVariableName.IMAGE_BUCKET_NAME]: imageBucket.bucketName
      },
      additionalHandlerPolicies: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [
            'secretsmanager:GetSecretValue',
            'secretsmanager:DescribeSecret'
          ],
          resources: [ props.deploySecretsArn ]
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: [ 's3:PutObject' ],
          resources: [ `${imageBucket.bucketArn}/*` ]
        })
      ]
    });
  }
}
