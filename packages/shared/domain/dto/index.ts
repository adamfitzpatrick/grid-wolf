import { marshall } from "@aws-sdk/util-dynamodb";
import { DAO } from "../dao";

export interface DTO {
  id: string;
  userId: string;
}

export function marshallToDAO<T extends DTO, U extends DAO>(
  dto: T,
  pkPrefix: string,
  pkField: keyof T,
  skPrefix: string,
  skField: keyof T
): U {
  return marshall({
    pk: `${pkPrefix}#${dto[pkField]}`,
    sk: `${skPrefix}#${dto[skField]}`,
    ...dto
  } as any) as U;
}
