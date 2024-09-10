import { Stack, Tags } from 'aws-cdk-lib';
import { GridWolfEnv } from '../../domain';
import { Construct } from 'constructs';
import { GridWolfProps } from '../../domain';
import { generateIdGenerator, generateNameGenerator } from '../../utils/naming-tools';

const baseTags: { [key: string]: string } = {
  application: 'grid-wolf',
  owner: 'adam@stepinto.io',
  purpose: 'business'
}

export class GridWolfStack extends Stack {
  env: GridWolfEnv;
  readonly appName = 'grid-wolf';
  generateId: (unique: string) => string;
  generateName: (unique: string) => string;

  constructor(scope: Construct, id: string, props: GridWolfProps) {
    super(scope, id, props);
    this.env = props.env;

    this.generateId = generateIdGenerator(this.env);
    this.generateName = generateNameGenerator(this.env);
    this.setTags();
  }

  private setTags() {
    const stackTags = Tags.of(this);
    Object.keys(baseTags).forEach((key: string) => {
      stackTags.add(key, baseTags[key]);
    });
  }
}
