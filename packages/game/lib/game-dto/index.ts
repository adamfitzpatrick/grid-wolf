import { DynamoItem, ObjectMapper } from 'stepinto-aws-tools/clients';

export interface GameItem extends DynamoItem {
  gameId: string;
  ownerId: string;
  name: string;
  players: string[];
  timestamp: number;
  active: boolean;
}

export interface GameDTO {
  gameId: string;
  ownerId: string;
  name: string;
  players: string[]; // TODO Incorporate UserDTO
  timestamp: number;
  active: boolean
}

export const gameMapper = new ObjectMapper<GameItem, GameDTO>({
  pkPrefix: 'user',
  skPrefix: 'game',
  pkFieldName: 'ownerId',
  skFieldName: 'gameId'
})
