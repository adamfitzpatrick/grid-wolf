import { Template } from 'aws-cdk-lib/assertions';
import { GridWolfConstruct } from '.';
import { GridWolfProps } from '../../domain';
import { App, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';


describe('GridWolfConstuct construct', () => {
  let sut: GridWolfConstruct;

  beforeEach(() => {
    const props = {
      env: {
        account: 'account',
        region: 'region',
        prefix: 'tst'
      },
      constructName:'construct'
    };
    const app = new App();
    sut = new GridWolfConstruct(app, 'TestConstruct', props);
  });

  test('generateId should include the app, construct and resource type name', () => {
    expect(sut.generateId('resource')).toBe('tstGridWolfConstructResource');
  });

  test('generateName should include app, construct and resource type names', () => {
    expect(sut.generateName('resource')).toBe('tst-grid-wolf-construct-resource');
  });

  test('generateEnvGeneralName should include only the environment and reource name', () => {
    expect(sut.generateEnvGeneralName('resource')).toBe('tst-resource');
  })
});
