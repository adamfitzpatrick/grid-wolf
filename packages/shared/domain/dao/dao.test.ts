import { DTO } from "../dto";
import { DAO, marshallToDTO } from ".";

interface TestDAO extends DAO {
  field: { S: string };
}

interface TestDTO extends DTO {
  field: string;
}

describe('marshallToDTO', () => {
  test('should convert correctly from DAO to DTO', () => {
    const dao: TestDAO = {
      pk: { S: 'user#user' },
      sk: { S: 'field#value' },
      id: { S: 'id' },
      userId: { S: 'user' },
      field: { S: 'value' }
    };
    const dto: TestDTO = {
      id: 'id',
      userId: 'user',
      field: 'value'
    };
    expect(marshallToDTO<TestDAO, TestDTO>(dao)).toEqual(dto);
  });
});
