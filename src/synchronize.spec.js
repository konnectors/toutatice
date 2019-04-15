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
        address: [],
        company: '',
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
        email: [],
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
        note: '',
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
      address: [],
      company: '',
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
      email: [],
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
      note: '',
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
})
