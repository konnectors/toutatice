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
        }
      },
      token: '{"token":{"accessToken":"0230b4b0-f833-4e4a-b70a-ffb1e48e2c01"}}',
      uri: 'https://rosellalabadie.mycozy.cloud'
    })

    expect(cozyUtils.client).toBeDefined()
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
        'cozyMetadata.sync.fakeAccountId.id'
      ])
    })
  })

  describe('findContacts', () => {
    it('should find the contacts that have the given remote ids', async () => {
      const findSpy = jest.fn().mockResolvedValue({
        data: [
          {
            id: 'my-awesome-contact'
          },
          {
            id: 'my-less-awesome-contact'
          }
        ]
      })
      cozyUtils.client.collection = jest.fn(() => ({
        find: findSpy
      }))
      const result = await cozyUtils.findContacts('fakeAccountId', [
        '1234-5678-7269-0018',
        '2716-9818-1176-2836'
      ])
      expect(findSpy).toHaveBeenCalledWith(
        {
          cozyMetadata: {
            sync: {
              fakeAccountId: {
                id: {
                  $in: ['1234-5678-7269-0018', '2716-9818-1176-2836']
                }
              }
            }
          }
        },
        { indexedFields: ['cozyMetadata.sync.fakeAccountId.id'] }
      )
      expect(result).toEqual([
        { id: 'my-awesome-contact' },
        { id: 'my-less-awesome-contact' }
      ])
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
