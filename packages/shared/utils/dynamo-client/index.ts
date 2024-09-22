import { DTO } from "../../domain/dto";
import { DynamoDBClient, GetItemCommand, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { EnvironmentVariableName } from "../env-loader";
import { marshallToGameDAO, marshallToGameDTO, marshallToMapDAO, marshallToMapDTO } from "../../domain";
import { captureAWSv3Client } from "aws-xray-sdk";

export type DTOTypeName = 'GameDTO' | 'MapDTO';

interface TypeConfiguration {
  pkPrefix: string;
  skPrefix: string;
  marshallToDTO: Function,
  marshallToDAO: Function
}

let TableName: string;
const TYPE_CONFIGS: { [key: string]: TypeConfiguration } = {
  GameDTO: {
    pkPrefix: 'user',
    skPrefix: 'game',
    marshallToDTO: marshallToGameDTO,
    marshallToDAO: marshallToGameDAO
  },
  MapDTO: {
    pkPrefix: 'user',
    skPrefix: 'map',
    marshallToDTO: marshallToMapDTO,
    marshallToDAO: marshallToMapDAO
  }
};

const client = captureAWSv3Client(new DynamoDBClient());
export class DynamoClient<T extends DTO> {
  private typeConfig: TypeConfiguration;

  constructor(dtoTypeName: DTOTypeName) {
    TableName = process.env[EnvironmentVariableName.DATA_TABLE_NAME]!;
    this.typeConfig = TYPE_CONFIGS[dtoTypeName];
  }

  async get(pkUnique: string, skUnique: string): Promise<T> {
    const pk = { S: `${this.typeConfig.pkPrefix}#${pkUnique}` };
    const sk = {S: `${this.typeConfig.skPrefix}#${skUnique}` };

    const command = new GetItemCommand({
      TableName,
      Key: {
        pk,
        sk
      }
    });
    const response = await client.send(command);
    if (!response.Item) {
      return Promise.reject('not found');
    }
    return this.typeConfig.marshallToDTO(response.Item)
  }

  async list(pkUnique: string): Promise<T[]> {
    const pk = { S: `${this.typeConfig.pkPrefix}#${pkUnique}` };
    const sk = { S: `${this.typeConfig.skPrefix}` };

    const command = new QueryCommand({
      TableName,
      ExpressionAttributeValues: {
        ':pk': pk,
        ':sk': sk
      },
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)'
    });
    const response = await client.send(command);
    return (response.Items || []).map(item => this.typeConfig.marshallToDTO(item));
  }

  async put(dto: T): Promise<T> {
    const Item = this.typeConfig.marshallToDAO(dto);
    const command = new PutItemCommand({
      TableName,
      Item
    });
    return client.send(command).then(() => dto);
  }
}
