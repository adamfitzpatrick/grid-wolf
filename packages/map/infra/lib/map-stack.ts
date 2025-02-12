import { parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from 'stepinto-aws-tools/constructs';
import { BlockPublicAccess, Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import {
  AccessLevel,
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  Distribution,
  KeyGroup,
  PriceClass,
  PublicKey,
  ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import { HttpMethods } from 'aws-cdk-lib/aws-s3'
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";
import { CfnBasePathMapping } from "aws-cdk-lib/aws-apigateway";
import { StepintoBaseStack, StepintoBaseProps } from 'stepinto-aws-tools/constructs';
import { HostedZone, RecordSet, RecordTarget, RecordType } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

const APP_NAME = 'grid-wolf-map';
const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib/map-handler');
const BASE_PATH = 'map';
const API_SUBDOMAIN_PART = 'api';
const CDN_SUBDOMAIN_PART = 'images';

export interface MapStackProps extends Omit<StepintoBaseProps, 'appName'> {
  dataTableName: string;
  deploySecretsArn: string;
  hostedZone: string;
  subdomain: string;
  cdnCertificate: string;
}

export class MapStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: MapStackProps) {
    super(scope, id, { appName: APP_NAME, ...props });
    
    const publicKey = StringParameter.valueForStringParameter(this, `/${props.env.prefix}${parameterNames.CDN_PUBLIC_KEY_PARAM}`);
    const imageBucket = new Bucket(this, this.generateId('images'), {
      bucketKeyEnabled: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      bucketName: this.generateName(parameterNames.IMAGE_BUCKET_NAME),
      encryption: BucketEncryption.S3_MANAGED,
      versioned: true,
      cors: [{
        allowedMethods: [ HttpMethods.PUT ],
        allowedOrigins: [ '*' ],
        allowedHeaders: [ 'Content-Type' ]
      }]
    });

    const cdnPublicKey = new PublicKey(this, this.generateId('public-key'), {
      encodedKey: publicKey
    });
    const keyGroup = new KeyGroup(this, this.generateId('key-group'), {
      items: [
        cdnPublicKey
      ]
    });
    let cdnDomain = `${CDN_SUBDOMAIN_PART}.${props.subdomain}.${props.hostedZone}`;
    if (props.env.prefix !== 'prd') {
      cdnDomain = `${props.env.prefix}.${cdnDomain}`
    }
    const certificate = Certificate.fromCertificateArn(
      this,
      this.generateId('cdn-cert'),
      props.cdnCertificate
    );
    const distro = new Distribution(this, this.generateId('distro'), {
      certificate,
      domainNames: [cdnDomain],
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(imageBucket, {
          originAccessLevels: [ AccessLevel.READ ]
        }),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        cachedMethods: CachedMethods.CACHE_GET_HEAD,
        compress: true,
        trustedKeyGroups: [
          keyGroup
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        
      },
      priceClass: PriceClass.PRICE_CLASS_100
    });

    const zone = HostedZone.fromLookup(this, this.generateId('zone'), {
      domainName: props.hostedZone
    });
    new RecordSet(this, this.generateId('arecord'), {
      recordType: RecordType.A,
      recordName: `${props.env.prefix}.${CDN_SUBDOMAIN_PART}.${props.subdomain}`,
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distro))
    });
    new RecordSet(this, this.generateId('aaaarecord'), {
      recordType: RecordType.AAAA,
      recordName: `${props.env.prefix}.${CDN_SUBDOMAIN_PART}.${props.subdomain}`,
      zone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distro))
    });

    const userPoolArn = StringParameter.valueForStringParameter(this, `/${props.env.prefix}${parameterNames.USER_POOL_ARN}`);
    const api = new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      appName: this.appName,
      constructName: 'api',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      handler: 'map-handler/index.handler',
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler',
      layers: {},
      additionalEnvironmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'ERROR',
        [EnvironmentVariableName.DATA_TABLE_NAME]: `${props.env.prefix}-${process.env[EnvironmentVariableName.DATA_TABLE_NAME]!}`,
        [EnvironmentVariableName.IMAGE_BUCKET_NAME]: imageBucket.bucketName,
        [EnvironmentVariableName.CDN_PUBLIC_KEY_ID]: cdnPublicKey.publicKeyId,
        [EnvironmentVariableName.CDN_PRIVATE_KEY_SECRET_ID]: props.deploySecretsArn,
        CDN_HOST: cdnDomain
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
      ],
      userPoolArn,
      usesSecrets: true
    });

    let domainName = `${API_SUBDOMAIN_PART}.${props.subdomain}.${props.hostedZone}`;
    if (props.env.prefix !== 'prd') {
      domainName = `${props.env.prefix}.${domainName}`;
    }
    new CfnBasePathMapping(this, this.generateId('api-path-mapping'), {
      domainName,
      basePath: BASE_PATH,
      restApiId: api.getApi().restApiId,
      stage: api.getStage().stageName
    });
  }
}
