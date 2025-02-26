# @grid-wolf/encounter

The **encounter** microservice provides an API and related resources to manage, modify and store information about *Encounters* created by game leaders.  In the context of **grid-wolf**, an *encounter* represents a conflict scenario between the players and one or more opposing entities. An encounter exists only within the framework of the *game* with which it is associated, and uses a *map* upon which the action plays out.  An *encounter* is owned by the game leader who created the *game* to which it is attached.

Each *encounter* is assumed to involve all players included with the *game*, and non-player entities (whether opposition or bystanders) are included with the encounter data as a list of *entity* IDs.

## Infrastructure

The following resources are leveraged by this micro-app:

- **DynamoDB table**: Managed by the [central-infra package](../central-infra/README.md)
- **Cognito User Pool**: Managed by the [user package](../user/README.md) and used to authorize access to the *game* API

The following resources are managed within this micro-app, and leverage a SingleHandlerApi construct provided by **stepinto-aws-tools**:

- **ApiGateway REST API** and related resources such as usage plans, API keys, stages, deployments and logging (included in the SingleHandlerApi construct)
- **API Lambda function** for handling calls to the API (included in the SingleHandlerApi construct)
- **IAM Roles and Policies** which provide required permissions for the application to function 

## Data Models

```typescript
interface EncounterDTO {
  encounterId: string;
  gameId: string;
  name: string;
  nonPlayerCharacter: string[];
  timestamp: number;
  active: boolean;
}
```

## API Definition

<details >
 <summary>PUT <code><b>/encounter</b></code><span>Upload a new or replacement encounter entry</span></summary>

<h4>Parameters</h4>

<span>No parameters</span>

<h4>Request Body</h4>

<span>Content-Type `application/json`</span>:

```typescript
{
  encounterId: string;
  gameId: string;
  name: string;
  nonPlayerCharacter: string[];
  timestamp: number;
  active: boolean;
}
```

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |
| `400` | `application/json`| `bad request` |

<h4>Example cURL</h4>

```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" --data '{"encounterId":"example","ownerId":"owner","name":"Example Encounter","nonPlayerCharacter": ["entity-1-id", "entity-2-id"],"timestamp":12345,"active":true}' http://server-host/encounter/
```

</details>

<details>
 <summary><span>DELETE</span> <code><b>/encounter/{gameId}/{encounterId}</b></code><span>Remove an existing encounter entry</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the game to which the encounter is attached |
| `encounterId` | true | string | Unique ID specifying the encounter data to be removed |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |

<h4>Example cURL</h4>

```bash
curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/encounter/example-game-id/example-encounter-id
```

</details>

<details>
 <summary><span>GET</span> <code><b>/encounter/{gameId}/{encounterId}</b></code> <span>Retrieve a single encounter by game and encounter ID</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the game to which the encounter is attached |
| `encounterId` | true | string | Unique ID specifying the encounter to be retrieved |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

```bash
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/encounter/example-game-id/example-encounter-id
```

</details>

<details>
 <summary><span>GET</span> <code><b>/encounter/list/{gameId}</b></code> <span>Retrieve a list of encounters attached to a specific game</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `gameId` | true | string | Unique ID specifying the game for which to list encounters |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

> ```bash
>  curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/encounter/list/example-game-id
> ```

</details>

## Integration Testing

- **PUT /encounter happy path** *authenticated users can save encounter data*
- **PUT /encounter incorrect payload** *users cannot save improperly formatted data*
- **PUT /encounter non-owned game** *users cannot save data for a game they do not own*
- **GET /encounter/{gameId}/{encounterId} happy path** *authorized users can retrieve encounter data*
- **GET /encounter/{gameId}/{encounterId} non-owned game** *users cannot retrieve encounters attached to games they do not own*
- **GET /encounter/{gameId}/{encounterId} missing encounter** *attempts to get non-existent games return a 403 response*
- **GET /encounter/list/{gameId} happy path** *authorized users can retrieve a list of encounters for a game they own*
- **GET /encounter/list/{gameId} happy path** *users cannot retrieve encounters for games they do not own*
- **DELETE /encounter/{gameId}/{entityId} non-owned game** *users can attempt to delete encounters attached to games they do not own without any effect*
- **DELETE /encounter/{gameId}/{entityId} happy path** *authorized users can delete encounters they have created*
- **DELETE /encounter/{gameId}/{entityId} missing encounter** *authorized users can delete non-existent encounters without error*
