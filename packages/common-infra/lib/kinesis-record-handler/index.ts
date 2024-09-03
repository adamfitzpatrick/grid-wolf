import { KinesisStreamEvent } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { captureAWSv3Client } from 'aws-xray-sdk';
import { GameDTO, marshallToDAO } from "@grid-wolf/library/game";
import { UNPROCESSED_RECORD } from '@grid-wolf/library/error';

const client = captureAWSv3Client(new DynamoDBClient());

export async function handler(event: KinesisStreamEvent) {
  return Promise.all(event.Records.map(async record => {
    let data: GameDTO;
    try {
      data = JSON.parse(atob(record.kinesis.data));
    } catch (e) {
      const message = {
        message: UNPROCESSED_RECORD,
        timestamp: record.kinesis.approximateArrivalTimestamp,
        data: record.kinesis.data
      };
      console.error(message);
      return message;
    }

    const command = new PutItemCommand({
      TableName: process.env.DATA_TABLE_NAME,
      Item: marshallToDAO(data)
    });

    return client.send(command);
  }));
}
