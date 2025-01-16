import { GridWolfStack } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from '@grid-wolf/shared/constructs';
import { GridWolfProps } from "@grid-wolf/shared/domain";

const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib');

export interface GameStackProps extends GridWolfProps {
  dataTableName: string;
}

export class GameStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GameStackProps) {
    super(scope, id, props);

    new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      constructName: 'game',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      handler: 'game-handler/index.handler',
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler'
    })
  }
}
