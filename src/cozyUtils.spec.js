const CozyClient = require('cozy-client').default
const CozyUtils = require('./CozyUtils')

const {
  APP_NAME,
  APP_VERSION,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS
} = require('./constants')

jest.mock('cozy-client')
jest.mock('cozy-konnector-libs')

describe('CozyUtils', () => {
  const cozyUtils = new CozyUtils('fakeAccountId')

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize a cozy client', () => {
    expect(CozyClient).toHaveBeenCalledWith({
      appMetadata: {
        slug: APP_NAME,
        sourceAccount: 'fakeAccountId',
        version: APP_VERSION
      },
      schema: {
        contacts: {
          doctype: 'io.cozy.contacts',
          doctypeVersion: 2
        },
        contactsAccounts: {
          doctype: 'io.cozy.contacts.accounts',
          doctypeVersion: 1
        },
        contactsGroups: {
          doctype: 'io.cozy.contacts.groups',
          doctypeVersion: 2
        }
      },
      token: '{"token":{"accessToken":"0230b4b0-f833-4e4a-b70a-ffb1e48e2c01"}}',
      uri: 'https://rosellalabadie.mycozy.cloud'
    })

    expect(cozyUtils.client).toBeDefined()
  })

  describe('refreshing a token', () => {
    it('should returned a refreshed token', async () => {
      const MOCK_ACCOUNT_ID = '123'
      const MOCK_REFRESHED_TOKEN = 'abc123'
      const mockResponse = {
        json: () => ({
          data: {
            attributes: {
              oauth: {
                access_token: MOCK_REFRESHED_TOKEN
              }
            }
          }
        })
      }
      cozyUtils.client.fetch = jest.fn(() => mockResponse)

      const result = await cozyUtils.refreshToken(MOCK_ACCOUNT_ID)
      expect(cozyUtils.client.fetch).toHaveBeenCalledWith(
        'POST',
        '/accounts/toutatice/123/refresh'
      )
      expect(result).toEqual(MOCK_REFRESHED_TOKEN)
    })

    it('should return null in case of a problem', async () => {
      cozyUtils.client.fetch = jest.fn(() => ({ json: () => null }))
      const result = await cozyUtils.refreshToken('123')
      expect(result).toEqual(null)
    })
  })

  describe('prepareIndexes method', () => {
    it('should prepare an index on remote id for contacts', async () => {
      const createIndexSpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        createIndex: createIndexSpy
      }))
      await cozyUtils.prepareIndexes('fakeAccountId')
      expect(cozyUtils.client.collection).toHaveBeenCalledTimes(2)
      expect(cozyUtils.client.collection).toHaveBeenCalledWith(DOCTYPE_CONTACTS)
      expect(cozyUtils.client.collection).toHaveBeenCalledWith(
        DOCTYPE_CONTACTS_GROUPS
      )
      expect(createIndexSpy).toHaveBeenCalledWith([
        'cozyMetadata.sync.fakeAccountId.contactsAccountsId'
      ])
      expect(createIndexSpy).toHaveBeenCalledWith([
        'cozyMetadata.sync.fakeAccountId.id'
      ])
    })
  })

  describe('findContacts', () => {
    it('should find the contacts that have the given remote ids', async () => {
      const findSpy = jest.fn().mockResolvedValue({
        data: []
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))
      await cozyUtils.findContacts('fakeAccountId')
      expect(cozyUtils.client.collection).toHaveBeenCalledWith(DOCTYPE_CONTACTS)
      expect(findSpy).toHaveBeenCalledWith(
        {
          cozyMetadata: {
            sync: {
              fakeAccountId: {
                contactsAccountsId: 'fakeAccountId'
              }
            }
          }
        },
        {
          indexedFields: ['cozyMetadata.sync.fakeAccountId.contactsAccountsId'],
          limit: 100,
          skip: 0
        }
      )
    })

    it('should load all pages', async () => {
      let pagesLoaded = 0
      const findSpy = jest.fn(() => {
        const responses = [
          { data: [1, 2, 3], next: true },
          { data: [4, 5, 6], next: true },
          { data: [7], next: false }
        ]
        const result = responses[pagesLoaded++]
        return result
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))

      const result = await cozyUtils.findContacts('fakeAccountId')
      expect(findSpy).toHaveBeenCalledTimes(3)
      expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
    })
  })

  describe('findGroups', () => {
    it('should find the groups that have the given remote ids', async () => {
      const findSpy = jest.fn().mockResolvedValue({
        data: [
          {
            id: 'hufflepuff'
          },
          {
            id: 'gryffindor'
          }
        ]
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))
      const result = await cozyUtils.findGroups('fakeAccountId', [
        '6167-7728-0938-1661',
        '7273-7639-1773-8379'
      ])
      expect(cozyUtils.client.collection).toHaveBeenCalledWith(
        DOCTYPE_CONTACTS_GROUPS
      )
      expect(findSpy).toHaveBeenCalledWith(
        {
          cozyMetadata: {
            sync: {
              fakeAccountId: {
                contactsAccountsId: {
                  $in: ['fakeAccountId']
                }
              }
            }
          }
        },
        {
          indexedFields: ['cozyMetadata.sync.fakeAccountId.contactsAccountsId']
        }
      )
      expect(result).toEqual([{ id: 'hufflepuff' }, { id: 'gryffindor' }])
    })
  })

  describe('findOrCreateContactAccount', () => {
    it('should return the contact account if it exists', async () => {
      const fakeAccount = {
        canLinkContacts: false,
        shouldSyncOrphan: false,
        lastSync: null,
        lastLocalSync: null,
        name: 'toutatice',
        _type: DOCTYPE_CONTACTS_ACCOUNT,
        type: APP_NAME,
        sourceAccount: 'fakeAccountId',
        version: 1
      }
      const findSpy = jest.fn().mockResolvedValue({
        data: [fakeAccount]
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))

      const result = await cozyUtils.findOrCreateContactAccount(
        'fakeAccountId',
        'toutatice'
      )
      expect(result).toEqual(fakeAccount)
    })

    it('should update an existing account with the same name', async () => {
      const previousAccount = {
        _id: '123',
        _rev: 'abc',
        canLinkContacts: false,
        shouldSyncOrphan: false,
        lastSync: null,
        lastLocalSync: null,
        name: 'toutatice',
        _type: DOCTYPE_CONTACTS_ACCOUNT,
        type: APP_NAME,
        sourceAccount: 'previousAccountId',
        version: 1
      }
      // the first call looks for accounts with the same sourceAccount, but there are none
      const findSpy = jest.fn().mockResolvedValueOnce({
        data: []
      })
      // the second call looks for sources with the same email, regardless of the sourceAccount
      findSpy.mockResolvedValueOnce({
        data: [previousAccount]
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))
      cozyUtils.client.save = jest.fn().mockResolvedValue({
        data: {
          id: '123'
        }
      })

      const result = await cozyUtils.findOrCreateContactAccount(
        'fakeAccountId',
        'toutatice'
      )
      expect(cozyUtils.client.save).toHaveBeenCalledWith({
        _id: '123',
        _rev: 'abc',
        canLinkContacts: false,
        shouldSyncOrphan: false,
        lastSync: null,
        lastLocalSync: null,
        name: 'toutatice',
        _type: DOCTYPE_CONTACTS_ACCOUNT,
        type: APP_NAME,
        sourceAccount: 'fakeAccountId',
        version: 1
      })
      expect(result).toEqual({
        id: '123'
      })
    })

    it('should create a contact account if none is found', async () => {
      const findSpy = jest.fn().mockResolvedValue({
        data: []
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))
      cozyUtils.client.save = jest.fn().mockResolvedValue({
        data: {
          id: 'saved-contact-account'
        }
      })

      const result = await cozyUtils.findOrCreateContactAccount(
        'fakeAccountId',
        'toutatice'
      )
      expect(cozyUtils.client.save).toHaveBeenCalledWith({
        canLinkContacts: false,
        shouldSyncOrphan: false,
        lastSync: null,
        lastLocalSync: null,
        name: 'toutatice',
        _type: DOCTYPE_CONTACTS_ACCOUNT,
        type: APP_NAME,
        sourceAccount: 'fakeAccountId',
        version: 1
      })
      expect(result).toEqual({
        id: 'saved-contact-account'
      })
    })
  })
})
