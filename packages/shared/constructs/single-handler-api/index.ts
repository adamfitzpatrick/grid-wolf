import { Construct } from "constructs";
import { ApiHandler, ApiHandlerProps } from "../api-handler";
import { GridWolfConstruct } from "../grid-wolf-construct";
import * as fs from 'fs';
import { compile } from 'handlebars';
import { parse } from 'yaml';
import { ApiDefinition, ApiKey, Deployment, EndpointType, SpecRestApi, Stage, UsagePlan } from "aws-cdk-lib/aws-apigateway";
import { CfnOutput } from "aws-cdk-lib";
import { outputs } from "..";

export interface SingleHandlerApiProps extends ApiHandlerProps {
  apiSpecPath: string;
  handlerTemplateKey: string;
  defaultApiKey: string;
}

export class SingleHandlerApi extends GridWolfConstruct {
  constructor(scope: Construct, id: string, props: SingleHandlerApiProps) {
    super(scope, id, props);

    const apiHandler = new ApiHandler(this, this.generateId('ApiHandler'), props);

    this.createApi(props, apiHandler);
  }

  createApi(props: SingleHandlerApiProps, apiHandler: ApiHandler) {
    const specTemplate = compile(fs.readFileSync(props.apiSpecPath, { encoding: 'utf-8'}));
    const apiDefinition = parse(specTemplate({
      [props.handlerTemplateKey]: apiHandler.lambda.functionArn,
      region: props.env.region
    }));

    fs.writeFileSync('./api-output.json', JSON.stringify(apiDefinition))
    const api = new SpecRestApi(this, this.generateId('rest-api'), {
      apiDefinition: ApiDefinition.fromInline(apiDefinition),
      cloudWatchRole: true,
      deploy: false,
      endpointTypes: [
        EndpointType.REGIONAL
      ]
    });
    apiHandler.setLambdaPermission('apigateway.amazonaws.com');

    const deployment = new Deployment(this, 'deployment', {
      api
    });
    const stage = new Stage(this, 'stage', {
      deployment,
      stageName: props.env.prefix
    });

    const defaultApiKey = new ApiKey(this, 'default-api-key', {
      apiKeyName: 'default-api-key',
      description: 'Highly-rate-limited key useful for manual testing and development',
      value: props.defaultApiKey
    });
    new CfnOutput(this, 'apiKey-output', {
      exportName: this.generateEnvGeneralName(outputs.DEFAULT_API_KEY),
      value: props.defaultApiKey
    });

    const defaultUsagePlan = new UsagePlan(this, 'default-usage-plan', {
      name: 'default-usage-plan',
      throttle: {
        burstLimit: 10,
        rateLimit: 1
      }
    });
    defaultUsagePlan.addApiKey(defaultApiKey);
    defaultUsagePlan.addApiStage({stage})
  }
}
