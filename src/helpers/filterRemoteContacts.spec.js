const filterRemoteContacts = require('./filterRemoteContacts')

describe('filtering remote contacts', () => {
  it('should discard contacts without uuid', () => {
    const source = [
      {
        uuid: '1458-1523-1236-123',
        firstname: 'Nicolas',
        lastname: 'Ok'
      },
      {
        firstname: 'Jean',
        lastname: 'NoUUID'
      },
      {
        uuid: null,
        firstname: 'Paul',
        lastname: 'NullUUID'
      }
    ]
    const result = filterRemoteContacts(source)
    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({
      uuid: '1458-1523-1236-123',
      firstname: 'Nicolas',
      lastname: 'Ok'
    })
  })

  it('should discard conatcts with the same UUID', () => {
    const source = [
      {
        uuid: '1458-1523-1236-123',
        firstname: 'Nicolas',
        lastname: 'Unique'
      },
      {
        uuid: '1',
        firstname: 'Remus',
        lastname: '🐕'
      },
      {
        uuid: '1',
        firstname: 'Remus',
        lastname: '🐕'
      },
      {
        uuid: '2',
        firstname: 'Riri',
        lastname: '🦆'
      },
      {
        uuid: '2',
        firstname: 'Fifi',
        lastname: '🦆'
      },
      {
        uuid: '2',
        firstname: 'Loulou',
        lastname: '🦆'
      }
    ]
    const result = filterRemoteContacts(source)
    expect(result.length).toEqual(3)
    expect(result[0]).toEqual({
      uuid: '1458-1523-1236-123',
      firstname: 'Nicolas',
      lastname: 'Unique'
    })
    expect(result[1]).toEqual({
      uuid: '1',
      firstname: 'Remus',
      lastname: '🐕'
    })
    expect(result[2]).toEqual({
      uuid: '2',
      firstname: 'Riri',
      lastname: '🦆'
    })
  })
})
