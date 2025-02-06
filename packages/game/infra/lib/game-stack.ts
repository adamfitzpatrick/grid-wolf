import { parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from 'stepinto-aws-tools/constructs';
import { Fn } from "aws-cdk-lib";
import { CfnBasePathMapping } from "aws-cdk-lib/aws-apigateway";
import { StepintoBaseProps, StepintoBaseStack } from 'stepinto-aws-tools/constructs';

const APP_NAME = 'grid-wolf-game';
const BASE_PATH = 'game';
const SPEC_PATH = resolve(__dirname, '../api-spec.yaml');
const HANDLER_PATH = resolve(__dirname, '../../lib/game-handler');

export interface GameStackProps extends Omit<StepintoBaseProps, 'appName'> {
  dataTableName: string;
  hostedZone: string;
  subdomain: string;
}

export class GameStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: GameStackProps) {
    super(scope, id, { appName: APP_NAME, ...props });

    const userPoolArn = Fn.importValue(`${props.env.prefix}-${parameterNames.USER_POOL_ARN}`);
    
    const api = new SingleHandlerApi(this, this.generateId('api'), {
      ...props,
      appName: this.appName,
      constructName: 'api',
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      usesSecrets: false,
      handler: 'index.handler',
      authArnTemplateKey: 'authArn',
      handlerTemplateKey: 'handler',
      additionalEnvironmentVariables: {
        PARAMETERS_SECRETS_EXTENSION_LOG_LEVEL: 'error'
    },
      layers: {},
      userPoolArn
    });

    let domainName = `${props.subdomain}.${props.hostedZone}`;
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
