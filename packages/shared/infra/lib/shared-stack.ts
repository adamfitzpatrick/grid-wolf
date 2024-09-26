import { GridWolfStack, parameterNames } from "@grid-wolf/shared/constructs";
import { GridWolfProps } from "../../domain";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Code, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { resolve } from "path";
import { ParameterTier, StringParameter } from "aws-cdk-lib/aws-ssm";

const DEPENDENCY_LAYER_PATH = resolve(__dirname, '../../dependencies/');
const SHARED_LAYER_PATH = resolve(__dirname, '../../layer/');

export class SharedStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfProps) {
    super(scope, id, props);

    const dependencyLayer = new LayerVersion(this, this.generateId('dependency-layer'), {
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(DEPENDENCY_LAYER_PATH),
      layerVersionName: this.generateName(`${this.appName}-dependency-layer`)
    });

    const sharedLayer = new LayerVersion(this, this.generateId('shared-layer'), {
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(SHARED_LAYER_PATH),
      layerVersionName: this.generateName(`${this.appName}-shared-layer`)
    });

    new StringParameter(this, this.generateId('shared-layer-param'), {
      parameterName: parameterNames.SHARED_LAYER_PARAMETER,
      stringValue: sharedLayer.layerVersionArn,
      tier: ParameterTier.STANDARD
    });
    new StringParameter(this, this.generateId('dependency-layer-param'), {
      parameterName: parameterNames.DEPENDENCY_LAYER_PARAMETER,
      stringValue: dependencyLayer.layerVersionArn,
      tier: ParameterTier.STANDARD
    });
  }
}
