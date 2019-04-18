const get = require('lodash/get')
const { DOCTYPE_CONTACTS_GROUPS, APP_NAME } = require('../constants')

const transpileGroupToCozy = (group, contactsAccountsId) => {
  const name = get(group, 'name')
  const remoteId = get(group, 'uuid')
  const now = new Date().toISOString()

  return {
    _type: DOCTYPE_CONTACTS_GROUPS,
    name,
    cozyMetadata: {
      sync: {
        [contactsAccountsId]: {
          contactsAccountsId,
          id: remoteId,
          konnector: APP_NAME,
          lastSync: now,
          remoteRev: null
        }
      }
    }
  }
}

module.exports = transpileGroupToCozy
