import { DynamoItem, ObjectMapper } from "stepinto-aws-tools/clients";

export interface MapItem extends DynamoItem {
  mapId: string;
  ownerId: string;
  name: string;
  imageUri: string;
  gridData: object;
  timestamp: number;
  active: boolean;
}

export interface MapDTO {
  mapId: string;
  ownerId: string;
  name: string;
  imageUri: string;
  gridData: object;
  timestamp: number;
  active: boolean;
}

export const mapMapper = new ObjectMapper<MapItem, MapDTO>({
  pkPrefix: 'user',
  skPrefix: 'map',
  pkFieldName: 'ownerId',
  skFieldName: 'mapId'
})
