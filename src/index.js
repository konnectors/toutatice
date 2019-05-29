const { BaseKonnector, log, errors } = require('cozy-konnector-libs')
const get = require('lodash/get')
const CozyUtils = require('./CozyUtils')
const ToutaticeClient = require('./toutaticeClient')
const getAccountId = require('./helpers/getAccountId')
const convertStructuresToGroups = require('./helpers/convertStructuresToGroups')
const filterValidGroups = require('./helpers/filterValidGroups')
const filterValidContacts = require('./helpers/filterValidContacts')
const attachGroupsToContacts = require('./helpers/attachGroupsToContacts')
const synchronizeContacts = require('./synchronizeContacts')
const synchronizeGroups = require('./synchronizeGroups')
const { TOUTATICE_API_URL } = require('./constants')

module.exports = new BaseKonnector(start)

// The start function is run by the BaseKonnector instance only when it got all the account
// information (fields). When you run this connector yourself in "standalone" mode or "dev" mode,
// the account information come from ./konnector-dev-config.json file
async function start(fields) {
  log('info', 'Starting the Toutatice connector')

  try {
    const accountId = getAccountId()
    const cozyUtils = new CozyUtils(accountId)

    const toutaticeClient = new ToutaticeClient({
      url: TOUTATICE_API_URL,
      token: fields.access_token
    })

    log('info', 'Fetching user infos')
    const userInfo = await toutaticeClient.getUserInfo()

    log('info', 'Getting cozy contact account')
    const accountName = get(userInfo, 'unik', 'toutatice')
    const contactAccount = await cozyUtils.findOrCreateContactAccount(
      accountId,
      accountName
    )

    log('info', 'Preparing CouchDB indexes')
    await cozyUtils.prepareIndexes()

    log('info', 'Fetching remote data')
    if (!userInfo.ENTPersonUid)
      throw new Error('No ENTPersonUid field for current user')
    const remoteData = await toutaticeClient.getContacts(userInfo.ENTPersonUid)

    log('info', 'Syncing groups')
    const remoteStructures = get(remoteData, 'structures', [])
    const remoteGroups = convertStructuresToGroups(remoteStructures)
    const filteredGroups = filterValidGroups(remoteGroups)

    const remoteGroupsId = filteredGroups.map(({ uuid }) => uuid)
    const existingCozyGroups = await cozyUtils.findGroups(
      contactAccount._id,
      remoteGroupsId
    )
    const {
      groups: allConnectorGroups,
      ...groupsSyncResult
    } = await synchronizeGroups(
      cozyUtils,
      contactAccount._id,
      filteredGroups,
      existingCozyGroups
    )
    log('info', `${groupsSyncResult.created} groups created`)
    log('info', `${groupsSyncResult.updated} groups updated`)
    log('info', `${groupsSyncResult.skipped} groups skipped`)

    log('info', 'Syncing contacts')
    const remoteContacts = get(remoteData, 'contacts', [])
    const filteredContacts = filterValidContacts(remoteContacts)

    const remoteContactsWithGroups = attachGroupsToContacts(
      filteredContacts,
      filteredGroups,
      allConnectorGroups,
      contactAccount._id
    )

    const remoteContactsId = filteredContacts.map(({ uuid }) => uuid)
    const cozyContacts = await cozyUtils.findContacts(
      contactAccount._id,
      remoteContactsId
    )

    const contactsSyncResult = await synchronizeContacts(
      cozyUtils,
      contactAccount._id,
      remoteContactsWithGroups,
      cozyContacts,
      allConnectorGroups
    )

    log('info', `${contactsSyncResult.contacts.created} contacts created`)
    log('info', `${contactsSyncResult.contacts.updated} contacts updated`)
    log('info', `${contactsSyncResult.contacts.skipped} contacts skipped`)

    log('info', 'Updating lastLocalSync')
    await cozyUtils.save({
      ...contactAccount,
      lastLocalSync: new Date().toISOString()
    })

    log('info', 'Deleting account')
    await cozyUtils.deleteAccount(accountId)

    log('info', 'Finished!')
  } catch (err) {
    log('error', 'caught an unexpected error')
    log('error', err.message)
    throw errors.VENDOR_DOWN
  }
}
