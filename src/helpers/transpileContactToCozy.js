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

const transpileContactToCozy = (contact, contactsAccountsId) => {
  const givenName = get(contact, 'firstname')
  const familyName = get(contact, 'lastname')
  const cozyUrl = get(contact, 'cloud_url')
  const title = get(contact, 'title')
  const remoteId = get(contact, 'uuid')

  const jobTitle = title ? getJobTitle(title) : undefined
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

  const groups = get(contact, 'groups', []).map(({ _id }) => ({
    _id,
    _type: 'io.cozy.contacts.groups'
  }))

  return {
    _type: DOCTYPE_CONTACTS,
    name: {
      familyName,
      givenName
    },
    cozy,
    jobTitle,
    relationships: {
      groups: {
        data: groups
      }
    },
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

module.exports = transpileContactToCozy
