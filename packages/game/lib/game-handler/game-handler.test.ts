import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { handler } from ".";
import { GameDTO } from "@grid-wolf/shared/domain";
import { EnvironmentVariableName, DynamodbSpies } from "@grid-wolf/shared/utils";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

const dynamoSpies = new DynamodbSpies();

jest.mock('jsonwebtoken', () => {
  return {
    decode: () => ({ username: 'user' })
  }
});

describe('game handler', () => {
  let oldConsole: Console;
  let Authorization: string;
  let gameDTO: GameDTO;
  let gameDAO: Record<string, AttributeValue>;
  let event: APIGatewayProxyEvent;

  beforeAll(() => {
    oldConsole = { ...console };
    console.warn = (message: string) => {};
    console.debug = (message: string) => {};
    console.info = (message: string) => {};
  });

  beforeEach(() => {
    process.env[EnvironmentVariableName.DATA_TABLE_NAME] = 'table';
    Authorization = `Bearer TOKEN`;
    gameDTO = {
      id: 'id',
      userId: 'user',
      name: 'name',
      timestamp: 1234
    }
    gameDAO = {
      pk: { S: 'user#user' },
      sk: { S: 'game#id' },
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
    console.debug = oldConsole.debug;
    console.info = oldConsole.info;
  });

  test('/game PUT should save game data to dynamodb', async () => {
    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: 'accepted'
    });
    expect(dynamoSpies.putCommand).toHaveBeenCalledWith({
      TableName: 'table',
      Item: gameDAO
    });
    expect(dynamoSpies.send).toHaveBeenCalledWith({});
  });

  test('/game PUT should return 401 if Authorized user does not match request body user', async () => {
    gameDTO.userId = 'otherperson';
    event.body = JSON.stringify(gameDTO);

    expect(await handler(event)).toEqual({
      statusCode: 400,
      body: 'bad request'
    });

    expect(dynamoSpies.putCommand).not.toHaveBeenCalled();
    expect(dynamoSpies.send).not.toHaveBeenCalled();
  });

  test('/game/{gameId} GET should return data obtained from dynamodb', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    dynamoSpies.send.mockReturnValue({ Item: gameDAO });

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(gameDTO)
    });

    expect(dynamoSpies.getCommand).toHaveBeenCalledWith({
      TableName: 'table',
      Key: {
        pk: { S: 'user#user' },
        sk: { S: 'game#id' }
      }
    });
    expect(dynamoSpies.send).toHaveBeenCalledWith({});
  });

  test('/game/{gameId} GET should return 403 error when game not found', async () => {
    event.requestContext.httpMethod = 'GET';
    event.requestContext.resourcePath = '/game/{gameId}';
    event.pathParameters = {
      gameId: 'id'
    };
    dynamoSpies.send.mockReturnValue({});

    await expect(handler(event)).resolves.toEqual({
      statusCode: 403,
      body: 'forbidden'
    })
  });

  test('/games GET should return a list of game data for the user', async () => {
    event.requestContext.resourcePath = '/games'
    event.requestContext.httpMethod = 'GET'
    dynamoSpies.send.mockReturnValue({ Items: [gameDAO] });

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([gameDTO])
    });
    expect(dynamoSpies.queryCommand).toHaveBeenCalledWith({
      TableName: 'table',
      ExpressionAttributeValues: {
        ':pk': { S: 'user#user' }
      },
      KeyConditionExpression: 'pk = :pk'
    });
    expect(dynamoSpies.send).toHaveBeenCalledWith({})
  });
});
