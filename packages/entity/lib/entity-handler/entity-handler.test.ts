import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from ".";
import { DynamoItemDao } from "stepinto-aws-tools/clients";
import { EntityItem, EntityDTO } from "../entity-dto";
import { EntityEnvironmentVariable } from "../../infra/lib/entity-stack";

process.env[EntityEnvironmentVariable.DATA_TABLE_NAME] = "table";

jest.mock("stepinto-aws-tools/clients");
jest.mock("jsonwebtoken", () => {
  return {
    decode: () => ({ username: "user" }),
  };
});

describe("entity handler", () => {
  let oldConsole: Console;
  let Authorization: string;
  let entityDTO: EntityDTO;
  let event: APIGatewayProxyEvent;
  let daoPut: jest.Mock;
  let daoGet: jest.Mock;
  let daoGetAll: jest.Mock;
  let daoDelete: jest.Mock;

  beforeAll(() => {
    oldConsole = { ...console };
    console.warn = (message: string) => {};
    console.debug = (message: string) => {};
    console.info = (message: string) => {};
  });

  afterAll(() => {
    console.warn = oldConsole.warn;
    console.debug = oldConsole.debug;
    console.info = oldConsole.info;
  });

  beforeEach(() => {
    Authorization = `Bearer TOKEN`;
    entityDTO = {
      entityId: "id",
      ownerId: "user",
      name: "name",
      maxHealth: 10,
      movementSpeed: 30,
      attributes: [],
      timestamp: 1234,
      active: true,
    };
    event = {
      body: JSON.stringify(entityDTO),
      requestContext: {
        httpMethod: "PUT",
        resourcePath: "/",
      },
      headers: {
        Authorization,
      },
    } as any as APIGatewayProxyEvent;

    const daoMock = (DynamoItemDao as unknown as jest.Mock<DynamoItemDao<EntityItem, EntityDTO>>)
      .mock.instances[0];
    daoPut = daoMock.put as jest.Mock;
    daoPut.mockResolvedValue(undefined);
    daoGet = daoMock.get as jest.Mock;
    daoGetAll = daoMock.getAll as jest.Mock;
    daoDelete = daoMock.delete as jest.Mock;
  });

  afterEach(() => {
    daoPut.mockClear();
    daoGet.mockClear();
    daoGetAll.mockClear();
    daoDelete.mockClear();
  });

  test("/ PUT should save entity data to dynamodb", async () => {
    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: "accepted",
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
    });
    expect(daoPut).toHaveBeenCalledWith(entityDTO);
  });

  test("/ PUT should return 400 if Authorized user does not match request body user", async () => {
    entityDTO.ownerId = "otherperson";
    event.body = JSON.stringify(entityDTO);

    expect(await handler(event)).toEqual({
      statusCode: 400,
      body: "bad request",
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
    });

    expect(daoPut).not.toHaveBeenCalled();
  });

  test("/{entityId} GET should return data obtained from dynamodb", async () => {
    event.requestContext.httpMethod = "GET";
    event.requestContext.resourcePath = "/{entityId}";
    event.pathParameters = {
      entityId: "id",
    };
    daoGet.mockResolvedValue(entityDTO);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify(entityDTO),
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
    });
    expect(daoGet).toHaveBeenCalledWith("user", "id");
  });

  test("/{entityId} GET should return 403 error when entity not found", async () => {
    event.requestContext.httpMethod = "GET";
    event.requestContext.resourcePath = "/{entityId}";
    event.pathParameters = {
      entityId: "id",
    };
    daoGet.mockResolvedValue(null);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 403,
      body: "forbidden",
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
    });
    expect(daoGet).toHaveBeenCalledWith("user", "id");
  });

  test("/list GET should return a list of entity data for the user", async () => {
    event.requestContext.resourcePath = "/list";
    event.requestContext.httpMethod = "GET";
    daoGetAll.mockResolvedValue([entityDTO]);

    await expect(handler(event)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify([entityDTO]),
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
    });

    expect(daoGetAll).toHaveBeenCalledWith("user");
  });

  test("/{entityId} DELETE should remove an item from DynamoDB", async () => {
    event.body = "";
    event.requestContext.resourcePath = "/{entityId}";
    event.requestContext.httpMethod = "DELETE";
    event.pathParameters = {
      entityId: "id",
    };
    daoDelete.mockResolvedValue({});

    await expect(handler(event)).resolves.toEqual({
      statusCode: 202,
      body: "accepted",
      headers: {
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
    });

    expect(daoDelete).toHaveBeenCalledWith("user", "id");
  });
});
