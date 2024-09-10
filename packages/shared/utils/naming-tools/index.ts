import { Environment } from "aws-cdk-lib";

export type NameGenerator = (unique: string) => string;

export interface AccountEnvironment extends Required<Environment> {
  prefix: string;
}

export function generateNameGenerator(env: AccountEnvironment) {
  return function generateNameGenerator(unique: string) {
    return `${env.prefix}-${unique}`;
  }
}

export function generateIdGenerator(env: AccountEnvironment) {
  return (unique: string) => {
    const formattedUnique = unique.split('-')
      .map(part => part[0].toUpperCase() + part.slice(1))
      .join('');
    return `${env.prefix}${formattedUnique}`
  }
}
