const synchronize = require('./synchronize')
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
        firstname: 'Nicolas',
        lastname: 'Blin',
        title: 'ele',
        cloud_url: 'nblin3.mytoutatice.cloud'
      }
    ]
    const cozyContacts = []
    const result = await synchronize(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _type: 'io.cozy.contacts',
      name: {
        familyName: 'Blin',
        givenName: 'Nicolas'
      },
      jobTitle: 'Élève',
      cozy: [
        {
          primary: true,
          label: null,
          url: 'https://nblin3.mytoutatice.cloud'
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
      }
    })
    expect(result.contacts).toEqual({
      created: 1,
      updated: 0
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
            url: 'https://prodrigue12.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          createdAt: '2019-04-12T14:34:29.088Z',
          createdByApp: 'konnector-toutatice',
          createdByAppVersion: '1.0.0',
          doctypeVersion: 2,
          metadataVersion: 1,
          sourceAccount: 'fakeAccountId',
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '1452-1598-3578-789',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedAt: '2019-04-12T15:40:08.126Z',
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
        fullname: 'Rodriguez Pablo',
        id: 'da30c4ca96ec5068874ae5fe9a005eb1',
        jobTitle: 'Élève',
        metadata: {
          cozy: true,
          version: 1
        },
        name: {
          familyName: 'Pablito', // Changed
          givenName: 'Rodriguez'
        },
        phone: [
          {
            number: '001122334455',
            primary: true
          }
        ],
        relationships: {
          accounts: {
            data: []
          },
          groups: {
            data: []
          }
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '1452-1598-3578-789',
        firstname: 'Pablo',
        lastname: 'Rodriguez',
        title: 'ele',
        cloud_url: 'prodrigue12.mytoutatice.cloud'
      }
    ]

    const result = await synchronize(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'da30c4ca96ec5068874ae5fe9a005eb1',
      _type: 'io.cozy.contacts',
      _rev: '2-c39d514f9b25a694a1331f893ba4bf2f',
      cozy: [
        {
          primary: true,
          label: null,
          url: 'https://prodrigue12.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        createdAt: '2019-04-12T14:34:29.088Z',
        createdByApp: 'konnector-toutatice',
        createdByAppVersion: '1.0.0',
        doctypeVersion: 2,
        metadataVersion: 1,
        sourceAccount: 'fakeAccountId',
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '1452-1598-3578-789',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedAt: '2019-04-12T15:40:08.126Z',
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
      fullname: 'Rodriguez Pablo',
      id: 'da30c4ca96ec5068874ae5fe9a005eb1',
      jobTitle: 'Élève',
      metadata: {
        cozy: true,
        version: 1
      },
      name: {
        familyName: 'Rodriguez',
        givenName: 'Pablo'
      },
      phone: [
        {
          number: '001122334455',
          primary: true
        }
      ],
      relationships: {
        accounts: {
          data: []
        },
        groups: {
          data: []
        }
      }
    })
    expect(result.contacts).toEqual({
      created: 0,
      updated: 1
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
            url: 'https://vhugo14.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          createdAt: '2019-04-12T14:34:29.088Z',
          createdByApp: 'konnector-toutatice',
          createdByAppVersion: '1.0.0',
          doctypeVersion: 2,
          metadataVersion: 1,
          sourceAccount: 'fakeAccountId',
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '7162-1889-0916-6273',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedAt: '2019-04-12T15:40:08.126Z',
          updatedByApps: [
            {
              date: '2019-04-12T14:34:29.088Z',
              slug: 'konnector-toutatice',
              version: '1.0.0'
            }
          ]
        },
        fullname: 'Victor Hugo',
        id: 'a145b5551e46fe3870763109c90063f0',
        jobTitle: 'Élève',
        name: {
          familyName: 'Hugo',
          givenName: 'Victor'
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '7162-1889-0916-6273',
        firstname: 'Victor',
        lastname: 'Hugo',
        title: 'ele',
        cloud_url: 'vhugo14.mytoutatice.cloud'
      }
    ]

    const result = await synchronize(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts
    )
    expect(mockCozyUtils.save).not.toHaveBeenCalled()
    expect(result.contacts).toEqual({
      created: 0,
      updated: 0
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
            url: 'https://jausten20.mytoutatice.cloud'
          }
        ],
        cozyMetadata: {
          createdAt: '2019-04-12T14:34:29.088Z',
          createdByApp: 'konnector-toutatice',
          createdByAppVersion: '1.0.0',
          doctypeVersion: 2,
          metadataVersion: 1,
          sourceAccount: 'fakeAccountId',
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '2766-0917-1711-5382',
              konnector: 'konnector-toutatice',
              lastSync: '2019-04-12T14:34:28.737Z',
              remoteRev: null
            }
          },
          updatedAt: '2019-04-12T15:40:08.126Z',
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
          familyName: 'Austen',
          givenName: 'Jane'
        }
      }
    ]
    const remoteContacts = [
      {
        uuid: '2766-0917-1711-5382',
        firstname: 'Elisabeth'
      }
    ]

    const result = await synchronize(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteContacts,
      cozyContacts
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'a145b5551e46fe3870763109c9008c1c',
      _type: 'io.cozy.contacts',
      _rev: '2-a7cd90ba870a3505b9676fb6d66f5493',
      cozy: [
        {
          primary: true,
          url: 'https://jausten20.mytoutatice.cloud'
        }
      ],
      cozyMetadata: {
        createdAt: '2019-04-12T14:34:29.088Z',
        createdByApp: 'konnector-toutatice',
        createdByAppVersion: '1.0.0',
        doctypeVersion: 2,
        metadataVersion: 1,
        sourceAccount: 'fakeAccountId',
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '2766-0917-1711-5382',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        },
        updatedAt: '2019-04-12T15:40:08.126Z',
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
        familyName: 'Austen',
        givenName: 'Elisabeth'
      }
    })
    expect(result.contacts).toEqual({
      created: 0,
      updated: 1
    })
  })
})
