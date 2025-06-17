import { APIGatewayProxyEvent } from "aws-lambda";
import { decode, JwtPayload } from "jsonwebtoken";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import {
  InvitationState,
  ParticipationState,
  PlayerGameDTO,
  PlayerGameItem,
  playerGameMapper,
} from "../player-game-dto";
import { UserEnvironmentVariable } from "../../infra/lib/user-stack";

type ParticipantAction = "accept" | "decline";

let tableName = process.env[UserEnvironmentVariable.DATA_TABLE_NAME]!;

let dao = new DynamoItemDao<PlayerGameItem, PlayerGameDTO>(tableName!, playerGameMapper);

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

const getParticipationState = (action: ParticipantAction): InvitationState => {
  if (action === "accept") {
    return "accepted";
  } else if (action === "decline") {
    return "declined";
  }
  throw new Error("Invalid participant state");
};

const handleGetPlayerGameOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "getPlayerGame" });
  const gameId = event.pathParameters!["gameId"]!;
  const { username } = parseAuthToken(event);

  let playerGame = await dao.get(username, gameId);
  if (!playerGame) {
    return addCORS({
      statusCode: 403,
      body: "forbidden",
    });
  }
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(playerGame),
  });
};

const handleGetPlayerGameListOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "optionsPlayerGameList" });
  const { username } = parseAuthToken(event);

  let playerGames = await dao.getAll(username);
  return addCORS({
    statusCode: 200,
    body: JSON.stringify(playerGames),
  });
};

const handlePatchPlayerGameParticipationActionOperation = async (event: APIGatewayProxyEvent) => {
  console.debug({ operationHandled: "patchPlayerGameParticipantAction" });
  const gameId = event.pathParameters!["gameId"]!;
  const action = event.pathParameters!["participantAction"]! as ParticipantAction;
  const { username } = parseAuthToken(event);

  let participationState: ParticipationState;
  try {
    participationState = getParticipationState(action);
  } catch {
    return addCORS({
      statusCode: 400,
      body: "bad request",
    });
  }

  let playerGame = await dao.get(username, gameId);
  if (!playerGame) {
    return addCORS({
      statusCode: 403,
      body: "forbidden",
    });
  }

  playerGame.participationState = participationState;
  return dao.put(playerGame).then(() => {
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
  if (resourcePath === "/player-game/{gameId}" && httpMethod === "GET") {
    returnValue = await handleGetPlayerGameOperation(event);
  } else if (resourcePath === "/player-game/list" && httpMethod === "GET") {
    returnValue = await handleGetPlayerGameListOperation(event);
  } else if (
    resourcePath === "/player-game/{gameId}/{participantAction}" &&
    httpMethod === "PATCH"
  ) {
    returnValue = await handlePatchPlayerGameParticipationActionOperation(event);
  } else {
    throw new Error(`No handler to invoke for path ${resourcePath} and method ${httpMethod}`);
  }
  console.debug({ returnValue });
  return returnValue;
}
