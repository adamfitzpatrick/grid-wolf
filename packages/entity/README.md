# @grid-wolf/entity

The **entity** micro-application provides an API and related resources to manage, modify and store information about *Entities* created by users.  In the context of **grid-wolf**, an *entity* represents an class for a player character, non-player character, or enemy within the game world through which the entity's health points and movement speed can be defined. *Entities* are instantiated in the context of a game session, where effects like damage are tracked.  A *entity* is owned by the user who created it.

*Entities* can stand alone within the application, meaning any user can create them without necessarily tying them into a game.  However, they can be tied into *games* in the following manner:

- Each player in the game has one or more character *entities*
- Game leaders can attach *entities* to games as friends or enemies for the players to encounter

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
interface Attribute {
    name: string;
    value: string;
}

interface EntityDTO {
    entityId: string;
    ownerId: string;
    name: string;
    maxHealth: number;
    movementSpeed: number;
    attributes: Attribute[];
    timestamp: number;
    active: boolean;
}
```

## API Definition

<details >
 <summary>PUT <code><b>/entity</b></code><span>Upload a new or replacement entity entry</span></summary>

<h4>Parameters</h4>

<span>No parameters</span>

<h4>Request Body</h4>

<span>Content-Type `application/json`</span>:

```typescript
{
    entityId: string;
    ownerId: string;
    name: string;
    maxHealth: number;
    movementSpeed: number;
    attributes: {
        name: string;
        value: string | number;
    }[]
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
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" --data '{"entityId":"example","ownerId":"owner","name":"Example Entity","maxHealth":10,"movementSpeed":30,"attributes": [{"name":"attack","value":100}],"timestamp":12345,"active":true}' http://server-host/entity/
```

</details>

<details>
 <summary><span>DELETE</span> <code><b>/entity/{entityId}</b></code><span>Remove an existing entity entry</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `entityId` | true | string | Unique ID specifying the entity data to be removed |

*Note: `entityId` is combined with a user ID parsed from the provided authentication token to determine the specific item to be deleted.*

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |

<h4>Example cURL</h4>

```bash
curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/entity/example-entity-id
```

</details>

<details>
 <summary><span>GET</span> <code><b>/entity/{entityId}</b></code> <span>Retrieve a single entity by entityId</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `entityId` | true | string | Unique ID specifying the entity7 data to be retrieved |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

```bash
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/entity/example-entity-id
```

</details>

<details>
 <summary><span>GET</span> <code><b>/entity/list</b></code> <span>Retrieve a list of all entities owned by user</span></summary>

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
>  curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/entity/list/
> ```

</details>

## Integration Testing

- **PUT /entity happy path** *authenticated users can save entity data*
- **PUT /entity incorrect payload** *users cannot save invalid entity data*
- **PUT /entity username/authorization mismatch** *users cannot save entity data owned by other user*
- **GET /entity/{entityId} happy path** *authenticated users can retrieve saved entity data*
- **GET /entity/{entityId} non-existent entityId** *authenticated users receive "access denied" when requesting non-existent entity data*
- **GET /entity/list happy path** *authenticated users can retrieve a list of entities*
- **DELETE /entity/{entityId} happy path** *authenticated users can delete entities they have created*
- **DELETE /entity/{entityId} non-existent entityId** *authenticated users can attempt to delete non-existent entities without error*
