import { GridWolfStack, parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from 'stepinto-aws-tools/constructs';
import { GridWolfProps } from "@grid-wolf/shared/domain";
import { Fn } from "aws-cdk-lib";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { CfnBasePathMapping, DomainName } from "aws-cdk-lib/aws-apigateway";

const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib/game-handler');

export interface GameStackProps extends GridWolfProps {
  dataTableName: string;
  hostedZone: string;
}

export class GameStack extends GridWolfStack {
  constructor(scope: Construct, id: string, props: GameStackProps) {
    super(scope, id, props);

    const userPoolArn = Fn.importValue(this.generateName(parameterNames.USER_POOL_ARN));
    let domainName = `${this.appName}.${props.hostedZone}`;
    if (props.env.prefix !== 'prd') {
      domainName = `${props.env.prefix}.${domainName}`;
    }
    const api = new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      appName: 'grid-wolf',
      constructName: 'game',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      usesSecrets: false,
      handler: 'index.handler',
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler',
      layers: {},
      userPoolArn
    });
    new CfnBasePathMapping(this, this.generateId('path-mapping'), {
      domainName,
      basePath: 'game',
      restApiId: api.getApi().restApiId,
      stage: api.getStage().stageName
    });
  }
}
