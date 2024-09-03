import { marshallToDAO, marshallToDTO, GameDAO, GameDTO } from ".";

describe('Game utils', () => {
  let dao: GameDAO;
  let dto: GameDTO;

  beforeEach(() => {
    dao = {
      pk: { S: 'game#aaaa' },
      sk: { S: 'time#1234' },
      id: { S: 'aaaa'},
      name: { S: 'game' },
      timestamp: { N: '1234' }
    };
    dto = {
      id: 'aaaa',
      name: 'game',
      timestamp: 1234
    };
  });

  test('should convert correctly from DTO to DAO', () => {
    expect(marshallToDAO(dto)).toEqual(dao);
  });

  test('should convert correctly from DAO to DTO', () => {
    expect(marshallToDTO(dao)).toEqual(dto);
  });
})
