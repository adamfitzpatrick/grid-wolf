import { GridWolfStack } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from '@grid-wolf/shared/constructs';
import { GridWolfProps } from "@grid-wolf/shared/domain";

const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib/map-handler');

export interface MapStackProps extends GridWolfProps {
  dataTableName: string;
}

export class MapStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: MapStackProps) {
    super(scope, id, props);

    new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      constructName: 'map',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler'
    })
  }
}
