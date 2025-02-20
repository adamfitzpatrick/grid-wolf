import { test as tearDown } from './authenticated-test';
import { DynamoHelper } from '../lib/dynamo-helper';
import { EnvironmentVariableName } from '@grid-wolf/shared/utils';

tearDown('clean dynamo', async ({ getAuthData }) => {
  const dynamoHelper = new DynamoHelper(`dev-${process.env[EnvironmentVariableName.DATA_TABLE_NAME]}`);

  await Promise.all(getAuthData().users.map(user => dynamoHelper.cleanUp(user.userId)));
  await dynamoHelper.cleanUp('email@email.email');
});
