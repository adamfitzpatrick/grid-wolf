import { Environment } from 'aws-cdk-lib';

export { GameDTO, GameDAO, marshallToDAO, marshallToDTO } from './game';

export type GridWolfEnv = Required<Environment> & {
  prefix: string;
}

export type GridWolfProps = {
  env: GridWolfEnv
}
