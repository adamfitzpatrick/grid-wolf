import { DynamoClient } from ".";
import { GameDAO, GameDTO } from "../../domain";
import { EnvironmentVariableName } from "../env-loader";

let sendSpy: jest.Mock;
let putCommandSpy: jest.Mock;
let getCommandSpy: jest.Mock;
let queryCommandSpy: jest.Mock;

jest.mock('aws-xray-sdk', () => {
  return {
    captureAWSv3Client: (client: any) => client
  };
});
jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    PutItemCommand: function (params: any) { return putCommandSpy(params); },
    GetItemCommand: function (params: any) { return getCommandSpy(params); },
    QueryCommand: function (params: any) { return queryCommandSpy(params); },
    DynamoDBClient: function () {
      return {
        send: (command: any) => sendSpy(command)
      }
    },
  }
});

describe('DynamoDBClient', () => {
  let gameDAO: GameDAO;
  let gameDTO: GameDTO;
  let sut: DynamoClient<GameDTO>;

  beforeEach(() => {
    sendSpy = jest.fn();
    putCommandSpy = jest.fn().mockReturnValue({});
    getCommandSpy = jest.fn().mockReturnValue({});
    queryCommandSpy = jest.fn().mockReturnValue({});

    process.env[EnvironmentVariableName.DATA_TABLE_NAME] = 'table';

    gameDTO = {
      id: 'id',
      userId: 'user',
      name: 'name',
      timestamp: 1234
    };
    gameDAO = {
      pk: { S: 'user#user'},
      sk: { S: 'game#id'},
      id: { S: 'id' },
      userId: { S: 'user' },
      name: { S: 'name' },
      timestamp: { N: '1234' }
    };

    sut = new DynamoClient<GameDTO>('GameDTO');
  });

  test('get should return a single item', async () => {
    sendSpy.mockResolvedValue({ Item: gameDAO });

    await expect(sut.get('user', 'id')).resolves.toEqual(gameDTO);

    expect(getCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Key: {
        pk: { S: 'user#user' },
        sk: { S: 'game#id'}
      }
    });
    expect(sendSpy).toHaveBeenCalledWith({});
  });

  test('get should be rejected if the item does not exist', async () => {
    sendSpy.mockResolvedValue({});

    await expect(sut.get('user', 'id')).rejects.toEqual('not found');

    expect(getCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Key: {
        pk: { S: 'user#user' },
        sk: { S: 'game#id'}
      }
    });
    expect(sendSpy).toHaveBeenCalledWith({});
  });

  test('list should return a collection of items', async () => {
    sendSpy.mockResolvedValue({ Items: [ gameDAO ]});

    await expect(sut.list('user')).resolves.toEqual([ gameDTO ]);

    expect(queryCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      ExpressionAttributeValues: {
        ':pk': { S: 'user#user' },
        ':sk': { S: 'game' }
      },
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)'
    });
    expect(sendSpy).toHaveBeenCalledWith({});
  });

  test('list should return an empty list if there are no items', async () => {
    sendSpy.mockResolvedValue({ Items: []});

    await expect(sut.list('user')).resolves.toEqual([]);

    expect(queryCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      ExpressionAttributeValues: {
        ':pk': { S: 'user#user' },
        ':sk': { S: 'game' }
      },
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)'
    });
    expect(sendSpy).toHaveBeenCalledWith({});});

  test('put should save a single item', async () => {
    sendSpy.mockResolvedValue({});

    await expect(sut.put(gameDTO)).resolves.toEqual(gameDTO);

    expect(putCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Item: gameDAO
    });
    expect(sendSpy).toHaveBeenCalledWith({});
  });
});
