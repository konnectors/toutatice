const filterValidGroups = require('./filterValidGroups')

describe('filtering remote groups', () => {
  it('should remove groups with no id', () => {
    const groups = [
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
        uuid: '11111111-',
        structure: '11111111',
        structureName: 'HOGWARTS',
        name: '2018-2019 2A',
        group_contacts: []
      },
      {
        uuid: '11111111-',
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: null,
        name: '2018-2019 3A',
        group_contacts: []
      }
    ]

    const result = filterValidGroups(groups)
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
      }
    ])
  })

  it('should remove groups with duplicate uuids', () => {
    const groups = [
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
        uuid: '11111111-2A',
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: []
      },
      {
        uuid: '11111111-2A',
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A DUPLICATE',
        group_contacts: []
      },
      {
        uuid: '22222222-1A',
        structure: '22222222',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: [
          { uuid: '1458-1523-1236-123' },
          { uuid: '1452-1789-1236-456' },
          { uuid: '1452-1598-3578-789' }
        ]
      }
    ]

    const result = filterValidGroups(groups)
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
        uuid: '11111111-2A',
        structure: '11111111',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: []
      },
      {
        uuid: '22222222-1A',
        structure: '22222222',
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: [
          { uuid: '1458-1523-1236-123' },
          { uuid: '1452-1789-1236-456' },
          { uuid: '1452-1598-3578-789' }
        ]
      }
    ])
  })

  it('should remove groups without structure id', () => {
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
        structureName: 'HOGWARTS',
        gid: '2A',
        name: '2018-2019 2A',
        group_contacts: []
      },
      {
        structure: null,
        structureName: 'HOGWARTS',
        gid: '2B',
        name: '2018-2019 2A',
        group_contacts: []
      }
    ]

    const result = filterValidGroups(groups)
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
})
