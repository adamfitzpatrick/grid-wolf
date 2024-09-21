import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { DAO, marshallToDTO } from "../dao";
import { DTO, marshallToDAO } from "../dto";

const pkPrefix = 'user';
const pkField = 'userId';
const skPrefix = 'game';
const skField = 'id';

export interface GameDAO extends DAO {
  pk: { S: string };   // user#userId
  sk: { S: string };   // game#id
  id: { S: string };
  userId: { S: string };
  name: { S: string };
  timestamp: { N: string };
}

export interface GameDTO extends DTO {
  id: string;
  userId: string;
  name: string;
  timestamp: number;
}

export function marshallToGameDAO(dto: GameDTO): Record<string, AttributeValue> {
  return marshallToDAO<GameDTO, GameDAO>(
    dto, pkPrefix, pkField, skPrefix, skField) as any as Record<string, AttributeValue>;
}

export function marshallToGameDTO(dao: Record<string, AttributeValue>) {
  return marshallToDTO<GameDAO, GameDTO>(dao as any as GameDAO);
}

