# @grid-wolf/map

The **map** micro-application provides an API and related resources to manage, modify and store information about *maps* created by users.  In the context of **grid-wolf**, a *map* is a data set paired with an image which allows the game leader and players to visualize an encounter and apply game mechanics to the space depicted in the image.  The relationship between image space and map data is primarily defined in terms of *GridData*:

```typescript
interface Vector {
    x: number;
    y: number;
}

interface GridData {
    origin: Vector;
    cellWidth: number;
    difficult: Vector[];
    impassable: Vector[];
}
```

This data allows an orthogonal or hexagonal grid to be superimposed over the image, with position and sizing specified in pixels.  The presence of a grid overlay allows players and the game leader to determine movement as part of a turn-based action economy as well as how to apply ranged effects.

> **Example**
>
> In Dungeons & Dragons 5th Edition, a creature's speed is defined as feet moved per turn. Frequently, encounter maps use grid overlays in which each grid square is 5 feet.  Thus a creature with a speed of 30 would be able to move over normal terrain for 30ft, or six squares, on their turn.  On the other hand, "difficult" terrain halves the movement speed, resulting in 15ft, or 3 squares of movement through difficult terrain.
>
> Bruto the Barbarian has a speed of 30 and is in pursuit of goblins through the woods. 10ft of his path to the goblins runs along a dirt road, but then turns left around a boulder and enters a patch of forest choked by thick brush.
>
> The map for this example might have a `cellWidth` value equal to the number of image pixels that encompasses 5 feet, and an `origin` value of *x* and *y* image pixels which positions the grid sensibly relative to the road. The `difficult` array contains an entry for each grid square *in grid coordinates* that contains thick underbrush.  The `impassable` array contains an entry for each grid square that contains the boulder.
>
> Thus, Bruto can move 10 ft (2 squares) along the road, and then 10 ft (2 squares) further into the underbrush which is difficult terrain.  He cannot move through the grid squares containing the boulder.
>
> All of this information is visible to game leader and players.

*TODO More documentation on this is needed.*

A *map* is owned by the game leader who created it, and will be pulled into a game session to associated the *map* with:

- Players (users who the game leader invites to participate)
- Entities (created by the game leader and others)

## Infrastructure

The following resources are leveraged by this micro-app:

- **SSL Certificate**: Provisioned and managed manually within the AWS console
- **DynamoDB table**: Managed by the [central-infra package](../central-infra/README.md)
- **Cognito User Pool**: Managed by the [user package](../user/README.md) and used to authorize access to the *map* API

The following resources are managed within this micro-app, and leverage a SingleHandlerApi construct provided by **stepinto-aws-tools**:

- **ApiGateway REST API** and related resources such as usage plans, API keys, stages, deployments and logging (included in the SingleHandlerApi construct)
- **Lambda function** for handling calls to the API (included in the SingleHandlerApi construct)
- **IAM Roles and Policies** which provide required permissions for the application to function
- **S3 Bucket and policies** for storing images uploaded by users
- **CloudFront Distribution, public key, and key groups** for accessing images uploaded by users
- **Route53 records** for providing customized domain name CDN access

*TODO Discuss infrastructure requirements for obtaining signed URLs both for saving and retrieving images*

## API Definition

<details >
 <summary>PUT <code><b>/map</b></code><span>Upload a new or replacement map data entry</span></summary>

<h4>Parameters</h4>

<span>No parameters</span>

<h4>Request Body</h4>

<span>Content-Type `application/json`</span>:

```typescript
{
    mapId: string;
    ownerId: string;
    name: string;
    imageUrl: string;
    gridData: {
        origin: {
            x: number;
            y: number;
        },
        cellWidth: number;
        difficult: {
            x: number;
            y: number;
        }[],
        impassable: {
            x: number;
            y: number;
        }[]
    }
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
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" --data '{"mapId":"example","ownerId":"owner","name":"Example Map","imageUrl":"https://blahblahblah","gridData":{"origin":{"x":75,"y":45},"cellWidth":110,"difficult":[{"x":3,"y":2}],"impassable":[{"x":3,"y":3}]},"timestamp":12345,"active":true}' http://server-host/map/
```

</details>

<details>
<summary><span>DELETE</span> <code><b>/map/{mapId}</b></code><span>Remove an existing map entry</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `mapId` | true | string | Unique ID specifying the map data to be removed |

*Note: `mapId` is combined with a user ID parsed from the provided authentication token to determine the specific item to be deleted.*

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `202` | `application/json`| `accepted` |

<h4>Example cURL</h4>

```bash
curl -X DELETE -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/map/example-map-id
```

</details>

<details>
<summary><span>GET</span> <code><b>/map/{mapId}</b></code> <span>Retrieve a single map by mapId</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `mapId` | true | string | Unique ID specifying the map data to be retrieved |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `403` | `application/json`| `forbidden` |

<h4>Example cURL</h4>

```bash
curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/map/example-map-id
```

</details>

<details>
<summary><span>GET</span> <code><b>/map/list</b></code> <span>Retrieve a list of all maps owned by user</span></summary>

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
>  curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/map/list/
> ```

</details>

<details>
<summary><span>GET</span> <code><b>/map/save-image-url/{userId}/{filename}</b></code> <span>Retrieve a signed URL to for saving an image</span></summary>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `userId` | true | string | User ID under which the image data will be saved |
| `filename` | true | string | Name of the image file to save |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `400` | `application/json`| `bad request` |

<h4>Example cURL</h4>

> ```bash
>  curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/map/save-image-url/user-id/image-file.png/
> ```

</details>

<details>
<summary><span>GET</span> <code><b>/map/image-url/{userId}</b></code> <span>Retrieve signed URL components for requesting images from the CDN</span></summary>

<p>Note that this can be used to retrieve any file saved under the user's ID.</p>

<h4>Parameters</h4>

| name | required? | data type | description |
|---|---|---|---|
| `userId` | true | string | User ID under which the image data is stored |

<h4>Request Body</h4>

None

<h4>Responses</h4>

| http code | content-type | response |
|---|---|---|
| `200` | `application/json`| JSON string representation of data |
| `400` | `application/json`| `bad request` |

<h4>Example cURL</h4>

> ```bash
>  curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -H "x-api-key: API_KEY" http://server-host/map/image-url/user-id/
> ```

</details>

## Integration Testing

- **PUT /map** *authenticated users can save map data*
- **PUT /map incorrect payload** *users cannot save invalid map data*
- **PUT /map username/authorization mismatch** *users cannot save map data owned by another user*
- **GET /map/{mapId}** *authenticated users can retrieve saved map data*
- **GET /map/{mapId} non-existent mapId** *authenticated users receive "access denied" when requesting non-existent map data*
- **GET /map/list** *authenticated users can retrieve a list of maps*
- **GET /map/save-image-url** *authenticated users can obtain a URI for saving a map image*
- **GET /map/image-url/** *authenticated users can obtain a URI which works for map image retrieval*
- **DELETE /map/{mapId}** *authenticated users can delete maps they have created*
- **DELETE /map/{mapId} non-existent gameId** *authenticated users can attempt to delete non-existent maps without error*
