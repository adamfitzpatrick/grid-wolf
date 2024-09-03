import { GridWolfStack, GridWolfStackProps, outputs } from "@grid-wolf/constructs";
import { CfnOutput } from "aws-cdk-lib";
import { Code, LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { resolve } from "path";

const LAYER_PATH = resolve(__dirname, '../../layer/');

export class LibraryStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GridWolfStackProps) {
    super(scope, id, props);

    const layer = new LayerVersion(this, this.generateId(outputs.LIBRARY_LAYER_NAME), {
      code: Code.fromAsset(LAYER_PATH),
      layerVersionName: this.generateName(outputs.LIBRARY_LAYER_NAME)
    });

    new CfnOutput(this, this.generateId('LibraryLayerArn'), {
      exportName: this.generateName(outputs.LIBRARY_LAYER_NAME),
      value: layer.layerVersionArn
    });
  }
}
