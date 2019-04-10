const synchronize = require('./synchronize')

describe('synchronizing contacts', () => {
  const mockCozyUtils = {
    prepareIndex: jest.fn(),
    findContact: jest.fn(),
    save: jest.fn()
  }
  const MOCK_CONTACT_ACCOUNT_ID = '123-456'

  it('should create missing contacts', async () => {
    mockCozyUtils.findContact.mockResolvedValueOnce(undefined)
    const remoteContacts = [
      {
        _type: 'io.cozy.contacts',
        cozyMetadata: {
          sync: {
            [MOCK_CONTACT_ACCOUNT_ID]: {
              contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
              id: '1458-1523-1236-123',
              konnector: 'konnector-toutatice',
              lastSync: '2019-03-05T09:09:00.115Z',
              remoteRev: null
            }
          }
        }
      }
    ]
    await synchronize(mockCozyUtils, MOCK_CONTACT_ACCOUNT_ID, remoteContacts)
    expect(mockCozyUtils.save).toHaveBeenCalledWith({
      _type: 'io.cozy.contacts',
      cozyMetadata: {
        sync: {
          [MOCK_CONTACT_ACCOUNT_ID]: {
            contactsAccountsId: MOCK_CONTACT_ACCOUNT_ID,
            id: '1458-1523-1236-123',
            konnector: 'konnector-toutatice',
            lastSync: '2019-03-05T09:09:00.115Z',
            remoteRev: null
          }
        }
      }
    })
  })
})
