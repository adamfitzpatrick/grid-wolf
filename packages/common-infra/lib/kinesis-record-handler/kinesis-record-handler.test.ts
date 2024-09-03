import { KinesisStreamEvent } from "aws-lambda";
import { GameDTO } from '@grid-wolf/library/game';
import { handler } from ".";

let sendSpy: jest.Mock;
let putCommandSpy: jest.Mock;

jest.mock('aws-xray-sdk', () => {
  return {
    captureAWSv3Client: (client: any) => client
  }
});
jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    PutItemCommand: function (params: any) { return putCommandSpy(params); },
    DynamoDBClient: function () {
      return {
        send: (command: any) => sendSpy(command)
      }
    }
  }
});

describe('kinesis-record handler', () => {
  let data1: GameDTO;
  let data2: GameDTO;
  let event: KinesisStreamEvent;
  let originalConsole: typeof console;

  beforeEach(() => {
    originalConsole = {
      ...console
    };
    console.log = jest.fn();
    console.error = jest.fn();
    
    putCommandSpy = jest.fn().mockReturnValue('command');
    sendSpy = jest.fn().mockResolvedValue({});
    process.env['DATA_TABLE_NAME'] = 'table';

    data1 = { id: '1', name: 'a', timestamp: 1 };
    data2 = { id: '2', name: 'b', timestamp: 2 };
    event = {
      Records: [{
        eventID: '1',
        eventName: 'test1',
        eventSource: 'source',
        eventSourceARN: 'source-arn',
        eventVersion: 'version',
        invokeIdentityArn: 'identity-arn',
        awsRegion: 'us-west-2',
        kinesis: {
          approximateArrivalTimestamp: 1234,
          kinesisSchemaVersion: '1.0',
          partitionKey: '1',
          sequenceNumber: '1',
          data: btoa(JSON.stringify(data1))
        }
      }, {
        eventID: '2',
        eventName: 'test2',
        eventSource: 'source',
        eventSourceARN: 'source-arn',
        eventVersion: 'version',
        invokeIdentityArn: 'identity-arn',
        awsRegion: 'us-west-2',
        kinesis: {
          approximateArrivalTimestamp: 1234,
          kinesisSchemaVersion: '1.0',
          partitionKey: '1',
          sequenceNumber: '2',
          data: btoa(JSON.stringify(data2))
        }
      }]
    };
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
  });

  test('should process and store all records in DynamoDB', async () => {
    const response = await handler(event);

    expect(response).toEqual([{}, {}]);
    expect(putCommandSpy).toHaveBeenCalledTimes(2);
    expect(putCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Item: {
        pk: { S: 'game#1' }, sk: { S: 'time#1' }, id: { S: '1' }, name: { S: 'a' }, timestamp: { N: "1" }}
    });
    expect(putCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Item: { pk: { S: 'game#2' }, sk: { S: 'time#2' }, id: { S: '2' }, name: { S: 'b' }, timestamp: { N: "2" } }
    });
    expect(sendSpy).toHaveBeenCalledTimes(2);
  });

  test('should throw an error if record data cannot be parsed', async () => {
    event.Records[0].kinesis.data = btoa('bad json');
    const response = await handler(event);
    
    expect(console.error).toHaveBeenCalledWith({
      message: 'unprocessed record',
      timestamp: event.Records[0].kinesis.approximateArrivalTimestamp,
      data: event.Records[0].kinesis.data
    });
  });
});
