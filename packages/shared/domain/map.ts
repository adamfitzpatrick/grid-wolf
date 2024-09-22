import { DAO, marshallToDTO } from "./dao";
import { DTO, marshallToDAO } from "./dto";

const pkPrefix = 'user';
const pkField = 'userId';
const skPrefix = 'map';
const skField = 'id';

export interface MapDAO extends DAO {
  name: { S: string };
  timestamp: { N: string };
  imageName: { S: string };
}

export interface MapDTO extends DTO {
  name: string;
  timestamp: number;
  imageName: string;
}

export function marshallToMapDAO(dto: MapDTO): MapDAO {
  return marshallToDAO<MapDTO, MapDAO>(
    dto,
    pkPrefix,
    pkField,
    skPrefix,
    skField
  ) as MapDAO;
}

export function marshallToMapDTO(dao: MapDAO): MapDTO {
  return marshallToDTO<MapDAO, MapDTO>(dao);
}
