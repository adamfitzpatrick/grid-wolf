import { GridWolfStack, GridWolfStackProps, outputs } from "@grid-wolf/shared/constructs";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Code, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { resolve } from "path";

const DEPENDENCY_LAYER_PATH = resolve(__dirname, '../../dependencies/');
const SHARED_LAYER_PATH = resolve(__dirname, '../../layer/');

export class SharedStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfStackProps) {
    super(scope, id, props);

    const dependencyLayer = new LayerVersion(this, this.generateId(outputs.DEPENDENCY_LAYER_NAME), {
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(DEPENDENCY_LAYER_PATH),
      layerVersionName: this.generateName(outputs.DEPENDENCY_LAYER_NAME)
    });

    const sharedLayer = new LayerVersion(this, this.generateId(outputs.SHARED_LAYER_NAME), {
      removalPolicy: RemovalPolicy.DESTROY,
      code: Code.fromAsset(SHARED_LAYER_PATH),
      layerVersionName: this.generateName(outputs.SHARED_LAYER_NAME)
    });

    new CfnOutput(this, this.generateId('DependencyLayerArn'), {
      exportName: this.generateName(outputs.DEPENDENCY_LAYER_NAME),
      value: dependencyLayer.layerVersionArn
    });
    new CfnOutput(this, this.generateId('SharedLayerArn'), {
      exportName: this.generateName(outputs.SHARED_LAYER_NAME),
      value: sharedLayer.layerVersionArn
    });
  }
}
