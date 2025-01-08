import { DynamoItem, ObjectMapper } from "stepinto-aws-tools/clients";

export interface MapItem extends DynamoItem {
  mapId: string;
  ownerId: string;
  imageUri: string;
  gridData: object;
  created: string;
}

export interface MapDTO {
  mapId: string;
  ownerId: string;
  name: string;
  imageUri: string;
  gridData: object;
  created: string;
}

export const mapMapper = new ObjectMapper<MapItem, MapDTO>({
  pkPrefix: 'user',
  skPrefix: 'map',
  pkFieldName: 'ownerId',
  skFieldName: 'mapId'
})
