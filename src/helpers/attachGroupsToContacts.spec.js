const attachGroupsToContacts = require('./attachGroupsToContacts')
const MOCK_CONTACT_ACCOUNT_ID = '123-abc'

describe('attaching groups to contacts', () => {
  it('should work', () => {
    const contacts = [
      {
        uuid: '1',
        firstname: 'Harry',
        lastname: 'Potter'
      },
      {
        uuid: '2',
        firstname: 'Hermione',
        lastname: 'Granger'
      },
      {
        uuid: '3',
        firstname: 'Draco',
        lastname: 'Malfoy'
      }
    ]

    const remoteGroups = [
      {
        uuid: 'HOGWARTS-GRF',
        structure: 'HOGWARTS',
        structureName: 'Hogwarts',
        gid: 'GRF',
        name: 'Gryffindor',
        group_contacts: [{ uuid: '1' }, { uuid: '2' }]
      },
      {
        uuid: 'HOGWARTS-SLT',
        structure: 'HOGWARTS',
        structureName: 'Hogwarts',
        gid: 'SLT',
        name: 'Slytherin',
        group_contacts: [{ uuid: '3' }]
      },
      {
        uuid: 'HOGWARTS-PTN',
        structure: 'HOGWARTS',
        structureName: 'Hogwarts',
        gid: 'PTN',
        name: 'Potion class',
        group_contacts: [{ uuid: '1' }, { uuid: '2' }, { uuid: '3' }]
      }
    ]

    const cozyGroups = [
      {
        _id: 'cozy-id-gryffindor',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              id: 'HOGWARTS-GRF',
              konnector: 'konnector-toutatice'
            }
          }
        }
      },
      {
        _id: 'cozy-id-slytherin',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              id: 'HOGWARTS-SLT',
              konnector: 'konnector-toutatice'
            }
          }
        }
      },
      {
        _id: 'cozy-id-potion',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              id: 'HOGWARTS-PTN',
              konnector: 'konnector-toutatice'
            }
          }
        }
      }
    ]

    const result = attachGroupsToContacts(
      contacts,
      remoteGroups,
      cozyGroups,
      MOCK_CONTACT_ACCOUNT_ID
    )
    expect(result).toEqual([
      {
        uuid: '1',
        firstname: 'Harry',
        lastname: 'Potter',
        groups: [
          {
            _id: 'cozy-id-gryffindor'
          },
          {
            _id: 'cozy-id-potion'
          }
        ]
      },
      {
        uuid: '2',
        firstname: 'Hermione',
        lastname: 'Granger',
        groups: [
          {
            _id: 'cozy-id-gryffindor'
          },
          {
            _id: 'cozy-id-potion'
          }
        ]
      },
      {
        uuid: '3',
        firstname: 'Draco',
        lastname: 'Malfoy',
        groups: [
          {
            _id: 'cozy-id-slytherin'
          },
          {
            _id: 'cozy-id-potion'
          }
        ]
      }
    ])
  })

  it('should not include a remote group with no matching cozy group', () => {
    const contacts = [
      {
        uuid: '1',
        firstname: 'Harry',
        lastname: 'Potter'
      }
    ]

    const remoteGroups = [
      {
        uuid: 'HOGWARTS-GRF',
        structure: 'HOGWARTS',
        structureName: 'Hogwarts',
        gid: 'GRF',
        name: 'Gryffindor',
        group_contacts: [{ uuid: '1' }]
      },
      {
        uuid: 'HOGWARTS-PTN',
        structure: 'HOGWARTS',
        structureName: 'Hogwarts',
        gid: 'PTN',
        name: 'Potion class',
        group_contacts: [{ uuid: '1' }]
      }
    ]

    const cozyGroups = [
      {
        _id: 'cozy-id-gryffindor',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              id: 'HOGWARTS-GRF',
              konnector: 'konnector-toutatice'
            }
          }
        }
      }
    ]

    const result = attachGroupsToContacts(
      contacts,
      remoteGroups,
      cozyGroups,
      MOCK_CONTACT_ACCOUNT_ID
    )
    //expect a log
    expect(result).toEqual([
      {
        uuid: '1',
        firstname: 'Harry',
        lastname: 'Potter',
        groups: [
          {
            _id: 'cozy-id-gryffindor'
          }
        ]
      }
    ])
  })
})
