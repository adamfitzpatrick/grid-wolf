import { DynamoItem, ObjectMapper } from 'stepinto-aws-tools/clients';

export type InvitationState = 'accepted' | 'declined';
export type ParticipationState = InvitationState | 'invited' | 'joined' | 'removed';

export interface PlayerGameItem extends DynamoItem {
  playerId: string;
  gameId: string;
  gameOwnerId: string;
  email: string;
  participationState: ParticipationState;
  timestamp: number;
}

export interface PlayerGameDTO {
  playerId: string;
  gameId: string;
  gameOwnerId: string;
  email: string;
  participationState: ParticipationState;
  timestamp: number;
}

export const playerGameMapper = new ObjectMapper<PlayerGameItem, PlayerGameDTO>({
  pkPrefix: 'player',
  skPrefix: 'game',
  pkFieldName: 'playerId',
  skFieldName: 'gameId'
})
