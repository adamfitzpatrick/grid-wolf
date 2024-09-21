import { DTO, marshallToDAO } from ".";
import { DAO } from "../dao";

interface TestDTO extends DTO {
  field: string;
}

interface TestDAO extends DAO {
  field: { S: string };
}

describe('marshallToDAO', () => {
  test('should convert correctly from DTO to DAO', () => {
    const dto: TestDTO = {
      id: 'id',
      userId: 'user',
      field: 'value'
    };
    const dao: TestDAO = {
      pk: { S: 'user#user' },
      sk: { S: 'field#value' },
      id: { S: 'id' },
      userId: { S: 'user' },
      field: { S: 'value' }
    };
    expect(marshallToDAO<TestDTO, TestDAO>(dto, 'user', 'userId', 'field', 'field')).toEqual(dao);
  });
});
