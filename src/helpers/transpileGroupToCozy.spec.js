const MockDate = require('mockdate')
const transpileGroupToCozy = require('./transpileGroupToCozy')

const MOCKED_DATE = '2019-03-05T09:09:00.115Z'
const MOCK_CONTACT_ACCOUNT_ID = '123-abc'

describe('Transpile groups to cozy format', () => {
  beforeAll(() => {
    MockDate.set(MOCKED_DATE)
  })

  afterAll(() => {
    MockDate.reset()
  })

  it('should transpile a group', () => {
    const group = {
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
    const result = transpileGroupToCozy(group, MOCK_CONTACT_ACCOUNT_ID)
    expect(result).toEqual({
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
  })
})
