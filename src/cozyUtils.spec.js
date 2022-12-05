jest.mock('cozy-client')
jest.mock('cozy-konnector-libs')

const CozyUtils = require('./CozyUtils')

const {
  APP_NAME,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS,
  DOCTYPE_FILES
} = require('./constants')

describe('CozyUtils', () => {
  const cozyUtils = new CozyUtils('fakeAccountId')

  afterEach(() => {
    jest.clearAllMocks()
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

  describe('synchronizeShortcuts', () => {
    it('should not call deleteFilePermanently if no app to delete', async () => {
      const foundShortcuts = []
      const computedShortcuts = {
        schoolShortcuts: [],
        favShortcuts: []
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }
      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(deleteFilePermanentlySpy).not.toHaveBeenCalled()
    })
    it('should delete one app with deleteFilePermanently', async () => {
      const foundShortcuts = [
        {
          _id: 'SOME_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE'
          }
        }
      ]
      const computedShortcuts = {
        schoolShortcuts: [
          {
            vendorRef: 'SOME_OTHER_VALUE'
          }
        ],
        favShortcuts: []
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }

      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(cozyUtils.client.collection).toHaveBeenCalledWith(DOCTYPE_FILES)
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID')
    })
    it('should delete multiple apps with deleteFilePermanently', async () => {
      const foundShortcuts = [
        {
          _id: 'SOME_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE'
          }
        },
        {
          _id: 'SOME_ID_2',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_2'
          }
        },
        {
          _id: 'SOME_ID_3',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_3'
          }
        }
      ]
      const computedShortcuts = {
        schoolShortcuts: [
          {
            vendorRef: 'SOME_OTHER_VALUE'
          }
        ],
        favShortcuts: []
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }

      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(deleteFilePermanentlySpy).toHaveBeenCalledTimes(3)
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID')
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID_2')
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID_3')
    })
    it('should not delete app present in computedShortcuts.schoolShortcuts', async () => {
      const foundShortcuts = [
        {
          _id: 'SOME_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE'
          }
        },
        {
          _id: 'SOME_ID_2',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_2'
          }
        },
        {
          _id: 'SOME_ID_3',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_3'
          }
        }
      ]
      const computedShortcuts = {
        schoolShortcuts: [
          {
            vendorRef: 'SOME_OTHER_VALUE',
            hubMetadata: {
              favori: false
            }
          },
          {
            vendorRef: 'SOME_VALUE_2',
            hubMetadata: {
              favori: false
            }
          }
        ],
        favShortcuts: []
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }

      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(deleteFilePermanentlySpy).toHaveBeenCalledTimes(2)
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID')
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID_3')
    })
    it('should not delete app present in computedShortcuts.favShortcuts', async () => {
      const foundShortcuts = [
        {
          _id: 'SOME_ID',
          dir_id: 'SOME_DIR_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE'
          }
        },
        {
          _id: 'SOME_ID_2',
          dir_id: 'SOME_FAV_DIR_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_2'
          }
        },
        {
          _id: 'SOME_ID_3',
          dir_id: 'SOME_DIR_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_3'
          }
        }
      ]
      const computedShortcuts = {
        schoolShortcuts: [
          {
            vendorRef: 'SOME_OTHER_VALUE',
            hubMetadata: {
              favori: false
            }
          }
        ],
        favShortcuts: [
          {
            vendorRef: 'SOME_VALUE_2',
            hubMetadata: {
              favori: true
            }
          }
        ]
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }

      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(deleteFilePermanentlySpy).toHaveBeenCalledTimes(2)
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID')
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID_3')
    })
    it('should delete app if favourite status has changed', async () => {
      const foundShortcuts = [
        {
          _id: 'SOME_ID',
          dir_id: 'SOME_DIR_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE'
          }
        },
        {
          _id: 'SOME_ID_2',
          dir_id: 'SOME_DIR_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_2'
          }
        },
        {
          _id: 'SOME_ID_3',
          dir_id: 'SOME_DIR_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_3'
          }
        }
      ]
      const computedShortcuts = {
        schoolShortcuts: [
          {
            vendorRef: 'SOME_VALUE_2',
            hubMetadata: {
              favori: false
            }
          },
          {
            vendorRef: 'SOME_VALUE_3',
            hubMetadata: {
              favori: false
            }
          }
        ],
        favShortcuts: [
          {
            vendorRef: 'SOME_VALUE',
            hubMetadata: {
              favori: true
            }
          }
        ]
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }

      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(deleteFilePermanentlySpy).toHaveBeenCalledTimes(1)
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID')
    })
    it('should skip the shortcut if its type is not "file"', async () => {
      const foundShortcuts = [
        {
          _id: 'SOME_ID',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE'
          }
        },
        {
          _id: 'SOME_ID_2',
          type: 'file',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_2'
          }
        },
        {
          _id: 'SOME_ID_3',
          type: 'directory',
          metadata: {
            fileIdAttributes: 'SOME_VALUE_3'
          }
        }
      ]
      const computedShortcuts = {
        schoolShortcuts: [],
        favShortcuts: []
      }
      const favFolder = {
        _id: 'SOME_FAV_DIR_ID'
      }

      const deleteFilePermanentlySpy = jest.fn()
      cozyUtils.client.collection = jest.fn(() => ({
        deleteFilePermanently: deleteFilePermanentlySpy
      }))

      await cozyUtils.synchronizeShortcuts(
        foundShortcuts,
        computedShortcuts,
        favFolder
      )
      expect(deleteFilePermanentlySpy).toHaveBeenCalledTimes(2)
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID')
      expect(deleteFilePermanentlySpy).toHaveBeenCalledWith('SOME_ID_2')
    })
  })
})
