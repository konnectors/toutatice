const convertStructuresToGroups = require('./convertStructuresToGroups')

describe('Converting structures array to groups', () => {
  it('should create groups', () => {
    const structures = [
      {
        structure: '11111111',
        name: 'HOGWARTS',
        groups: [
          {
            gid: '1A',
            name: '2018-2019 1A',
            group_contacts: [
              { uuid: '1458-1523-1236-123' },
              { uuid: '1452-1789-1236-456' },
              { uuid: '1452-1598-3578-789' }
            ]
          },
          {
            gid: '1B',
            name: '2018-2019 1B',
            group_contacts: [
              { uuid: '2178-9766-0185-617' },
              { uuid: '7726-9982-5539-166' },
              { uuid: '1736-6167-1988-199' }
            ]
          }
        ]
      },
      {
        structure: '22222222',
        name: 'BEAUXBATONS',
        groups: [
          {
            gid: '2A',
            name: '2018-2019 2A',
            group_contacts: [
              { uuid: '1665-2278-0938-772' },
              { uuid: '9873-1789-2773-726' },
              { uuid: '5527-7638-7738-920' }
            ]
          },
          {
            gid: '2B',
            name: '2018-2019 2B',
            group_contacts: [
              { uuid: '7272-1993-1771-992' },
              { uuid: '9982-2273-8368-727' },
              { uuid: '1189-7363-7617-837' }
            ]
          }
        ]
      }
    ]
    const result = convertStructuresToGroups(structures)
    expect(result).toEqual([
      {
        uuid: '11111111-1A',
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '1A',
        name: '2018-2019 1A',
        group_contacts: [
          { uuid: '1458-1523-1236-123' },
          { uuid: '1452-1789-1236-456' },
          { uuid: '1452-1598-3578-789' }
        ]
      },
      {
        uuid: '11111111-1B',
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '1B',
        name: '2018-2019 1B',
        group_contacts: [
          { uuid: '2178-9766-0185-617' },
          { uuid: '7726-9982-5539-166' },
          { uuid: '1736-6167-1988-199' }
        ]
      },
      {
        uuid: '22222222-2A',
        structure: '22222222',
        structureName: 'BEAUXBATONS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: [
          { uuid: '1665-2278-0938-772' },
          { uuid: '9873-1789-2773-726' },
          { uuid: '5527-7638-7738-920' }
        ]
      },
      {
        uuid: '22222222-2B',
        structure: '22222222',
        structureName: 'BEAUXBATONS',
        gid: '2B',
        name: '2018-2019 2B',
        group_contacts: [
          { uuid: '7272-1993-1771-992' },
          { uuid: '9982-2273-8368-727' },
          { uuid: '1189-7363-7617-837' }
        ]
      }
    ])
  })
})
