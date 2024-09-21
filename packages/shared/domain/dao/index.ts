import { unmarshall } from "@aws-sdk/util-dynamodb";
import { DTO } from "../dto";

export interface DAO {
  pk: { S: string };
  sk: { S: string };
  id: { S: string };
  userId: { S: string };
}

export function marshallToDTO<T extends DAO, U extends DTO>(
  dao: T
): U {
  const dto = unmarshall({ ...dao } as any);
  delete dto.pk;
  delete dto.sk;
  return dto as U;
}
