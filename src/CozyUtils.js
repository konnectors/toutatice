const { log } = require('cozy-konnector-libs')
const get = require('lodash/get')
const initCozyClient = require('./helpers/initCozyClient')

const {
  APP_NAME,
  DOCTYPE_CONTACTS,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_ACCOUNT,
  DOCTYPE_TRIGGERS
} = require('./constants')

class CozyUtils {
  constructor(accountId) {
    this.client = initCozyClient(accountId)
  }

  async prepareIndexes(contactAccountId) {
    await this.client
      .collection(DOCTYPE_CONTACTS)
      .createIndex([`cozyMetadata.sync.${contactAccountId}.id`])
    await this.client
      .collection(DOCTYPE_CONTACTS_GROUPS)
      .createIndex([`cozyMetadata.sync.${contactAccountId}.id`])
  }

  /**
   * async findContacts - Finds contacts based on a list of remote ids
   *
   * @param  {string} accountId The io.cozy.contacts.account contacts should be linked to
   * @param  {array} remoteIds
   * @returns {array}
   */
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

  /**
   * async findGroups - Finds groups based on a list of remote ids
   *
   * @param  {string} accountId The io.cozy.contacts.account groups should be linked to
   * @param  {array} remoteIds
   * @returns {array}
   */
  async findGroups(accountId, remoteIds) {
    const groupsCollection = this.client.collection(DOCTYPE_CONTACTS_GROUPS)
    const resp = await groupsCollection.find(
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

  /**
   * async findOrCreateContactAccount - Finds (or creates) a io;cozy;contacts.account with the given name
   *
   * @param  {string} accountId   io.cozy.account ID
   * @param  {string} accountName
   * @returns {object}
   */
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

  async deleteAccount(accountId) {
    const accountsCollection = this.client.collection(DOCTYPE_ACCOUNT)
    const response = await accountsCollection.get(accountId)
    const doc = get(response, 'data')
    if (!doc && process.env.NODE_ENV === 'development') {
      log(
        'info',
        `Couldn't find io.cozy.accounts in development mode, skipping deleting account with id ${accountId}.`
      )
    } else {
      return accountsCollection.destroy(doc)
    }
  }

  async deleteTrigger(accountId) {
    const triggersCollection = this.client.collection(DOCTYPE_TRIGGERS)
    const response = await triggersCollection.find({
      worker: 'konnector' // this is the only field we can filter on in the trigger collection, other filters have to be applied manually
    })
    const triggers = response.data
    const accountTriggers = triggers.filter(trigger => {
      return (
        get(trigger, 'message.konnector') === 'toutatice' &&
        get(trigger, 'message.account') === accountId
      )
    })

    await Promise.all(
      // Int theory there is only one matching trigger, so there shoudn't be many promises here
      accountTriggers.map(async trigger => {
        return triggersCollection.destroy(trigger)
      })
    )
  }
}

module.exports = CozyUtils
