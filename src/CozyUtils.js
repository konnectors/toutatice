const { log, cozyClient } = require('cozy-konnector-libs')
const { Q } = require('cozy-client')
const get = require('lodash/get')

const {
  APP_NAME,
  DOCTYPE_CONTACTS,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_FILES
} = require('./constants')

class CozyUtils {
  constructor() {
    this.client = cozyClient.new
  }

  async refreshToken(accountId) {
    const response = await this.client.fetch(
      'POST',
      `/accounts/toutatice/${accountId}/refresh`
    )
    const body = await response.json()
    return get(body, 'data.attributes.oauth.access_token', null)
  }

  async prepareIndexes(contactAccountId) {
    await this.client
      .collection(DOCTYPE_CONTACTS)
      .createIndex([`cozyMetadata.sync.${contactAccountId}.contactsAccountsId`])
    await this.client
      .collection(DOCTYPE_CONTACTS_GROUPS)
      .createIndex([`cozyMetadata.sync.${contactAccountId}.id`])
  }

  /**
   * async findContacts - Finds contacts based on a list of remote ids
   *
   * @param  {string} accountId The io.cozy.contacts.account contacts should be linked to
   * @returns {array}
   */
  async findContacts(accountId) {
    const contactsCollection = this.client.collection(DOCTYPE_CONTACTS)
    const LIMIT = 100
    let allContacts = []
    let skip = 0
    let hasMore = true

    while (hasMore) {
      const resp = await contactsCollection.find(
        {
          cozyMetadata: {
            sync: {
              [accountId]: {
                contactsAccountsId: accountId
              }
            }
          }
        },
        {
          indexedFields: [`cozyMetadata.sync.${accountId}.contactsAccountsId`],
          skip,
          limit: LIMIT
        }
      )
      allContacts = [...allContacts, ...get(resp, 'data')]
      hasMore = resp.next
      skip += LIMIT
    }

    return allContacts
  }

  /**
   * async findGroups - Finds groups based on a list of remote ids
   *
   * @param  {string} accountId The io.cozy.contacts.account groups should be linked to
   * @param  {array} remoteIds
   * @returns {array}
   */
  async findGroups(accountId) {
    const groupsCollection = this.client.collection(DOCTYPE_CONTACTS_GROUPS)
    const resp = await groupsCollection.find(
      {
        cozyMetadata: {
          sync: {
            [accountId]: {
              contactsAccountsId: {
                $in: [accountId]
              }
            }
          }
        }
      },
      { indexedFields: [`cozyMetadata.sync.${accountId}.contactsAccountsId`] }
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

  /**
   * async computeShortcuts - Spliting and preparing shortcuts for saveFiles
   *
   * @param  {array} files   files received from the toutatice API call
   * @returns {object}
   */
  async computeShortcuts(files) {
    log('info', 'computeShortcuts starts')
    let schoolShortcuts = []
    let favShortcuts = []
    for (const file of files) {
      if (file.hubMetadata.favori) {
        favShortcuts.push({
          ...file,
          vendorRef: file.hubMetadata.idInterne,
          filename: `${file.title}.url`,
          filestream: `[InternetShortcut]\nURL=${file.url}`,
          // metadata: {
          //   icon: svgIcon
          // },
          shouldReplaceFile: true
        })
      } else {
        const appToSave = {
          ...file,
          vendorRef: file.hubMetadata.idInterne,
          filename: `${file.title}.url`,
          filestream: `[InternetShortcut]\nURL=${file.url}`,
          shouldReplaceFile: true
        }
        if (file.icon) {
          if (file.icon.match('https://')) {
            appToSave.metadata = {
              icon: file.icon
            }
          }
        }
        schoolShortcuts.push(appToSave)
      }
    }
    return { schoolShortcuts, favShortcuts }
  }

  async findShortcuts() {
    log('info', 'Getting in findShortcuts')
    // Here we're looking for the shortcuts created by toutatice konnector
    // We know their path is "/Settings/Home", so there is no need to query the path
    try {
      const query = Q(DOCTYPE_FILES).partialIndex({
        type: 'file',
        class: 'shortcut',
        'cozyMetadata.createdByApp': 'toutatice',
        trashed: false
      })
      const existingShortcuts = await this.client.queryAll(query)
      return existingShortcuts
    } catch (err) {
      throw new Error(err)
    }
  }

  async synchronizeShortcuts(foundShortcuts, computedShortcuts, favFolder) {
    const favFolderId = favFolder._id
    let allComputedShortcuts = computedShortcuts.schoolShortcuts.concat(
      computedShortcuts.favShortcuts
    )
    let appsToDelete = []
    for (let cozyShortcut of foundShortcuts) {
      const isFavourite = favFolderId === cozyShortcut.dir_id ? true : false
      if (cozyShortcut.type !== 'file') {
        log('info', 'is not a file, jumping on next object')
        continue
      }
      let idx = allComputedShortcuts.findIndex(apiShortcut => {
        return (
          apiShortcut.vendorRef === cozyShortcut.metadata.fileIdAttributes &&
          apiShortcut.hubMetadata.favori === isFavourite
        )
      })
      if (idx == -1) {
        appsToDelete.push(cozyShortcut)
      }
    }
    if (appsToDelete.length > 0) {
      log('info', `${appsToDelete.length} apps to delete`)
      await Promise.all(
        appsToDelete.map(appToDelete =>
          // wrap limit here if neededs
          this.client
            .collection(DOCTYPE_FILES)
            .deleteFilePermanently(appToDelete._id)
        )
      )
    }
  }
  // Waiting for the full svg icons to be handled
  // async computeThumbnails(files) {
  //   let thumbnailsSource = []
  //   for (const file of files) {
  //     if (file.icon === undefined) {
  //       continue
  //     } else if (file.icon.match('.svg' | '.png')) {
  //       thumbnailsSource.push({
  //         title: file.title,
  //         url: file.icon
  //       })
  //     }
  //   }
  // }

  save(params) {
    return this.client.save(params)
  }
}
module.exports = CozyUtils
