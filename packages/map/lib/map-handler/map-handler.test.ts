import { handler } from '.';
import { DynamodbSpies, EnvironmentVariableName } from '@grid-wolf/shared/utils';

const dynamoSpies = new DynamodbSpies();

describe('map handler', () => {
  let oldConsole: Console;
  let Authorization: string;

  beforeAll(() => {
    oldConsole = { ...console };
    console.warn = (message: string) => {};
  });

  afterAll(() => {
    console.warn = oldConsole.warn;
  });

  beforeEach(() => {
    process.env[EnvironmentVariableName.DATA_TABLE_NAME] = 'table';
  });

  test('PUT /map should save map data to DynamoDB', () => {});

  test('PUT /map/image/{filename} should save an image to S3', () => {});

  test('GET /map/{mapId} should get specific map data', () => {});

  test('GET /maps should return all map data for the user', () => {})
})
