import { EnvironmentVariableName } from "@grid-wolf/shared/utils";
import { PlayerGameDTO, PlayerGameItem, playerGameMapper } from "../player-game-dto";
import { gameInviteDetailType, GameInviteEvent, UserEvent } from "../user-event";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { PostConfirmationTriggerEvent } from "aws-lambda";
import { invitationUpdateDetailType } from "@grid-wolf/game/lib/game-event";
import { CognitoIdentityProviderClient, AdminGetUserCommand, UserNotFoundException } from "@aws-sdk/client-cognito-identity-provider";

const tableName = process.env[EnvironmentVariableName.DATA_TABLE_NAME]!;
const dao = new DynamoItemDao<PlayerGameItem, PlayerGameDTO>(tableName, playerGameMapper);
const eventsClient = new EventBridgeClient();
const cognitoClient = new CognitoIdentityProviderClient();

const handleGameInviteEvent = async (event: GameInviteEvent) => {
  console.debug({ eventHandled: gameInviteDetailType });

  const detail = event.detail;
  const userCommand = new AdminGetUserCommand({
    UserPoolId: process.env['USER_POOL'],
    Username: event.detail.email
  });
  let userId: string;
  try {
    const response = await cognitoClient.send(userCommand);

    userId = (response.UserAttributes || []).find(attr => attr.Name === 'sub')?.Value!;
    if (!userId) {
      console.warn(`User account exists for ${event.detail.email}, but no user ID (sub) is available.`);
    }
  } catch (e) {
    if ((e as UserNotFoundException).name === 'UserNotFoundException') {
      console.info(`User not found for ${event.detail.email}`)
    } else {
      throw new Error((e as Error).message);
    }
  }
  const playerGame: PlayerGameDTO = {
    playerId: userId! || detail.email,
    email: detail.email,
    gameId: detail.gameId,
    participationState: 'invited',
    timestamp: new Date().getTime()
  }

  return dao.put(playerGame);
}

const handleConfirmSignUpEvent = async (event: PostConfirmationTriggerEvent) => {
  console.debug({ eventHandled: 'PostConfirmation_ConfirmSignUp' });
  const userId = event.userName;
  const email = event.request.userAttributes.email;

  const emailPlayerGames = await dao.getAll(email);
  if (!emailPlayerGames) {
    return event;
  }
  
  const playerGames = emailPlayerGames.map(pg => ({
    ...pg,
    playerId: userId,
    timestamp: new Date().getTime()
  }));

  await dao.put(playerGames);
  await Promise.all(playerGames.map(pg => dao.delete(pg.email, pg.gameId)));

  const command = new PutEventsCommand({
    Entries: playerGames.map(pg => {
      return {
        DetailType: invitationUpdateDetailType,
        Detail: JSON.stringify({
          gameId: 'game',
          playerGame: pg
        }),
        EventBusName: 'arn',
        Source: 'grid-wolf.user'
      }
    })
  });
  await eventsClient.send(command);

  return event;
}

export async function handler(event: UserEvent) {
  console.info(JSON.stringify(event));
  if ((event as GameInviteEvent)["detail-type"] === gameInviteDetailType) {
    return await handleGameInviteEvent(event as GameInviteEvent);
  } else if ((event as PostConfirmationTriggerEvent).triggerSource === 'PostConfirmation_ConfirmSignUp') {
    return await handleConfirmSignUpEvent(event as PostConfirmationTriggerEvent);
  }
  console.warn('Unhandled event: ', JSON.stringify(event));
  return 'event not handled';
}
