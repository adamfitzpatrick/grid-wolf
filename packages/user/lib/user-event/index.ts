import { EventBridgeEvent, PostConfirmationTriggerEvent } from "aws-lambda";

export const gameInviteDetailType = 'user:GameInvite';
export const gameRemoveInviteDetailType     = 'user:GameRemoveInvite';
export const userEventSource = 'grid-wolf.user';

export interface GameInviteDetail {
  email: string;
  gameId: string;
}
export type GameInviteEvent = EventBridgeEvent<string, GameInviteDetail>;

export type GameRemoveInviteDetail = GameInviteDetail;
export type GameRemoveInviteEvent = EventBridgeEvent<string, GameRemoveInviteDetail>;

export type UserEvent = GameInviteEvent | PostConfirmationTriggerEvent;

