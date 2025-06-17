import { GameItem, GameDTO, gameMapper } from "../game-dto";
import { GameEvent } from "../game-event";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { FunctionalEnvironmentVariableName } from "@grid-wolf/shared/utils";

let tableName = process.env[FunctionalEnvironmentVariableName.DATA_TABLE_NAME]!;
const dao = new DynamoItemDao<GameItem, GameDTO>(tableName, gameMapper);

export async function handler(event: GameEvent) {
  console.info(JSON.stringify(event));
  console.debug({ operationHandled: event["detail-type"] });

  const gameOwnerId = event.detail.playerGame.gameOwnerId;
  const gameId = event.detail.gameId;
  const email = event.detail.playerGame.email;
  const playerId = event.detail.playerGame.playerId;

  const game = await dao.get(gameOwnerId, gameId);

  if (!game) {
    console.warn(`No game found for owner ${gameOwnerId} and gameId ${gameId}`);
    return;
  }

  let found = false;
  game.players = game.players.map((player) => {
    if (player === email) {
      found = true;
      return playerId;
    }
    return player;
  });

  if (found) {
    return await dao.put(game);
  }
  console.warn(`No player with email ${email} found in game ${gameId}`);
}
