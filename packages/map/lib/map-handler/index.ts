import { MapDTO } from "@grid-wolf/shared/domain";
import { DynamoClient } from '@grid-wolf/shared/utils';
import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from "jsonwebtoken";

const client = new DynamoClient<MapDTO>('MapDTO');

const parseAuthToken = (event: APIGatewayProxyEvent) => {
  // Auth header is always present because requests are not accepted without it.
  const authHeader = event.headers.Authorization!;
  const token = authHeader.replace(/^Bearer\s/, '');
  return decode(token) as JwtPayload;
};

const handlePutMapOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'putMap' });
  const gameDTO = JSON.parse(event.body!) as MapDTO;
  const { username } = parseAuthToken(event);

  if (username !== gameDTO.userId) {
    console.warn(
      `Username mismatch: auth user is ${username}, but request was for ${gameDTO.userId}`
    )
    return {
      statusCode: 400,
      body: 'bad request'
    };
  }
  return client.put(gameDTO).then(() => ({
    statusCode: 202,
    body: 'accepted'
  }));
};

const handleGetMapOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMap' });
  const mapId = event.pathParameters!['mapId']!;
  const { username } = parseAuthToken(event);

  let map: MapDTO;
  try {
    map = await client.get(username, mapId);
  } catch (e) {
    return {
      statusCode: 403,
      body: 'forbidden'
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(map)
  };
};

const handleGetMapsOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: 'getMaps' });
  const { username } = parseAuthToken(event);

  let maps;
  try {
    maps = await client.list(username);
  } catch (e) {
    console.error(`Error getting game list for ${username}: ${e}`)
    return {
      statusCode: 500,
      body: 'Internal server error'
    }
  }
  return {
    statusCode: 200,
    body: JSON.stringify(maps)
  }
};

export async function handler(event: APIGatewayProxyEvent) {
  console.info(JSON.stringify(event));
  const { resourcePath, httpMethod } = event.requestContext;

  let returnValue: object | null = null;
  if (resourcePath === '/map' && httpMethod === 'PUT') {
    returnValue = await handlePutMapOperation(event);
  } else if (resourcePath === '/map/{mapId}' && httpMethod === 'GET') {
    returnValue = await handleGetMapOperation(event);
  } else if (resourcePath === '/maps' && httpMethod === 'GET') {
    returnValue = await handleGetMapsOperation(event);
  } else {
    console.error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`)
  }
  console.debug({ returnValue })
  return returnValue;
}
