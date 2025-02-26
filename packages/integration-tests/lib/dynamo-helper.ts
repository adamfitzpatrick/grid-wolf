import {
  AttributeValue,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandOutput,
  QueryCommand
} from "@aws-sdk/client-dynamodb";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";
import { unmarshall } from '@aws-sdk/util-dynamodb';

const RETRY_TIMING_BASE = 4;
const BASE_RETRY_COUNT = 3;

type Predicate = (Item: Record<string, AttributeValue> | undefined) => boolean;

export class DynamoHelper {
  tableName: string;
  client: DynamoDBClient;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.client = new DynamoDBClient({
      profile: 'stepinto' // process.env[EnvironmentVariableName.AWS_SSO_PROFILE]
    });
  }

  async get(pk: string, sk: string) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: {
        pk: {
          S: pk
        },
        sk: {
          S: sk
        }
      }
    });
    
    return this.client.send(command);
  }

  async getWithRetries(pk: string, sk: string, predicate: Predicate = Item => !!Item) {
    for (let k = 0; k < BASE_RETRY_COUNT; k++) {
      const response = await this.#getWithDelay(pk, sk, Math.pow(RETRY_TIMING_BASE, k));
      if (predicate(response.Item)) {
        return unmarshall(response.Item!)
      }
    }
    throw new Error('Item not found');
  }

  async #getWithDelay(pk: string, sk: string, delay: number) {
    return new Promise<GetItemCommandOutput>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const response = await this.get(pk, sk);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      }, delay * 1000)
    })
  }

  async cleanUp(userId: string) {
    let deletedItemsCount = 0;
    const pkPrefixes = [
      'user',
      'player'
    ]
    await Promise.all(pkPrefixes.map(async prefix => {
      const query = new QueryCommand({
        TableName: this.tableName,
        ExpressionAttributeValues: {
          ':pk': { S: `${prefix}#${userId}`}
        },
        KeyConditionExpression: 'pk = :pk'
      });
      const items = (await this.client.send(query)).Items?.map(item => unmarshall(item));
      return await Promise.all(items!.map(async item => {
        const deleteCommand = new DeleteItemCommand({
          TableName: this.tableName,
          Key: {
            pk: { S: item.pk },
            sk: { S: item.sk }
          }
        });
        await this.client.send(deleteCommand);
        deletedItemsCount++;
      }))
    }));
    console.log(`${userId} deleted items: ${deletedItemsCount}`);
  }
}


