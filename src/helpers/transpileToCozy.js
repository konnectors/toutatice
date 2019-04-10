const get = require('lodash/get')
const { DOCTYPE_CONTACTS, APP_NAME } = require('../constants')

const getJobTitle = title => {
  switch (title.toLowerCase()) {
    case 'ele':
      return 'Élève'
    case 'ens':
      return 'Enseignant'
    default:
      return title
  }
}

const transpileToCozy = (contact, contactsAccountsId) => {
  const familyName = get(contact, 'firstname')
  const givenName = get(contact, 'lastname')
  const cozyUrl = get(contact, 'cloud_url')
  const title = get(contact, 'title', '') || ''
  const remoteId = get(contact, 'uuid')

  const jobTitle = getJobTitle(title)
  const now = new Date().toISOString()

  const cozy = cozyUrl
    ? [
        {
          url: `https://${cozyUrl}`,
          label: null,
          primary: true
        }
      ]
    : []

  return {
    _type: DOCTYPE_CONTACTS,
    name: {
      familyName,
      givenName
    },
    cozy,
    jobTitle,
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

module.exports = transpileToCozy
