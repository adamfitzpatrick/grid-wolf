import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { time } from "console";

export interface GameDAO {
  pk: { S: string };   // game#id
  sk: { S: string };   // user#userId
  id: { S: string };
  userId: { S: string };
  name: { S: string };
  timestamp: { N: string };
}

export interface GameDTO {
  id: string;
  userId: string;
  name: string;
  timestamp: number;
}

export function marshallToDAO(dto: GameDTO) {
  return marshall({
    pk: `user#${dto.userId}`,
    sk: `game#${dto.id}`,
    ...dto
  })
}

export function marshallToDTO(dao: GameDAO) {
  const marshalledDto = {
    id: dao.id,
    userId: dao.userId,
    name: dao.name,
    timestamp: dao.timestamp
  };
  return unmarshall(marshalledDto);
}

