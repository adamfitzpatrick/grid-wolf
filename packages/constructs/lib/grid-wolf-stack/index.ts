import { Environment, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';

const baseTags: { [key: string]: string } = {
  application: 'grid-wolf',
  owner: 'adam@stepinto.io',
  purpose: 'business'
}

type GridWolfEnv = Required<Environment> & {
  prefix: string;
}

export interface GridWolfStackProps extends StackProps {
  env: GridWolfEnv;
}

export class GridWolfStack extends Stack {
  env: GridWolfEnv;
  readonly appName = 'grid-wolf';

  constructor(scope: Construct, id: string, props: GridWolfStackProps) {
    super(scope, id, props);
    this.env = props.env;

    this.setTags();
  }

  public generateName(unique: string) {
    return `${this.env.prefix}-${unique}`;
  }

  public generateId(unique: string) {
    const formattedUnique = unique.split('-')
      .map(part => part[0].toUpperCase() + part.slice(1))
      .join('');
    return `${this.env.prefix}${formattedUnique}`
  }

  private setTags() {
    const stackTags = Tags.of(this);
    Object.keys(baseTags).forEach((key: string) => {
      stackTags.add(key, baseTags[key]);
    });
  }
}
