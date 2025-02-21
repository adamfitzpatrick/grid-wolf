import { DynamoItem, ObjectMapper } from 'stepinto-aws-tools/clients';

export interface Attribute {
  name: string;
  value: string | number;
}

export interface EntityItem extends DynamoItem {
  entityId: string;
  ownerId: string;
  name: string;
  maxHealth: number;
  movementSpeed: number;
  attributes: Attribute[];
  timestamp: number;
  active: boolean;
}

export interface EntityDTO {
  entityId: string;
  ownerId: string;
  name: string;
  maxHealth: number;
  movementSpeed: number;
  attributes: Attribute[];
  timestamp: number;
  active: boolean;
}

export const entityMapper = new ObjectMapper<EntityItem, EntityDTO>({
  pkPrefix: 'user',
  skPrefix: 'entity',
  pkFieldName: 'ownerId',
  skFieldName: 'entityId'
})
