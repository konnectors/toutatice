const filterRemoteGroups = require('./filterRemoteGroups')

describe('filtering remote groups', () => {
  it('should remove groups with no id', () => {
    const groups = [
      {
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
        structure: '11111111',
        structureName: 'HOGWARTS',
        name: '2018-2019 2A',
        group_contacts: []
      },
      {
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: null,
        name: '2018-2019 3A',
        group_contacts: []
      }
    ]

    const result = filterRemoteGroups(groups)
    expect(result).toEqual([
      {
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '1A',
        name: '2018-2019 1A',
        group_contacts: [
          { uuid: '1458-1523-1236-123' },
          { uuid: '1452-1789-1236-456' },
          { uuid: '1452-1598-3578-789' }
        ]
      }
    ])
  })

  it('should remove groups with duplicate ids', () => {
    const groups = [
      {
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
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: []
      },
      {
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A DUPLICATE',
        group_contacts: []
      }
    ]

    const result = filterRemoteGroups(groups)
    expect(result).toEqual([
      {
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
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: []
      }
    ])
  })
})
