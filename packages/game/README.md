# game

The **game** micro-application provides an API and related resources to manage, modify and store information about *Games* created by users.  In the context of **grid-wolf**, a *game* is the overarching data structure that unites the game leader with the players. A *game* is owned by the game leader who created it, and is associated with the following:

- Players (users who the game leader invites to participate)
- Maps (created by the game leader and others)
- Entities (created by the game leader and others)

Additionally, each game encloses one or more encounters, which represent the actual game play that **grid-wolf** is designed to track. In this context, the distinction between "associated" and "enclosed" data elements lies in the fact that, while *players*, *maps*, and *entities* all exist (and can be created) outside of the context of a *game*, *encounters* cannot, even though they are managed by **grid-wolf** as a separate micro-app.

## Infrastructure

The following resources are leveraged by this micro-app:

- **DynamoDB table**: Managed by the [central-infra package](../central-infra/README.md)
- **Cognito User Pool**: Managed by the [user package](../user/README.md) and used to authorize access to the *game* API

The following resources are managed within this micro-app, and leverage a SingleHandlerApi construct provided by **stepinto-aws-tools**:

- **ApiGateway REST API** and related resources such as usage plans, API keys, stages, deployments and logging (included in the SingleHandlerApi construct)
- **Lambda function** for handling calls to the API (included in the SingleHandlerApi construct)
- **IAM Roles and Policies** which provide required permissions for the application to function 

## API Definition

<details >
 <summary>PUT <code><b>/game</b></code><span>Upload a new or replacement game entry</span></summary>

<h4>Parameters</h4>

<span>No parameters</span>

<h4>Request Body</h4>

<span>Content-Type `application/json`</span>:

```typescript
{
    gameId: string;
    ownerId: string;
    name: string;
    players: string[];
    timestamp: number;
    active: boolean
}
```

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |
| `400` | `application/json`| `bad request` |

<h4>Example cURL</h4>

```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" --data '{"gameId":"example","ownerId":"owner","name":"Example Game","players":["player1","player2"],"timestamp":12345,"active":true}' http://server-host/game/
```

</details>

<details>
 <summary><span>DELETE</span> <code><b>/game</b></code><span>Remove an existing game entry</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the game data to be removed |

*Note: `gameId` is combined with a user ID parsed from the provided authentication token to determine the specific item to be deleted.*

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |
| `400` | `application/json`| `bad request` |

<h4>Example cURL</h4>

```bash
curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/game/gameId
```

</details>

<details>
 <summary><span>GET</span> <code><b>/game/{gameId}</b></code> <span>Retrieve a single game by gameId</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the game data to be retrieved |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

```bash
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/game/example-game-id
```

</details>

<details>
 <summary><span>GET</span> <code><b>/games</b></code> <span>Retrieve a list of all games owned by user</span></summary>

<h4>Parameters</h4>

No parameters

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

> ```bash
>  curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/games/
> ```

</details>

## Integration Testing

- **PUT /game happy path** *authenticated users can save game data*
- **PUT /game incorrect payload** *users cannot save invalid game data*
- **PUT /game username/authorization mismatch** *users cannot save data owned by another user*
- **GET /game/{gameId} happy path** *authenticated users can retrieve saved game data*
- **GET /game/{gameId} non-existent gameId** *authenticated users receive "access denied" when requesting non-existent data*
- **GET /game/list happy path** *authenticated users can retrieve a list of games*
- **DELETE /game/{gameId} happy path** *authenticated users can delete games they have create*
- **DELETE /game/{gameId} non-existent gameId** *authenticated users can attempt to delete non-existent games without error*
