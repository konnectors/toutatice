const filterRemoteContacts = require('./filterRemoteContacts')

describe('filtering remote contacts', () => {
  it('should discard contacts without uuid', () => {
    const source = [
      {
        uuid: '1458-1523-1236-123',
        firstname: 'Harry',
        lastname: 'Ok'
      },
      {
        firstname: 'Hermione',
        lastname: 'NoUUID'
      },
      {
        uuid: null,
        firstname: 'Ron',
        lastname: 'NullUUID'
      }
    ]
    const result = filterRemoteContacts(source)
    expect(result.length).toEqual(1)
    expect(result[0]).toEqual({
      uuid: '1458-1523-1236-123',
      firstname: 'Harry',
      lastname: 'Ok'
    })
  })

  it('should discard conatcts with the same UUID', () => {
    const source = [
      {
        uuid: '1458-1523-1236-123',
        firstname: 'Harry',
        lastname: 'Potter'
      },
      {
        uuid: '1',
        firstname: 'Parvati',
        lastname: 'Patil'
      },
      {
        uuid: '1',
        firstname: 'Padma',
        lastname: 'Patil'
      },
      {
        uuid: '2',
        firstname: 'Ron',
        lastname: 'Weasley'
      },
      {
        uuid: '2',
        firstname: 'Fred',
        lastname: 'Weasley'
      },
      {
        uuid: '2',
        firstname: 'George',
        lastname: 'Weasley'
      }
    ]
    const result = filterRemoteContacts(source)
    expect(result.length).toEqual(3)
    expect(result[0]).toEqual({
      uuid: '1458-1523-1236-123',
      firstname: 'Harry',
      lastname: 'Potter'
    })
    expect(result[1]).toEqual({
      uuid: '1',
      firstname: 'Parvati',
      lastname: 'Patil'
    })
    expect(result[2]).toEqual({
      uuid: '2',
      firstname: 'Ron',
      lastname: 'Weasley'
    })
  })
})
