import { parameterNames } from "@grid-wolf/shared/constructs";
import { Construct } from "constructs";
import { resolve } from "path";
import { SingleHandlerApi } from "stepinto-aws-tools/constructs";
import { CfnBasePathMapping } from "aws-cdk-lib/aws-apigateway";
import { StepintoBaseProps, StepintoBaseStack } from "stepinto-aws-tools/constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { LambdaEnvironmentVariableName } from "@grid-wolf/shared/utils";

const APP_NAME = "grid-wolf-encounter";
const BASE_PATH = "encounter";
const SPEC_PATH = resolve(__dirname, "../api-spec.yaml");
const HANDLER_PATH = resolve(__dirname, "../../lib/encounter-handler");
const API_SUBDOMAIN_PART = "api";

export const EncounterEnvironmentVariable = {
  ...LambdaEnvironmentVariableName,
};

export interface EncounterStackProps extends Omit<StepintoBaseProps, "appName"> {
  dataTableName: string;
  hostedZone: string;
  subdomain: string;
}

export class EncounterStack extends StepintoBaseStack {
  constructor(scope: Construct, id: string, props: EncounterStackProps) {
    super(scope, id, { appName: APP_NAME, ...props });

    const userPoolArn = StringParameter.valueForStringParameter(
      this,
      `/${props.env.prefix}${parameterNames.USER_POOL_ARN}`
    );
    const api = new SingleHandlerApi(this, this.generateId("api"), {
      ...props,
      appName: this.appName,
      constructName: "api",
      apiSpecPath: SPEC_PATH,
      handlerPath: HANDLER_PATH,
      usesSecrets: false,
      handler: "index.handler",
      authArnTemplateKey: "authArn",
      handlerTemplateKey: "handler",
      additionalEnvironmentVariables: {
        [EncounterEnvironmentVariable.SECRETS_EXT_LOG_LEVEL]: "error",
      },
      layers: {},
      userPoolArn,
    });

    let domainName = `${API_SUBDOMAIN_PART}.${props.subdomain}.${props.hostedZone}`;
    if (props.env.prefix !== "prd") {
      domainName = `${props.env.prefix}.${domainName}`;
    }
    new CfnBasePathMapping(this, this.generateId("api-path-mapping"), {
      domainName,
      basePath: BASE_PATH,
      restApiId: api.getApi().restApiId,
      stage: api.getStage().stageName,
    });
  }
}
