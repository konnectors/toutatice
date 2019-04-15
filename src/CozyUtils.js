const { log } = require('cozy-konnector-libs')
const get = require('lodash/get')
const initCozyClient = require('./helpers/initCozyClient')

const {
  APP_NAME,
  DOCTYPE_CONTACTS,
  DOCTYPE_CONTACTS_ACCOUNT
} = require('./constants')

class CozyUtils {
  constructor(accountId) {
    this.client = initCozyClient(accountId)
  }

  prepareIndex(contactAccountId) {
    return this.client
      .collection(DOCTYPE_CONTACTS)
      .createIndex([`cozyMetadata.sync.${contactAccountId}.id`])
  }

  async findContacts(accountId, remoteIds) {
    const contactsCollection = this.client.collection(DOCTYPE_CONTACTS)
    const resp = await contactsCollection.find(
      {
        cozyMetadata: {
          sync: {
            [accountId]: {
              id: {
                $in: remoteIds
              }
            }
          }
        }
      },
      { indexedFields: [`cozyMetadata.sync.${accountId}.id`] }
    )

    return get(resp, 'data')
  }

  async findOrCreateContactAccount(accountId, accountName) {
    const accountsCollection = this.client.collection(DOCTYPE_CONTACTS_ACCOUNT)
    const accountsWithSourceAccount = await accountsCollection.find({
      sourceAccount: accountId
    })

    if (accountsWithSourceAccount.data.length > 0) {
      return accountsWithSourceAccount.data[0]
    } else {
      let accountDoc = {
        canLinkContacts: false,
        shouldSyncOrphan: false,
        lastSync: null,
        lastLocalSync: null,
        name: accountName,
        _type: DOCTYPE_CONTACTS_ACCOUNT,
        type: APP_NAME,
        sourceAccount: accountId,
        version: 1
      }

      // find a contact account with the same name that may have been previously disconnected.
      const accountsWithName = await accountsCollection.find({
        name: accountName
      })

      if (accountsWithName.data.length > 0) {
        if (accountsWithName.data.length > 1) {
          log(
            'info',
            `Found more than one io.cozy.contacts.accounts with the name ${accountName} — using the first one.`
          )
        }
        accountDoc._id = accountsWithName.data[0]._id
        accountDoc._rev = accountsWithName.data[0]._rev
      }

      const resp = await this.client.save(accountDoc)
      return resp.data
    }
  }

  save(params) {
    return this.client.save(params)
  }
}

module.exports = CozyUtils
