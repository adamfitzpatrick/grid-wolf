import { Construct } from "constructs";
import { GridWolfProps, GridWolfEnv } from "../../domain";
import { generateIdGenerator, generateNameGenerator, NameGenerator } from "../../utils/naming-tools";

export interface GridWolfConstructProps extends GridWolfProps {
  constructName: string;
}

export class GridWolfConstruct extends Construct {
  appName = 'grid-wolf';
  env: GridWolfEnv
  generateId: NameGenerator;
  generateName: NameGenerator;
  generateEnvGeneralName: NameGenerator;

  constructor(scope: Construct, id: string, props: GridWolfConstructProps) {
    super(scope, id);
    this.env = props.env;
    const uniqueName = `${this.appName}-${props.constructName}`;
    this.generateId = (resourceType: string) => {
      return generateIdGenerator(props.env)(`${uniqueName}-${resourceType}`)
    };
    this.generateName = (resourceType: string) => {
      return generateNameGenerator(props.env)(`${uniqueName}-${resourceType}`);
    };
    this.generateEnvGeneralName = (unique: string) => {
      return generateNameGenerator(props.env)(unique);
    };
  }
}
