import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from "jsonwebtoken";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { entityMapper, EntityItem, EntityDTO } from "../entity-dto";
import { EntityEnvironmentVariable } from "../../infra/lib/entity-stack";

let tableName = process.env[EntityEnvironmentVariable.DATA_TABLE_NAME]!;

let dao = new DynamoItemDao<EntityItem, EntityDTO>(tableName, entityMapper);

const addCORS = (baseResponse: object) => {
  return {
    ...baseResponse,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Origin": "*",
    },
  };
};

const parseAuthToken = (event: APIGatewayProxyEvent) => {
  // Auth header is always present because requests are not accepted without it.
  const authHeader = event.headers.Authorization!;
  const token = authHeader.replace(/^Bearer\s/, "");
  return decode(token) as JwtPayload;
};

const handleUsernameMismatch = (username: string, owner: string) => {
  console.warn(`Username mismatch: auth user is ${username}, but request was for ${owner}`);
  return addCORS({
    statusCode: 400,
    body: "bad request",
  });
};

const handlePutEntityOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "putEntity" });
  const entityDTO = JSON.parse(event.body!) as EntityDTO;
  const { username } = parseAuthToken(event);

  if (username !== entityDTO.ownerId) {
    return handleUsernameMismatch(username, entityDTO.ownerId);
  }
  const promises: Promise<unknown>[] = [dao.put(entityDTO)];

  return Promise.all(promises).then(() => {
    return addCORS({
      statusCode: 202,
      body: "accepted",
    });
  });
};

const handleGetEntityOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "getEntity" });
  const entityId = event.pathParameters!["entityId"]!;
  const { username } = parseAuthToken(event);

  let entity = await dao.get(username, entityId);
  if (!entity) {
    return addCORS({
      statusCode: 403,
      body: "forbidden",
    });
  }
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(entity),
  });
};

const handleGetEntitysOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "getEntitys" });
  const { username } = parseAuthToken(event);

  let entitys = await dao.getAll(username);
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(entitys),
  });
};

const handleDeleteEntityOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "deleteEntity" });
  const { username } = parseAuthToken(event);
  const entityId = event.pathParameters!["entityId"]!;
  return dao.delete(username, entityId).then(() => {
    return addCORS({
      statusCode: 202,
      body: "accepted",
    });
  });
};

export async function handler(event: APIGatewayProxyEvent) {
  console.info(JSON.stringify(event));
  const { resourcePath, httpMethod } = event.requestContext;

  let returnValue: object | null = null;
  if (resourcePath === "/" && httpMethod === "PUT") {
    returnValue = await handlePutEntityOperation(event);
  } else if (resourcePath === "/{entityId}" && httpMethod === "GET") {
    returnValue = await handleGetEntityOperation(event);
  } else if (resourcePath === "/list" && httpMethod === "GET") {
    returnValue = await handleGetEntitysOperation(event);
  } else if (resourcePath === "/{entityId}" && httpMethod === "DELETE") {
    returnValue = await handleDeleteEntityOperation(event);
  } else {
    throw new Error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`);
  }
  console.debug({ returnValue });
  return returnValue;
}
