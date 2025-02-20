import { EventBridgeEvent } from "aws-lambda";
import { PlayerGameDTO } from '@grid-wolf/user/lib/player-game-dto'

export const invitationUpdateDetailType = 'game:InvitationUpdate';
export const gameEventSource = 'grid-wolf.game';

export interface InvitationUpdateDetail {
  gameId: string;
  playerGame: PlayerGameDTO
}
export type InvitationUpdateEvent = EventBridgeEvent<string, InvitationUpdateDetail>;

export type GameEvent = InvitationUpdateEvent;
