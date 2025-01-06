import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from 'jsonwebtoken';
import { DynamoItemDao } from 'stepinto-aws-tools/clients';
import { gameMapper, GameItem, GameDTO } from "../game-dto";

let dao = new DynamoItemDao<GameItem, GameDTO>('Table', gameMapper);

const parseAuthToken = (event: APIGatewayProxyEvent) => {
  // Auth header is always present because requests are not accepted without it.
  const authHeader = event.headers.Authorization!;
  const token = authHeader.replace(/^Bearer\s/, '');
  return decode(token) as JwtPayload;
}

const handlePutGameOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'putGame' });
  const gameDTO = JSON.parse(event.body!) as GameDTO;
  const { username } = parseAuthToken(event);

  if (username !== gameDTO.ownerId) {
    console.warn(
      `Username mismatch: auth user is ${username}, but request was for ${gameDTO.ownerId}`
    )
    return {
      statusCode: 400,
      body: 'bad request'
    };
  }
  return dao.put(gameDTO).then(() => {
    return {
      statusCode: 202,
      body: 'accepted'
    }
  });
}

const handleGetGameOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getGame' });
  const gameId = event.pathParameters!['gameId']!;
  const { username } = parseAuthToken(event);

  let game = await dao.get(username, gameId);
  if (!game) {
    return {
      statusCode: 403,
      body: 'access denied'
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(game)
  };
}

const handleGetGamesOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getGames' });
  const { username } = parseAuthToken(event);

  let games = await dao.getAll(username);
  return {
    statusCode: 200,
    body: JSON.stringify(games)
  }
}

export async function handler(event: APIGatewayProxyEvent) {
  console.info(JSON.stringify(event));
  const { resourcePath, httpMethod } = event.requestContext;

  let returnValue: object | null = null;
  if (resourcePath === '/game' && httpMethod === 'PUT') {
    returnValue = await handlePutGameOperation(event);
  } else if (resourcePath === '/game/{gameId}' && httpMethod === 'GET') {
    returnValue = await handleGetGameOperation(event);
  } else if (resourcePath === '/games' && httpMethod === 'GET') {
    returnValue = await handleGetGamesOperation(event);
  } else {
    console.error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`)
  }
  console.debug({ returnValue })
  return returnValue;
}
