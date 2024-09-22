import { DAO, marshallToDTO } from "./dao";
import { DTO, marshallToDAO } from "./dto";

const pkPrefix = 'user';
const pkField = 'userId';
const skPrefix = 'game';
const skField = 'id';

export interface GameDAO extends DAO {
  name: { S: string };
  timestamp: { N: string };
}

export interface GameDTO extends DTO {
  name: string;
  timestamp: number;
}

export function marshallToGameDAO(dto: GameDTO): GameDAO {
  return marshallToDAO<GameDTO, GameDAO>(
    dto,
    pkPrefix,
    pkField,
    skPrefix,
    skField
  ) as GameDAO;
}

export function marshallToGameDTO(dao: GameDAO): GameDTO {
  return marshallToDTO<GameDAO, GameDTO>(dao);
}

