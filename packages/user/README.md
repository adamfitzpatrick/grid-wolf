# @grid-wolf/user

The **user** micro-application manages infrastructure and code for user management throughout the **grid-wolf** application. The app leverages AWS Cognito for user sign-up and sign-in, and also provides tools for managing game invitations between game leaders and players.

## Infrastructure

- **DynamoDB table**: Managed by the [central-infra package](../central-infra/README.md)
- **EventBridge Event Bus**: Managed by the [central-infra package](../central-infra/README.md)

The following resources are managed within this micro-app, some of which leverage a SingleHandlerApi construct provided by **stepinto-aws-tools**:

- **ApiGateway REST API** and related resources such as usage plans, API keys, stages, deployments and logging (included in the SingleHandlerApi construct)
- **API Lambda function** for handling calls to the API (included in the SingleHandlerApi construct)
- **Events Lambda function** for processing events from the central event bus
- **IAM Roles and Policies** which provide required permissions for the application to function
- **Cognito User Pool and App Client** for user authentication, authorization and management

<center>
    <img alt='user microservice infrastructure'
        src='./docs/user-infra.drawio.svg'
        width='300px'>
</center>

## Data Flow

<center>
    <img alt='user microservice data and event flow'
        src='./docs/user-data-flow.drawio.svg'
        width='400px'>
</center>

### Models

```typescript
interface PlayerGameDTO {
  playerId: string;
  gameId: string;
  email: string;
  participationState: ParticipationState;
  timestamp: number;
}
```

`PlayerGameDTO` is used to track the relationship between users as game participants and individual games.  Creation of these items in DynamoDB is triggered by the creation of a new `game` by a game leader which includes a list of player email addresses.  For players who do not already have an account in the system, `PlayerGameDTO` is initially created using the player's email address in the `playerId` field.

When players sign up and confirm their email address, a user ID is created in Cognito, and an event is dispatched which triggers the replacement of the original `PlayerGameDTO` item with one which uses the new user ID in the `playerId` field.  In the case that a player already had an account, this step is not necessary and the event will be disregarded.

## API Definition

<details >
 <summary>GET <code><b>/player-game/{gameId}</b></code><span>Retrieve a game to which the authorized user has been invited</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the player's game data to be removed |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

```bash
curl -X PUT -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/user/player-game/example-game-id
```

</details>

<details>
<summary><span>PATCH</span> <code><b>/player-game/{gameId}/{participantAction}</b></code><span>Accept or decline an invitation to a specific game</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the game for which the invitation applies |
| `participantAction` | true | string | 'accept' or 'decline' |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |

<h4>Example cURL</h4>

```bash
curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/user/player-game/example-game-id/accept
```

</details>

<details>
<summary><span>GET</span> <code><b>/player-game/list</b></code> <span>Retrieve a list of games to which the authorized user has been invited</span></summary>

<h4>Parameters</h4>

None

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |

<h4>Example cURL</h4>

```bash
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/user/player-game/list
```

</details>

## Integration Testing

- **PUT /game** *authenticated users can add games that create player entries for users without accounts*
- **PUT /game** *authenticated users can add games that create player entries for users with accounts*
- **PUT /user/player-game/{gameId}** *authenticated users can retrieve a game in which they are a player*
- **PUT /user/player-game/{gameId}** *authenticated users receive forbidden when they request a game that does not exist*
- **PUT /user/player-game/list** *authenticated users can retrieve a list of games in which they are a player*
- **PUT /user/player-game/{gameId}/accept** *authenticated users can accept game invitations*
- **PUT /user/player-game/{gameId}/decline** *authenticated users can decline game invitations*
- **PUT /user/player-game/{gameId}/invalid** *users cannot submit improper participant states*
