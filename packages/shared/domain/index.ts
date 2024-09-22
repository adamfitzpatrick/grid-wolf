import { Environment } from 'aws-cdk-lib';

export { GameDTO, GameDAO, marshallToGameDAO, marshallToGameDTO } from './game';
export { MapDTO, MapDAO, marshallToMapDAO, marshallToMapDTO } from './map';

export type GridWolfEnv = Required<Environment> & {
  prefix: string;
}

export type GridWolfProps = {
  env: GridWolfEnv
}
