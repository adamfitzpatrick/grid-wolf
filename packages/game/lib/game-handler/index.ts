import { PutItemCommand, GetItemCommand, QueryCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GameDTO, GameDAO, marshallToDAO, marshallToDTO } from "@grid-wolf/shared/domain";
import { EnvironmentVariableName } from "@grid-wolf/shared/utils";
import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from 'jsonwebtoken';
import { captureAWSv3Client } from 'aws-xray-sdk';

const client = captureAWSv3Client(new DynamoDBClient());
let TableName: string;

const parseAuthToken = (event: APIGatewayProxyEvent) => {
  // Auth header is always present because requests are not accepted without it.
  const authHeader = event.headers.Authorization!;
  const token = authHeader.replace(/^Bearer\s/, '');
  return decode(token) as JwtPayload;
}

const handlePutGameOperation = async (event: APIGatewayProxyEvent) => {
  const gameDTO = JSON.parse(event.body!) as GameDTO;
  const { username } = parseAuthToken(event);

  if (username !== gameDTO.userId) {
    console.warn(
      `Username mismatch: auth user is ${username}, but request was for ${gameDTO.userId}`
    )
    return {
      statusCode: 400,
      message: 'bad request'
    };
  }
  const command = new PutItemCommand({
    TableName,
    Item: marshallToDAO(gameDTO)
  });
  return client.send(command).then(() => ({
    statusCode: 202,
    message: 'accepted'
  }));
}

const handleGetGameOperation = async (event: APIGatewayProxyEvent) => {
  const gameId = event.pathParameters!['gameId'];
  const { username } = parseAuthToken(event);

  const command = new GetItemCommand({
    TableName,
    Key: {
      pk: { S: `user#${username}` },
      sk: { S: `game#${gameId}` }
    }
  });
  const response = await client.send(command);
  return {
    statusCode: 200,
    body: JSON.stringify(marshallToDTO(response.Item as any as GameDAO))
  };
}

const handleGetGamesOperation = async (event: APIGatewayProxyEvent) => {
  const { username } = parseAuthToken(event);

  const command = new QueryCommand({
    TableName,
    ExpressionAttributeValues: {
      ':pk': { S: `user#${username}`}
    },
    KeyConditionExpression: 'pk = :pk'
  });
  const response = await client.send(command);
  return {
    statusCode: 200,
    body: JSON.stringify((response.Items as any as GameDAO[]).map(marshallToDTO))
  }
}

export async function handler(event: APIGatewayProxyEvent) {
  TableName = process.env[EnvironmentVariableName.DATA_TABLE_NAME]!;
  const { path, httpMethod } = event.requestContext;
  if (path === '/game' && httpMethod === 'PUT') {
    return handlePutGameOperation(event);
  } else if (path === '/game' && httpMethod === 'GET') {
    return handleGetGameOperation(event);
  } else if (path === '/games' && httpMethod === 'GET') {
    return handleGetGamesOperation(event);
  }
  return null;
}
