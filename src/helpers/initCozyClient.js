const { log } = require('cozy-konnector-libs')
const CozyClient = require('cozy-client').default
const getCozyUrl = require('./getCozyUrl')
const getAccessToken = require('./getAccessToken')

const {
  APP_NAME,
  APP_VERSION,
  DOCTYPE_CONTACTS,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS_VERSION,
  DOCTYPE_CONTACTS_ACCOUNT_VERSION,
  DOCTYPE_CONTACTS_GROUPS_VERSION
} = require('../constants')

function getSchema() {
  return {
    contacts: {
      doctype: DOCTYPE_CONTACTS,
      doctypeVersion: DOCTYPE_CONTACTS_VERSION
    },
    contactsAccounts: {
      doctype: DOCTYPE_CONTACTS_ACCOUNT,
      doctypeVersion: DOCTYPE_CONTACTS_ACCOUNT_VERSION
    },
    contactsGroups: {
      doctype: DOCTYPE_CONTACTS_GROUPS,
      doctypeVersion: DOCTYPE_CONTACTS_GROUPS_VERSION
    }
  }
}

function initCozyClient(accountId) {
  const environment =
    process.env.NODE_ENV === 'none' ? 'production' : process.env.NODE_ENV
  try {
    const uri = getCozyUrl(environment)
    const token = getAccessToken(environment)
    const appMetadata = {
      slug: APP_NAME,
      sourceAccount: accountId,
      version: APP_VERSION
    }
    const schema = getSchema()
    return new CozyClient({ uri, token, appMetadata, schema })
  } catch (err) {
    log('error', 'Unable to initialize cozy client')
    throw err
  }
}

module.exports = initCozyClient
