import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { time } from "console";

export interface GameDAO {
  pk: { S: string };   // game#id
  sk: { S: string };   // time#timestamp
  id: { S: string };
  name: { S: string };
  timestamp: { N: string };
}

export interface GameDTO {
  id: string;
  name: string;
  timestamp: number;
}

export function marshallToDAO(dto: GameDTO) {
  return marshall({
    pk: `game#${dto.id}`,
    sk: `time#${dto.timestamp}`,
    ...dto
  })
}

export function marshallToDTO(dao: GameDAO) {
  const marshalledDto = {
    id: dao.id,
    name: dao.name,
    timestamp: dao.timestamp
  };
  return unmarshall(marshalledDto);
}

