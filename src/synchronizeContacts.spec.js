const synchronizeContacts = require('./synchronizeContacts')
const MockDate = require('mockdate')

describe('synchronizing contacts', () => {
  const mockCozyUtils = {
    prepareIndex: jest.fn(),
    save: jest.fn()
  }
  const MOCK_CONTACT_ACCOUNT_ID = '123-456'
  const MOCKED_DATE = '2019-05-15T09:09:00.115Z'

  beforeAll(() => {
    MockDate.set(MOCKED_DATE)
  })

  afterAll(() => {
    MockDate.reset()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create missing contacts', async () => {
    const remoteContacts = [
      {
        uuid: '1458-1523-1236-123',
        firstname: 'Harry',
        lastname: 'Potter',
        title: 'ele',
        cloud_url: 'hpotter3.mytoutatice.cloud',
        groups: [
          {
            _id: 'id-group-gryffindor'
          }
        ]
      }
    ]
    const cozyContacts = []
    const remoteGroups = [{ _id: 'id-group-gryffindor' }]
    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      remoteGroups
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _type: 'io.cozy.contacts',
      name: {
        familyName: 'Potter',
        givenName: 'Harry'
      },
      jobTitle: 'Élève',
      cozy: [
        {
          primary: true,
          label: null,
          url: 'https://hpotter3.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '1458-1523-1236-123',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        }
      },
      relationships: {
        groups: {
          data: [
            { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' }
          ]
        }
      }
    })
    expect(result.contacts).toEqual({
      created: 1,
      updated: 0,
      skipped: 0
    })
  })

  it('should update existing contacts', async () => {
    const cozyContacts = [
      {
        _id: 'da30c4ca96ec5068874ae5fe9a005eb1',
        _rev: '2-c39d514f9b25a694a1331f893ba4bf2f',
        cozy: [
          {
            primary: true,
            url: 'https://rweasley12.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '1452-1598-3578-789',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T15:40:08.126Z',
              slug: 'Contacts',
              version: '0.8.2'
            },
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Weasley Ronald',
        jobTitle: 'Élève',
        name: {
          familyName: 'Weasley',
          givenName: 'Ron'
        },
        phone: [
          {
            number: '001122334455',
            primary: true
          }
        ],
        relationships: {
          groups: {
            data: [
              { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' },
              { _id: 'id-group-removed', _type: 'io.cozy.contacts.groups' },
              { _id: 'id-group-manual', _type: 'io.cozy.contacts.groups' }
            ]
          }
        }
      },
      {
        _id: '307b3cdc9a855c549eb9d50a8bc93e6110594b25',
        _rev: '2-20abd709a4cee2fc7855da2ad26c84ad0b2fac1d',
        cozy: [],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7281-7189-0928-663',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T15:40:08.126Z',
              slug: 'Contacts',
              version: '0.8.2'
            },
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Hermione Granger',
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        },
        relationships: {
          groups: {
            data: [
              { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' }
            ]
          }
        }
      },
      {
        _id: '10e5866050d20afe8ccae04456491db7908a96ec',
        _rev: '2-cb79bd0ce2a8c435a9bbeddc9ef6c8bc7c3c4b43',
        cozy: [
          {
            primary: false,
            url: 'https://harry.theburrow.cloud'
          },
          {
            primary: true,
            url: 'https://potterstinks.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7617-0092-1667-282',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T15:40:08.126Z',
              slug: 'Contacts',
              version: '0.8.2'
            },
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Harry Potter',
        jobTitle: 'Élève',
        name: {
          familyName: 'Potter',
          givenName: 'Harry'
        },
        relationships: {
          groups: {
            data: [
              { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' },
              { _id: 'id-group-magic-chess', _type: 'io.cozy.contacts.groups' }
            ]
          }
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '1452-1598-3578-789',
        firstname: 'Ronald', // changed
        lastname: 'Weasley',
        title: 'ele',
        cloud_url: 'rweasley12.mytoutatice.cloud',
        groups: [
          {
            _id: 'id-group-gryffindor'
          }
        ]
      },
      {
        uuid: '7281-7189-0928-663',
        firstname: 'Hermione',
        lastname: 'Granger',
        title: 'ele',
        cloud_url: 'hgranger14.mytoutatice.cloud', // added
        groups: [
          {
            _id: 'id-group-gryffindor'
          },
          {
            _id: 'id-group-numerology' // added
          }
        ]
      },
      {
        uuid: '7617-0092-1667-282',
        firstname: 'Harry',
        lastname: 'Potter',
        title: 'ele',
        cloud_url: 'hpotter3.mytoutatice.cloud', // changed
        groups: [
          {
            _id: 'id-group-gryffindor'
          },
          {
            _id: 'id-group-quidditch' // changed
          }
        ]
      }
    ]
    const remoteGroups = [
      { _id: 'id-group-gryffindor' },
      { _id: 'id-group-magic-chess' },
      { _id: 'id-group-numerology' },
      { _id: 'id-group-quidditch' },
      { _id: 'id-group-removed' }
    ]

    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      remoteGroups
    )
    expect(mockCozyUtils.save).toHaveBeenCalledTimes(3)
    expect(mockCozyUtils.save).toHaveBeenNthCalledWith(1, {
      _id: 'da30c4ca96ec5068874ae5fe9a005eb1',
      _rev: '2-c39d514f9b25a694a1331f893ba4bf2f',
      _type: 'io.cozy.contacts',
      cozy: [
        {
          primary: true,
          label: null,
          url: 'https://rweasley12.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '1452-1598-3578-789',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedByApps: [
          {
            date: '2019-04-12T15:40:08.126Z',
            slug: 'Contacts',
            version: '0.8.2'
          },
          {
            date: '2019-04-12T14:34:29.088Z',
            slug: 'konnector-toutatice',
            version: '1.0.0'
          }
        ]
      },
      fullname: 'Weasley Ronald',
      jobTitle: 'Élève',
      name: {
        familyName: 'Weasley',
        givenName: 'Ronald'
      },
      phone: [
        {
          number: '001122334455',
          primary: true
        }
      ],
      relationships: {
        groups: {
          data: [
            { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' },
            { _id: 'id-group-manual', _type: 'io.cozy.contacts.groups' }
          ]
        }
      }
    })
    expect(mockCozyUtils.save).toHaveBeenNthCalledWith(2, {
      _id: '307b3cdc9a855c549eb9d50a8bc93e6110594b25',
      _rev: '2-20abd709a4cee2fc7855da2ad26c84ad0b2fac1d',
      _type: 'io.cozy.contacts',
      cozy: [
        {
          primary: true,
          label: null,
          url: 'https://hgranger14.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '7281-7189-0928-663',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedByApps: [
          {
            date: '2019-04-12T15:40:08.126Z',
            slug: 'Contacts',
            version: '0.8.2'
          },
          {
            date: '2019-04-12T14:34:29.088Z',
            slug: 'konnector-toutatice',
            version: '1.0.0'
          }
        ]
      },
      fullname: 'Hermione Granger',
      jobTitle: 'Élève',
      name: {
        familyName: 'Granger',
        givenName: 'Hermione'
      },
      relationships: {
        groups: {
          data: [
            { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' },
            { _id: 'id-group-numerology', _type: 'io.cozy.contacts.groups' }
          ]
        }
      }
    })
    expect(mockCozyUtils.save).toHaveBeenNthCalledWith(3, {
      _id: '10e5866050d20afe8ccae04456491db7908a96ec',
      _rev: '2-cb79bd0ce2a8c435a9bbeddc9ef6c8bc7c3c4b43',
      _type: 'io.cozy.contacts',
      cozy: [
        {
          label: null,
          primary: true,
          url: 'https://hpotter3.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '7617-0092-1667-282',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedByApps: [
          {
            date: '2019-04-12T15:40:08.126Z',
            slug: 'Contacts',
            version: '0.8.2'
          },
          {
            date: '2019-04-12T14:34:29.088Z',
            slug: 'konnector-toutatice',
            version: '1.0.0'
          }
        ]
      },
      fullname: 'Harry Potter',
      jobTitle: 'Élève',
      name: {
        familyName: 'Potter',
        givenName: 'Harry'
      },
      relationships: {
        groups: {
          data: [
            { _id: 'id-group-gryffindor', _type: 'io.cozy.contacts.groups' },
            { _id: 'id-group-quidditch', _type: 'io.cozy.contacts.groups' }
          ]
        }
      }
    })

    expect(result.contacts).toEqual({
      created: 0,
      updated: 3,
      skipped: 0
    })
  })

  it('should update a contact where only the groups have changed', async () => {
    const cozyContacts = [
      {
        _id: 'a145b5551e46fe3870763109c90063f0',
        _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
        cozy: [
          {
            label: null,
            primary: true,
            url: 'https://hgranger14.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Hermione Granger',
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        },
        relationships: {
          groups: {
            data: [
              { _id: 'previous-group-id', _type: 'io.cozy.contacts.groups' }
            ]
          }
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '7162-1889-0916-6273',
        firstname: 'Hermione',
        lastname: 'Granger',
        title: 'ele',
        cloud_url: 'hgranger14.mytoutatice.cloud',
        groups: [
          {
            _type: 'io.cozy.contacts.groups',
            _id: 'new-group-id',
            name: 'New group'
          }
        ]
      }
    ]
    const remoteGroups = [{ _id: 'new-group-id' }, { _id: 'previous-group-id' }]

    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      remoteGroups
    )
    expect(mockCozyUtils.save).toHaveBeenCalledTimes(1)
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'a145b5551e46fe3870763109c90063f0',
      _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
      _type: 'io.cozy.contacts',
      cozy: [
        {
          label: null,
          primary: true,
          url: 'https://hgranger14.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '7162-1889-0916-6273',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedByApps: [
          {
            date: '2019-04-12T14:34:29.088Z',
            slug: 'konnector-toutatice',
            version: '1.0.0'
          }
        ]
      },
      fullname: 'Hermione Granger',
      jobTitle: 'Élève',
      name: {
        familyName: 'Granger',
        givenName: 'Hermione'
      },
      relationships: {
        groups: {
          data: [{ _id: 'new-group-id', _type: 'io.cozy.contacts.groups' }]
        }
      }
    })
    expect(result.contacts).toEqual({
      created: 0,
      updated: 1,
      skipped: 0
    })
  })

  it('should not update unmodified contacts', async () => {
    const cozyContacts = [
      {
        _id: 'a145b5551e46fe3870763109c90063f0',
        _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
        cozy: [
          {
            primary: true,
            url: 'https://hgranger14.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Hermione Granger',
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        },
        relationships: {
          groups: {
            data: [{ _id: 'id-group', _type: 'io.cozy.contacts.groups' }]
          }
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '7162-1889-0916-6273',
        firstname: 'Hermione',
        lastname: 'Granger',
        title: 'ele',
        cloud_url: 'hgranger14.mytoutatice.cloud',
        groups: [
          {
            _id: 'id-group',
            _type: 'io.cozy.contacts.groups',
            name: 'Some unchanged group'
          }
        ]
      }
    ]
    const remoteGroups = [{ _id: 'id-group' }]

    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      remoteGroups
    )
    expect(mockCozyUtils.save).not.toHaveBeenCalled()
    expect(result.contacts).toEqual({
      created: 0,
      updated: 0,
      skipped: 1
    })
  })

  it('should untrash a trashed contact', async () => {
    const cozyContacts = [
      {
        _id: 'a145b5551e46fe3870763109c90063f0',
        _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
        trashed: true,
        cozy: [
          {
            label: null,
            primary: true,
            url: 'https://hgranger14.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T15:40:08.126Z',
              slug: 'Contacts',
              version: '0.8.2'
            },
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Hermione Granger',
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '7162-1889-0916-6273',
        firstname: 'Hermione',
        lastname: 'Granger',
        title: 'ele',
        cloud_url: 'hgranger14.mytoutatice.cloud'
      }
    ]

    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      []
    )
    expect(mockCozyUtils.save).toHaveBeenCalledTimes(1)
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'a145b5551e46fe3870763109c90063f0',
      _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
      _type: 'io.cozy.contacts',
      cozy: [
        {
          label: null,
          primary: true,
          url: 'https://hgranger14.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '7162-1889-0916-6273',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedByApps: [
          {
            date: '2019-04-12T15:40:08.126Z',
            slug: 'Contacts',
            version: '0.8.2'
          },
          {
            date: '2019-04-12T14:34:29.088Z',
            slug: 'konnector-toutatice',
            version: '1.0.0'
          }
        ]
      },
      fullname: 'Hermione Granger',
      jobTitle: 'Élève',
      name: {
        familyName: 'Granger',
        givenName: 'Hermione'
      },
      relationships: {
        groups: {
          data: []
        }
      }
    })
    expect(result.contacts).toEqual({
      created: 0,
      updated: 1,
      skipped: 0
    })
  })

  it('should remove groups from a deleted contact', async () => {
    const cozyContacts = [
      {
        _id: 'a145b5551e46fe3870763109c90063f0',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          }
        },
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        },
        relationships: {
          other: {
            data: [{ _id: 'id-other', _type: 'io.cozy.other' }]
          },
          groups: {
            data: [
              { _id: 'id-group', _type: 'io.cozy.contacts.groups' },
              { _id: 'manual-group', _type: 'io.cozy.contacts.groups' }
            ]
          }
        }
      }
    ]
    const remoteContacts = [
      // contact has been removed on the remote side
    ]
    const remoteGroups = [{ _id: 'id-group' }]

    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      remoteGroups
    )
    expect(mockCozyUtils.save).toHaveBeenCalledTimes(1)
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'a145b5551e46fe3870763109c90063f0',
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '7162-1889-0916-6273',
            konnector: 'konnector-toutatice',
            lastSync: '2019-04-12T14:34:28.737Z',
            remoteRev: null
          }
        }
      },
      jobTitle: 'Élève',
      name: {
        familyName: 'Granger',
        givenName: 'Hermione'
      },
      relationships: {
        other: {
          data: [{ _id: 'id-other', _type: 'io.cozy.other' }]
        },
        groups: {
          data: [{ _id: 'manual-group', _type: 'io.cozy.contacts.groups' }]
        }
      }
    })
    expect(result.contacts).toEqual({
      created: 0,
      updated: 1,
      skipped: 0
    })
  })

  it('should keep cozy fields when remote fields are missing', async () => {
    const cozyContacts = [
      {
        _id: 'a145b5551e46fe3870763109c9008c1c',
        _rev: '2-a7cd90ba870a3505b9676fb6d66f5493',
        cozy: [
          {
            primary: true,
            url: 'https://sblack20.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '2766-0917-1711-5382',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        id: 'a145b5551e46fe3870763109c90063f0',
        jobTitle: 'Élève',
        name: {
          familyName: 'Black',
          givenName: 'Padfoot'
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '2766-0917-1711-5382',
        firstname: 'Sirius'
      }
    ]

    const result = await synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts,
      []
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'a145b5551e46fe3870763109c9008c1c',
      _rev: '2-a7cd90ba870a3505b9676fb6d66f5493',
      _type: 'io.cozy.contacts',
      cozy: [
        {
          primary: true,
          url: 'https://sblack20.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '2766-0917-1711-5382',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedByApps: [
          {
            date: '2019-04-12T14:34:29.088Z',
            slug: 'konnector-toutatice',
            version: '1.0.0'
          }
        ]
      },
      id: 'a145b5551e46fe3870763109c90063f0',
      jobTitle: 'Élève',
      name: {
        familyName: 'Black',
        givenName: 'Sirius'
      },
      relationships: {
        groups: {
          data: []
        }
      }
    })
    expect(result.contacts).toEqual({
      created: 0,
      updated: 1,
      skipped: 0
    })
  })
/* Disabled as travis break the sleep function
  it('should throttle network requests', async () => {
    const sleep = delay => new Promise(resolve => setTimeout(resolve, delay))
    const SLEEP_DELAY = 100

    const afterSaveRequest = jest.fn()
    mockCozyUtils.save.mockImplementation(async () => {
      await sleep(SLEEP_DELAY)
      afterSaveRequest()
    })

    const remoteContacts = []
    for (let i = 0; i < 51; i++)
      remoteContacts.push({
        uuid: '2766-0917-1711-5382',
        firstname: 'Sirius'
      })

    // we don't await synchronizeContacts so we can test the advancement of the callbacks manually
    const promise = synchronizeContacts(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      [],
      []
    )

    // at first, all the save requests should be pending
    expect(afterSaveRequest).toHaveBeenCalledTimes(0)
    // after the faked delay, the first batch of requests should be finished
    await sleep(SLEEP_DELAY)
    expect(afterSaveRequest).toHaveBeenCalledTimes(50)
    // as long as the fakd delay is not over, the next batch should not be finished
    await sleep(SLEEP_DELAY / 2)
    expect(afterSaveRequest).toHaveBeenCalledTimes(50)
    await sleep(SLEEP_DELAY / 2)
    expect(afterSaveRequest).toHaveBeenCalledTimes(51)

    const result = await promise
    expect(result.contacts).toEqual({
      created: 51,
      updated: 0,
      skipped: 0
    })
  })
*/
  it('should update a contact where only the mail have changed', async () => {
      const cozyContacts = [
        {
          _id: 'a145b5551e46fe3870763109c90063f0',
          _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
          cozy: [
            {
              label: null,
              primary: true,
              url: 'https://hgranger14.mytoutatice.cloud'
            }
          ],
          cozyMetadata: {
            sync: {
              [MOCK_CONTACT_ACCOUNT_ID]: {
                contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
                id: '7162-1889-0916-6273',
                konnector: 'konnector-toutatice',
                lastSync: '2019-04-12T14:34:28.737Z',
                remoteRev: null
              }
            },
            updatedByApps: [
              {
                date: '2019-04-12T14:34:29.088Z',
                slug: 'konnector-toutatice',
                version: '1.0.0'
              }
            ]
          },
          fullname: 'Hermione Granger',
          jobTitle: 'Élève',
          name: {
            familyName: 'Granger',
            givenName: 'Hermione'
          },
          email: [
            {
              address: 'hermion@example.com',
              primary: false,
              type: 'Pro'
            }
          ]
        }
      ]
      const remoteContacts = [
        {
          uuid: '7162-1889-0916-6273',
          firstname: 'Hermione',
          lastname: 'Granger',
          title: 'ele',
          cloud_url: 'hgranger14.mytoutatice.cloud',
          mail: 'hermione@example.com' // changed
        }
      ]

      const result = await synchronizeContacts(
        mockCozyUtils,
        MOCK_CONTACT_ACCOUNT_ID,
        remoteContacts,
        cozyContacts,
        []
      )
      expect(mockCozyUtils.save).toHaveBeenCalledTimes(1)
      expect(mockCozyUtils.save).toHaveBeenCalledWith({
        _id: 'a145b5551e46fe3870763109c90063f0',
        _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
        _type: 'io.cozy.contacts',
        cozy: [
          {
            label: null,
            primary: true,
            url: 'https://hgranger14.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: MOCKED_DATE,
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Hermione Granger',
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        },
        email: [
          {
            address: 'hermione@example.com',
            primary: false,
            type: 'Pro'
          }
        ],
        relationships: {
          groups: {
            data: []
          }
        }
      })
      expect(result.contacts).toEqual({
        created: 0,
        updated: 1,
        skipped: 0
      })
  })

  it('should preserve an email with a non Pro type', async () => {
      const cozyContacts = [
        {
          _id: 'a145b5551e46fe3870763109c90063f0',
          _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
          cozy: [
            {
              label: null,
              primary: true,
              url: 'https://hgranger14.mytoutatice.cloud'
            }
          ],
          cozyMetadata: {
            sync: {
              [MOCK_CONTACT_ACCOUNT_ID]: {
                contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
                id: '7162-1889-0916-6273',
                konnector: 'konnector-toutatice',
                lastSync: '2019-04-12T14:34:28.737Z',
                remoteRev: null
              }
            },
            updatedByApps: [
              {
                date: '2019-04-12T14:34:29.088Z',
                slug: 'konnector-toutatice',
                version: '1.0.0'
              }
            ]
          },
          fullname: 'Hermione Granger',
          jobTitle: 'Élève',
          name: {
            familyName: 'Granger',
            givenName: 'Hermione'
          },
          email: [
            {
              address: 'hermioneGG777@example.com',
              primary: false,
              type: 'Fake' // Not Pro, added by user
            }
          ]
        }
      ]
      const remoteContacts = [
        {
          uuid: '7162-1889-0916-6273',
          firstname: 'Hermione',
          lastname: 'Granger',
          title: 'ele',
          cloud_url: 'hgranger14.mytoutatice.cloud',
          mail: 'hermione@example.com' // added
        }
      ]

      const result = await synchronizeContacts(
        mockCozyUtils,
        MOCK_CONTACT_ACCOUNT_ID,
        remoteContacts,
        cozyContacts,
        []
      )
      expect(mockCozyUtils.save).toHaveBeenCalledTimes(1)
      expect(mockCozyUtils.save).toHaveBeenCalledWith({
        _id: 'a145b5551e46fe3870763109c90063f0',
        _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
        _type: 'io.cozy.contacts',
        cozy: [
          {
            label: null,
            primary: true,
            url: 'https://hgranger14.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: MOCKED_DATE,
              remoteRev: null
            }
          },
          updatedByApps: [
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Hermione Granger',
        jobTitle: 'Élève',
        name: {
          familyName: 'Granger',
          givenName: 'Hermione'
        },
        email: [
          {
            address: 'hermioneGG777@example.com',
            primary: false,
            type: 'Fake'
          },
          {
            address: 'hermione@example.com',
            primary: false,
            type: 'Pro'
          }
        ],
        relationships: {
          groups: {
            data: []
          }
        }
      })
      expect(result.contacts).toEqual({
        created: 0,
        updated: 1,
        skipped: 0
      })
    })
})
