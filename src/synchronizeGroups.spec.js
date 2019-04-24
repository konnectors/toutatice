const synchronizeGroups = require('./synchronizeGroups')
const MockDate = require('mockdate')

describe('synchronizing groups', () => {
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

  it('should create missing groups', async () => {
    const remoteGroups = [
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
    ]
    const cozyGroups = []
    const result = await synchronizeGroups(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteGroups,
      cozyGroups
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _type: 'io.cozy.contacts.groups',
      name: '2018-2019 1A',
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '11111111-1A',
            konnector: 'konnector-toutatice',
            lastSync: MOCKED_DATE,
            remoteRev: null
          }
        }
      }
    })
    expect(result).toEqual({
      created: 1,
      updated: 0,
      skipped: 0
    })
  })

  it('should update existing groups', async () => {
    const cozyGroups = [
      {
        _id: 'da30c4ca96ec5068874ae5fe9a005eb1',
        _rev: '2-c39d514f9b25a694a1331f893ba4bf2f',
        name: 'My Mates', // changed
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '11111111-1A',
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
        }
      }
    ]
    const remoteGroups = [
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
    ]

    const result = await synchronizeGroups(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteGroups,
      cozyGroups
    )
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _id: 'da30c4ca96ec5068874ae5fe9a005eb1',
      _rev: '2-c39d514f9b25a694a1331f893ba4bf2f',
      _type: 'io.cozy.contacts.groups',
      name: '2018-2019 1A',
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '11111111-1A',
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
      }
    })
    expect(result).toEqual({
      created: 0,
      updated: 1,
      skipped: 0
    })
  })

  it('should not update unmodified groups', async () => {
    const cozyGroups = [
      {
        _id: 'a145b5551e46fe3870763109c90063f0',
        _rev: '2-4b0ab8ed71794e03adfd632aecf44c24',
        name: '2018-2019 1A',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '11111111-1A',
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
        }
      }
    ]
    const remoteGroups = [
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
    ]

    const result = await synchronizeGroups(
      mockCozyUtils,
      MOCK_CONTACT_ACCOUNT_ID,
      remoteGroups,
      cozyGroups
    )
    expect(mockCozyUtils.save).not.toHaveBeenCalled()
    expect(result).toEqual({
      created: 0,
      updated: 0,
      skipped: 1
    })
  })
})
