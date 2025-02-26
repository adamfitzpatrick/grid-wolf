import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { EnvironmentVariableName } from '@grid-wolf/shared/utils';

export class LambdaHelper {
  #functionName: string;
  client: LambdaClient;

  constructor(functionName: string) {
    this.#functionName = functionName;
    this.client = new LambdaClient({
      profile: process.env[EnvironmentVariableName.AWS_SSO_PROFILE]
    });
  }

  async invoke(event: object) {
    const command = new InvokeCommand({
      FunctionName: this.#functionName,
      InvocationType: 'Event',
      Payload: Buffer.from(JSON.stringify(event))
    });
    return this.client.send(command);
  }
}
