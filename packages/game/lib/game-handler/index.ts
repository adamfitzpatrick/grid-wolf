import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from 'jsonwebtoken';
import { DynamoItemDao } from 'stepinto-aws-tools/clients';
import { gameMapper, GameItem, GameDTO } from "../game-dto";
import { EnvironmentVariableName } from "stepinto-aws-tools/utils";
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { GameInviteDetail, gameInviteDetailType } from "@grid-wolf/user/lib/user-event";
import { gameEventSource } from "../game-event";

let tableName = process.env[EnvironmentVariableName.DATA_TABLE_NAME]!;
let dao = new DynamoItemDao<GameItem, GameDTO>(tableName, gameMapper);

let eventsClient = new EventBridgeClient();

const addCORS = (baseResponse: object) => {
  return {
    ...baseResponse,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*',
    }
  }
}

const parseAuthToken = (event: APIGatewayProxyEvent) => {
  // Auth header is always present because requests are not accepted without it.
  const authHeader = event.headers.Authorization!;
  const token = authHeader.replace(/^Bearer\s/, '');
  return decode(token) as JwtPayload;
}

const handleUsernameMismatch = (username: string, owner: string) => {
  console.warn(
    `Username mismatch: auth user is ${username}, but request was for ${owner}`
  )
  return addCORS({
    statusCode: 400,
    body: 'bad request'
  });
}

const handlePutGameOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'putGame' });
  const gameDTO = JSON.parse(event.body!) as GameDTO;
  const { username } = parseAuthToken(event);

  if (username !== gameDTO.ownerId) {
    return handleUsernameMismatch(username, gameDTO.ownerId);
  }
  const promises: Promise<unknown>[] =  [dao.put(gameDTO)];
  
  if (gameDTO.players.length > 0) {
    const details: GameInviteDetail[] = gameDTO.players.map(email => {
      return {
        email,
        gameId: gameDTO.gameId,
        gameOwnerId: gameDTO.ownerId
      }
    });
    const command = new PutEventsCommand({
      Entries: details.map(detail => {
        return {
          DetailType: gameInviteDetailType,
          Detail: JSON.stringify(detail),
          EventBusName: process.env['EVENT_BUS']!,
          Source: gameEventSource
        }
      })
    });
    promises.push(eventsClient.send(command));
}
  
  return Promise.all(promises).then(() => {
    return addCORS({
      statusCode: 202,
      body: 'accepted'
    })
  });
}

const handleGetGameOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getGame' });
  const gameId = event.pathParameters!['gameId']!;
  const { username } = parseAuthToken(event);

  let game = await dao.get(username, gameId);
  if (!game) {
    return addCORS({
      statusCode: 403,
      body: 'forbidden'
    })
  }
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(game)
  });
}

const handleGetGamesOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getGames' });
  const { username } = parseAuthToken(event);

  let games = await dao.getAll(username);
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(games)
  })
}

const handleDeleteGameOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'deleteGame'});
  const { username } = parseAuthToken(event);
  const gameId = event.pathParameters!['gameId']!;
  return dao.delete(username, gameId).then(() => {
    return addCORS({
      statusCode: 202,
      body: 'accepted'
    })
  })
}

export async function handler(event: APIGatewayProxyEvent) {
  console.info(JSON.stringify(event));
  const { resourcePath, httpMethod } = event.requestContext;

  let returnValue: object | null = null;
  if (resourcePath === '/' && httpMethod === 'PUT') {
    returnValue = await handlePutGameOperation(event);
  } else if (resourcePath === '/{gameId}' && httpMethod === 'GET') {
    returnValue = await handleGetGameOperation(event);
  } else if (resourcePath === '/list' && httpMethod === 'GET') {
    returnValue = await handleGetGamesOperation(event);
  } else if (resourcePath === '/{gameId}' && httpMethod === 'DELETE') {
    returnValue = await handleDeleteGameOperation(event);
  } else {
    throw new Error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`);
  }
  console.debug({ returnValue });
  return returnValue;
}
