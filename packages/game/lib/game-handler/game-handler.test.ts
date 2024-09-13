import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from ".";
import { GameDAO, GameDTO } from "@grid-wolf/shared/domain";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";

let sendSpy: jest.Mock;
let putCommandSpy: jest.Mock;
let getCommandSpy: jest.Mock;
let queryCommandSpy: jest.Mock;

jest.mock('aws-xray-sdk', () => {
  return {
    captureAWSv3Client: (client: any) => client
  }
});
jest.mock('jsonwebtoken', () => {
  return {
    decode: () => ({ username: 'user' })
  }
})
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

describe('game handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let gameDTO: GameDTO;
  let gameDAO: GameDAO;
  let event: APIGatewayProxyEvent;

  beforeAll(() => {
    oldConsole = { ...console };
    console.warn = (message: string) => {};
  });

  beforeEach(() => {
    sendSpy = jest.fn().mockResolvedValue({});
    putCommandSpy = jest.fn().mockReturnValue({});
    getCommandSpy = jest.fn().mockReturnValue({});
    queryCommandSpy = jest.fn().mockReturnValue({});
    
    process.env[EnvironmentVariableName.DATA_TABLE_NAME] = 'table';
    Authorization = `Bearer TOKEN`;
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
    event = {
      body: JSON.stringify(gameDTO),
      requestContext: {
        httpMethod: 'PUT',
        resourcePath: '/game'
      },
      headers: {
        Authorization
      }
    } as any as APIGatewayProxyEvent
  });

  afterAll(() => {
    console.warn = oldConsole.warn;
  });

  test('/game PUT should save game data to dynamodb', async () => {
    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted'
    });
    expect(putCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Item: gameDAO
    });
    expect(sendSpy).toHaveBeenCalledWith({});
  });

  test('/game PUT should return 401 if Authorized user does not match request body user', async () => {
    gameDTO.userId = 'otherperson';
    event.body = JSON.stringify(gameDTO);

    expect(await handler(event)).toEqual({
      statusCode: 400,
      body: 'bad request'
    });

    expect(putCommandSpy).not.toHaveBeenCalled();
    expect(sendSpy).not.toHaveBeenCalled();
  });

  test('/game/{gameId} GET should return data obtained from dynamodb', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    sendSpy.mockReturnValue({ Item: gameDAO });

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(gameDTO)
    });

    expect(getCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      Key: {
        pk: { S: 'user#user' },
        sk: { S: 'game#id'}
      }
    });
    expect(sendSpy).toHaveBeenCalledWith({});
  });

  test('/games GET should return a list of game data for the user', async () => {
    event.requestContext.resourcePath = '/games'
    event.requestContext.httpMethod = 'GET'
    sendSpy.mockReturnValue({ Items: [ gameDAO ] });

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([ gameDTO ])
    });
    expect(queryCommandSpy).toHaveBeenCalledWith({
      TableName: 'table',
      ExpressionAttributeValues: {
        ':pk': { S: 'user#user' }
      },
      KeyConditionExpression: 'pk = :pk'
    });
    expect(sendSpy).toHaveBeenCalledWith({})
  });
});
