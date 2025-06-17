import {
  FunctionalEnvironmentVariableName,
  IntegrationTestEnvironmentVariableName,
} from "@grid-wolf/shared/utils";
import { test, expect } from "../authenticated-test";
import { randomUUID } from "crypto";
import { PlayerGameDTO } from "@grid-wolf/user/lib/player-game-dto";
import { GameDTO } from "@grid-wolf/game/lib/game-dto";
import { DynamoHelper } from "../../lib/dynamo-helper";

const dynamoHelper = new DynamoHelper(
  `dev-${process.env[FunctionalEnvironmentVariableName.DATA_TABLE_NAME]}`
);

test.describe("when getting user info", () => {
  let gameId: string;
  let playerGame: PlayerGameDTO;
  let timestamp: number;

  test.beforeAll(() => {
    timestamp = new Date().getTime();
    gameId = randomUUID();
  });

  test.beforeEach(() => {
    playerGame = {
      playerId: process.env[IntegrationTestEnvironmentVariableName.USER_ID_2]!,
      gameId,
      gameOwnerId: process.env[IntegrationTestEnvironmentVariableName.USER_ID]!,
      email: process.env[IntegrationTestEnvironmentVariableName.USERNAME_2]!,
      participationState: "invited",
      timestamp,
    };
  });

  test("authenticated users can add games that create player entries for those without accounts", async ({
    user2Request,
    getAuthData,
  }) => {
    const userId = getAuthData().users[1].userId;
    const gameDto: GameDTO = {
      gameId: randomUUID(),
      ownerId: userId,
      name: "game",
      players: ["email@email.email"],
      timestamp,
      active: true,
    };
    const response = await user2Request.put("./game", {
      headers: {
        "x-api-key": getAuthData().apiKey.game,
      },
      data: gameDto,
    });
    expect(response.ok()).toBeTruthy();

    const actual = await dynamoHelper.getWithRetries(
      "player#email@email.email",
      `game#${gameDto.gameId}`
    );
    expect(actual).toEqual(
      expect.objectContaining({
        playerId: "email@email.email",
        gameId: gameDto.gameId,
        gameOwnerId: getAuthData().users[1].userId,
        email: "email@email.email",
        participationState: "invited",
        timestamp: expect.anything(),
      })
    );
  });

  test("authenticated users can add games that create player entries for existing accounts", async ({
    request,
    getAuthData,
  }) => {
    const userId = getAuthData().users[0].userId;
    const gameDto: GameDTO = {
      gameId: playerGame.gameId,
      ownerId: userId,
      name: "game",
      players: [process.env[IntegrationTestEnvironmentVariableName.USERNAME_2]!],
      timestamp,
      active: true,
    };
    const response = await request.put("./game", {
      headers: { "x-api-key": getAuthData().apiKey.game },
      data: gameDto,
    });
    expect(response.ok()).toBeTruthy();

    const user2Id = process.env[IntegrationTestEnvironmentVariableName.USER_ID_2];
    const actual = await dynamoHelper.getWithRetries(`player#${user2Id}`, `game#${gameDto.gameId}`);
    expect(actual).toEqual(
      expect.objectContaining({
        ...playerGame,
        gameId: gameDto.gameId,
        timestamp: expect.anything(),
      })
    );
  });

  test("authenticated users can retrieve a game in which they are a player", async ({
    user2Request,
    getAuthData,
  }) => {
    const response = await user2Request.get(`./user/player-game/${playerGame.gameId}`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(await response.json()).toEqual({
      ...playerGame,
      timestamp: expect.anything(),
    });
  });

  test('authenticated users receive "forbidden" when they request a game that does not exist', async ({
    request,
    getAuthData,
  }) => {
    const response = await request.get(`./user/player-game/not-a-game`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(await response.status()).toEqual(403);
  });

  test("authenticated users can retrieve a list of games in which they are a player", async ({
    user2Request,
    getAuthData,
  }) => {
    const response = await user2Request.get("./user/player-game/list", {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(await response.json()).toEqual(
      expect.arrayContaining([{ ...playerGame, timestamp: expect.anything() }])
    );
  });

  test("authenticated users can accept game invitations", async ({ user2Request, getAuthData }) => {
    const response = await user2Request.patch(`./user/player-game/${playerGame.gameId}/accept`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(response.ok()).toBeTruthy();
    playerGame.participationState = "accepted";
    const verify = await user2Request.get(`./user/player-game/${playerGame.gameId}`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(await verify.json()).toEqual({
      ...playerGame,
      timestamp: expect.anything(),
    });
  });

  test("authenticated users can decline game invitations", async ({
    user2Request,
    getAuthData,
  }) => {
    const response = await user2Request.patch(`./user/player-game/${playerGame.gameId}/decline`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(response.ok()).toBeTruthy();
    playerGame.participationState = "declined";
    const verify = await user2Request.get(`./user/player-game/${playerGame.gameId}`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(await verify.json()).toEqual({
      ...playerGame,
      timestamp: expect.anything(),
    });
  });

  test("users cannot submit improper participant states", async ({ user2Request, getAuthData }) => {
    const response = await user2Request.patch(`./user/player-game/${playerGame.gameId}/other`, {
      headers: { "x-api-key": getAuthData().apiKey.user },
    });
    expect(response.status()).toBe(400);
  });
});
