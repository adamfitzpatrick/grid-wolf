import { DynamoItem, ObjectMapper } from "stepinto-aws-tools/clients";

export interface Vector {
  x: number;
  y: number;
}

export interface GridData {
  origin: Vector;
  cellWidth: number;
  difficult: Vector[];
  impassable: Vector[];
}

export interface MapItem extends DynamoItem {
  mapId: string;
  ownerId: string;
  name: string;
  imageUrl: string;
  gridData: GridData;
  timestamp: number;
  active: boolean;
}

export interface MapDTO {
  mapId: string;
  ownerId: string;
  name: string;
  imageUrl: string;
  gridData: GridData;
  timestamp: number;
  active: boolean;
}

export const mapMapper = new ObjectMapper<MapItem, MapDTO>({
  pkPrefix: 'user',
  skPrefix: 'map',
  pkFieldName: 'ownerId',
  skFieldName: 'mapId'
})
