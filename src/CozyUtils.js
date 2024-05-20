// @ts-check
const { log, cozyClient, manifest } = require('cozy-konnector-libs')
const fetch = require('node-fetch').default
const { Q } = require('cozy-client')
const get = require('lodash/get')

const {
  APP_NAME,
  DOCTYPE_CONTACTS,
  DOCTYPE_CONTACTS_GROUPS,
  DOCTYPE_CONTACTS_ACCOUNT,
  DOCTYPE_FILES,
  DOCTYPE_HOME_SETTINGS
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
   * @returns {Promise<array>}
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
   * @returns {Promise<array>}
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
   * @returns {Promise<object>}
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
   * @returns {Promise<object>}
   */
  async computeShortcuts(files) {
    log('info', 'computeShortcuts starts')
    let schoolShortcuts = []
    let favShortcuts = []
    let processedIcons = 0
    let unprocessedIcons = 0
    for (const file of files) {
      if (file.hubMetadata.favori) {
        const appToSave = {
          vendorRef: file.hubMetadata.idInterne,
          filename: `${file.title}.url`,
          filestream: `[InternetShortcut]\nURL=${file.url}`,
          shouldReplaceFile: () => true,
          fileAttributes: {
            metadata: {
              ...file
            }
          }
        }
        if (
          appToSave.fileAttributes.metadata.icon &&
          (appToSave.fileAttributes.metadata.icon.startsWith('https://') ||
            appToSave.fileAttributes.metadata.icon.startsWith('http://'))
        ) {
          const finalIcon = await this.fetchIcon(
            appToSave.fileAttributes.metadata.icon
          )
          appToSave.fileAttributes.metadata.icon = finalIcon.content
          appToSave.fileAttributes.metadata.iconMimeType = finalIcon.mimetype
          processedIcons++
        } else {
          // If not usable, make sure to delete it to avoid bad display of the icon on cozy home
          delete appToSave.fileAttributes.metadata.icon
          unprocessedIcons++
        }
        favShortcuts.push(appToSave)
      } else {
        const appToSave = {
          vendorRef: file.hubMetadata.idInterne,
          filename: `${file.title}.url`,
          filestream: `[InternetShortcut]\nURL=${file.url}`,
          shouldReplaceFile: () => true,
          fileAttributes: {
            metadata: {
              ...file
            }
          }
        }
        if (
          appToSave.fileAttributes.metadata.icon &&
          (appToSave.fileAttributes.metadata.icon.startsWith('https://') ||
            appToSave.fileAttributes.metadata.icon.startsWith('http://'))
        ) {
          const finalIcon = await this.fetchIcon(
            appToSave.fileAttributes.metadata.icon
          )
          appToSave.fileAttributes.metadata.icon = finalIcon.content
          appToSave.fileAttributes.metadata.iconMimeType = finalIcon.mimetype
          processedIcons++
        } else {
          // If not usable, make sure to delete it to avoid bad display of the icon on cozy home
          delete appToSave.fileAttributes.metadata.icon
          unprocessedIcons++
        }
        schoolShortcuts.push(appToSave)
      }
    }
    log(
      'debug',
      `${processedIcons} icons treated & ${unprocessedIcons} icons untreated : No valid urls`
    )
    return { schoolShortcuts, favShortcuts }
  }

  async findShortcuts() {
    log('info', 'Getting in findShortcuts')
    // Here we're looking for the shortcuts created by toutatice konnector
    // We know their path is "/Settings/Home", so there is no need to query the path
    const query = Q(DOCTYPE_FILES).partialIndex({
      type: 'file',
      class: 'shortcut',
      'cozyMetadata.createdByApp': manifest.data.slug,
      trashed: false
    })
    const existingShortcuts = await this.client.queryAll(query)
    return existingShortcuts
  }

  async synchronizeShortcuts(
    foundShortcuts,
    computedShortcuts,
    folder,
    favFolder
  ) {
    const folderId = folder._id
    const favFolderId = favFolder._id
    let allComputedShortcuts = computedShortcuts.schoolShortcuts.concat(
      computedShortcuts.favShortcuts
    )
    let appsToDelete = []
    for (const cozyShortcut of foundShortcuts) {
      const isFavourite =
        folderId === cozyShortcut.dir_id || favFolderId === cozyShortcut.dir_id
      let idx = allComputedShortcuts.findIndex(apiShortcut => {
        return (
          apiShortcut.vendorRef === cozyShortcut.metadata.fileIdAttributes &&
          apiShortcut.fileAttributes.metadata.hubMetadata.favori === isFavourite
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

  async fetchIcon(url) {
    log('info', 'valid icon url found, processing')
    const iconizerUrl = this.getIconizerUrl()
    const processedUrl = `${iconizerUrl}/iconize?url=${encodeURIComponent(url)}`
    const processedIcon = await fetch(`${processedUrl}`, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    })
    try {
      const finalIcon = await processedIcon.json()
      return finalIcon
    } catch (err) {
      log(
        'warn',
        "Something went wrong while retrieving icon from iconizer's API"
      )
      log('warn', err)
    }
  }

  async findOrCreateHomeSettingsDoctype(shortcuts) {
    log('info', 'findOrCreateHomeSettingsDoctype starts')
    let sectionLayout = []
    let layout = {}
    let order = 1
    for (const shortcut of shortcuts) {
      const shortcutLayout = {
        id: shortcut.dir_id,
        originalName: 'Applications Toutatice',
        createdByApp: 'toutatice',
        mobile: {
          detailedLines: true,
          grouped: false
        },
        desktop: {
          detaileLines: true,
          grouped: false
        },
        order
      }
      sectionLayout.push(shortcutLayout)
      order++
    }
    layout.sectionLayout = sectionLayout
    const { data: existingLayout } = await this.client.query(
      Q(DOCTYPE_HOME_SETTINGS).getById('layout')
    )
    if (existingLayout) {
      layout = { ...existingLayout, ...layout }
    } else {
      layout = { ...layout, id: 'laytout', _type: DOCTYPE_HOME_SETTINGS }
    }
    await this.client.save(layout)
  }

  getIconizerUrl() {
    const secrets = JSON.parse(process.env.COZY_PARAMETERS || '{}').secret
    const iconizerUrl = secrets.iconizer_url
    return iconizerUrl
  }

  save(params) {
    return this.client.save(params)
  }
}
module.exports = CozyUtils
