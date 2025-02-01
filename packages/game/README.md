# game

The **game** micro-application provides an API and related resources to manage, modify and store information about *Games* created by users.  In the context of **grid-wolf**, a *game* is the overarching data structure that unites the game master with the players. A *game* is owned by the game master who created it, and is associated with the following:

- Players (users who the game master invites to participate)
- Maps (created by the game master and others)
- Entities (created by the game master and others)

Additionally, each game encloses one or more encounters, which represent the actual game play that **grid-wolf** is designed to track. The distinction between "associated" and "enclosed" data elements lies in the fact that, while *players*, *maps*, and *entities* all exist (and can be created) outside of the context of a *game*, *encounters* cannot, even though they are managed by **grid-wolf** as a separate micro-app.

## Infrastructure

The following resources are leveraged by this micro-app:

- **DynamoDB table**: Managed by the [central-infra package](../central-infra/README.md)
- **Cognito User Pool**: Managed by the [user package](../user/README.md) and used to authorize access to the *game* API

The following resources are managed within this micro-app, and leverage a SingleHandlerApi construct provided by **stepinto-aws-tools**:

- **ApiGateway REST API** and related resources such as usage plans, API keys, stages, deployments and logging (included in the SingleHandlerApi construct)
- **Lambda function** for handling calls to the API (included in the SingleHandlerApi construct)
- **IAM Roles and Policies** which provide required permissions for the application to function 

## API Definition

<style>
    .api-operation {
        padding: 5px 5px;
        border-radius: 5px;
    }
    .api-operation.put {
        border: 1px solid rgb(255, 147, 16);
        background: rgba(255, 147, 16, 0.1)
    }
    .api-operation.get {
        border: 1px solid rgb(122, 163, 251);
        background: rgba(122, 163, 251, 0.1);
    }
    .api-summary {
        list-style: none;
        position: relative;
    }
    .api-summary > span {
        font-size: 90%;
    }

    .api-summary::after {
        content: '\2335';
        font-size: 30px;
        line-height: 0.5;
        display: inline-block;
        position: absolute;
        right: 5px;
    }
    .api-verb {
        display: inline-block;
        border-radius: 3px;
        padding: 3px 8px;
        color: rgb(255, 255, 255);
        font-size: 13px;
        font-weight: 700;
        width: 60px;
        text-align: center;
    }
    .api-verb.put {
        background: rgb(255, 147, 16);
    }
    .api-verb.get {
        background: rgb(122, 163, 251);
    }
    .api-operation-content {
        font-size: 90%;
    }
</style>
<details class='api-operation put'>
 <summary class='api-summary'><span class='api-verb put'>PUT</span> <code><b>/game</b></code><span>Upload a new or replacement game entry</span></summary>

<h4>Parameters</h4>

<span class='api-operation-content'>No parameters</span>

<h4>Request Body</h4>

<span class='api-operation-content'>Content-Type `application/json`</span>:

```typescript
{
    gameId: string,
    ownerId: string,
    name: string,
    players: string,
    created: string
}
```

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |
| `400` | `application/json`| `bad request` |

<h4>Example cURL</h4>

```bash
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" --data '{"gameId":"example","ownerId":"owner","name":"Example Game","players":["player1","player2"],"created":"2025-01-07T00:39:11.099Z"}' http://server-host/game/
```

</details>

<details class='api-operation get'>
 <summary class='api-summary'><span class='api-verb get'>GET</span> <code><b>/game/{gameId}</b></code> <span>Retrieve a single game by gameId</span></summary>

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

<details class='api-operation get'>
 <summary class='api-summary'><span class='api-verb get'>GET</span> <code><b>/games</b></code> <span>Retrieve a list of all games owned by user</span></summary>

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

- **PUT /game happy path**
- **PUT /game incorrect payload**
- **PUT /game username/authorization mismatch**
