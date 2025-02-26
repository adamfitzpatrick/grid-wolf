import { DynamoItem, ObjectMapper } from 'stepinto-aws-tools/clients';


export interface EncounterItem extends DynamoItem {
  encounterId: string;
  gameId: string;
  name: string;
  nonPlayerCharacters: string[];
  timestamp: number;
  active: boolean;
}

export interface EncounterDTO {
  encounterId: string;
  gameId: string;
  name: string;
  nonPlayerCharacters: string[];
  timestamp: number;
  active: boolean;
}

export const encounterMapper = new ObjectMapper<EncounterItem, EncounterDTO>({
  pkPrefix: 'game',
  skPrefix: 'encounter',
  pkFieldName: 'gameId',
  skFieldName: 'encounterId'
})
