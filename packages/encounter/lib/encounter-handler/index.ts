import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from 'jsonwebtoken';
import { DynamoItemDao } from 'stepinto-aws-tools/clients';
import { encounterMapper, EncounterItem, EncounterDTO } from "../encounter-dto";
import { EnvironmentVariableName } from "stepinto-aws-tools/utils";
import { GameItem, GameDTO, gameMapper } from "@grid-wolf/game/lib/game-dto";

let tableName = process.env[EnvironmentVariableName.DATA_TABLE_NAME]!;
let gameDao = new DynamoItemDao<GameItem, GameDTO>(tableName, gameMapper);
let encounterDao = new DynamoItemDao<EncounterItem, EncounterDTO>(tableName, encounterMapper);

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
    `Username mismatch: auth user is ${username}, but encounter game is owned by ${owner}`
  )
  return addCORS({
    statusCode: 400,
    body: 'bad request'
  });
}

const handlePutEncounterOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'putEncounter' });
  const encounterDTO = JSON.parse(event.body!) as EncounterDTO;
  const { username } = parseAuthToken(event);

  const gameDTO = await gameDao.get(username, encounterDTO.gameId);
  if (!gameDTO) {
    return addCORS({
      statusCode: 403,
      body: 'forbidden'
    })
  }
  if (username !== gameDTO.ownerId) {
    return handleUsernameMismatch(username, gameDTO.ownerId);
  }

  return encounterDao.put(encounterDTO).then(() => {
    return addCORS({
      statusCode: 202,
      body: 'accepted'
    })
  });
}

const handleGetEncounterOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getEncounter' });
  const gameId = event.pathParameters!['gameId']!;
  const encounterId = event.pathParameters!['encounterId']!;
  const { username } = parseAuthToken(event);

  const game = await gameDao.get(username, gameId);
  if (!game) {
    return addCORS({
      statusCode: 403,
      body: 'forbidden'
    });
  }
  let encounter = await encounterDao.get(game.gameId, encounterId);
  if (!encounter) {
    return addCORS({
      statusCode: 403,
      body: 'forbidden'
    })
  }
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(encounter)
  });
}

const handleGetEncountersOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getEncounters' });
  const { username } = parseAuthToken(event);
  const gameId = event.pathParameters!['gameId']!

  const game = await gameDao.get(username, gameId);
  if (!game) {
    return addCORS({
      statusCode: 403,
      body: 'forbidden'
    })
  }

  let encounters = await encounterDao.getAll(gameId);
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(encounters)
  })
}

const handleDeleteEncounterOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'deleteEntity' });
  const { username } = parseAuthToken(event);
  const gameId = event.pathParameters!['gameId']!;
  const encounterId = event.pathParameters!['encounterId']!;

  const game = await gameDao.get(username, gameId);
  if (!game) {
    return addCORS({
      statusCode: 202,
      body: 'accepted'
    })
  }
  return encounterDao.delete(gameId, encounterId).then(() => {
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
    returnValue = await handlePutEncounterOperation(event);
  } else if (resourcePath === '/{gameId}/{encounterId}' && httpMethod === 'GET') {
    returnValue = await handleGetEncounterOperation(event);
  } else if (resourcePath === '/list/{gameId}' && httpMethod === 'GET') {
    returnValue = await handleGetEncountersOperation(event);
  } else if (resourcePath === '/{gameId}/{encounterId}' && httpMethod === 'DELETE') {
    returnValue = await handleDeleteEncounterOperation(event);
  } else {
    throw new Error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`);
  }
  console.debug({ returnValue });
  return returnValue;
}
