import { GridWolfStack, parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from 'stepinto-aws-tools/constructs';
import { GridWolfProps } from "@grid-wolf/shared/domain";
import { Fn } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib');

export interface GameStackProps extends GridWolfProps {
  dataTableName: string;
}

export class GameStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GameStackProps) {
    super(scope, id, props);

    const userPoolArn = Fn.importValue(this.generateName(parameterNames.USER_POOL_ARN));
    const dependencyLayerVersionArn = StringParameter.valueForStringParameter(
      this,
      parameterNames.DEPENDENCY_LAYER_PARAMETER
    );
    new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      appName: 'grid-wolf',
      constructName: 'game',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      usesSecrets: false,
      handler: 'game-handler/index.handler',
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler',
      layers: {
        dependencyLayer: dependencyLayerVersionArn
      },
      userPoolArn
    })
  }
}
