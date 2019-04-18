const { BaseKonnector, log, errors } = require('cozy-konnector-libs')
const fetch = require('isomorphic-fetch')
const get = require('lodash/get')
const CozyUtils = require('./CozyUtils')
const getAccountId = require('./helpers/getAccountId')
const convertStructuresToGroups = require('./helpers/convertStructuresToGroups')
const filterRemoteGroups = require('./helpers/filterRemoteGroups')
const filterRemoteContacts = require('./helpers/filterRemoteContacts')
const synchronizeContacts = require('./synchronizeContacts')
const synchronizeGroups = require('./synchronizeGroups')

module.exports = new BaseKonnector(start)

// The start function is run by the BaseKonnector instance only when it got all the account
// information (fields). When you run this connector yourself in "standalone" mode or "dev" mode,
// the account information come from ./konnector-dev-config.json file
async function start() {
  log('info', 'Starting the Toutatice connector')

  try {
    const accountId = getAccountId()
    const cozyUtils = new CozyUtils(accountId)

    log('info', 'Getting cozy contact account')
    const contactAccount = await cozyUtils.findOrCreateContactAccount(
      accountId,
      'toutatice'
    )

    await cozyUtils.prepareIndexes()

    const response = await fetch(
      'https://jsonblob.com/api/jsonBlob/a47fe912-5d25-11e9-bde5-291328616b73'
    )
    const remoteData = await response.json()

    const remoteStructures = get(remoteData, 'structures', [])
    const remoteGroups = convertStructuresToGroups(remoteStructures)
    const filteredGroups = filterRemoteGroups(remoteGroups)

    const remoteGroupsId = filteredGroups.map(({ uuid }) => uuid)
    const cozyGroups = await cozyUtils.findGroups(
      contactAccount._id,
      remoteGroupsId
    )
    const groupsSyncResult = await synchronizeGroups(
      cozyUtils,
      contactAccount._id,
      filteredGroups,
      cozyGroups
    )
    log('info', `${groupsSyncResult.created} groups created`)
    log('info', `${groupsSyncResult.updated} groups updated`)

    const remoteContacts = get(remoteData, 'contacts', [])
    const filteredContacts = filterRemoteContacts(remoteContacts)

    const remoteContactsId = filteredContacts.map(({ uuid }) => uuid)
    const cozyContacts = await cozyUtils.findContacts(
      contactAccount._id,
      remoteContactsId
    )

    const contactsSyncResult = await synchronizeContacts(
      cozyUtils,
      contactAccount._id,
      filteredContacts,
      cozyContacts
    )

    log('info', `${contactsSyncResult.contacts.created} contacts created`)
    log('info', `${contactsSyncResult.contacts.updated} contacts updated`)

    await cozyUtils.save({
      ...contactAccount,
      lastLocalSync: new Date().toISOString()
    })
  } catch (err) {
    log('error', 'caught an unexpected error')
    log('error', err.message)
    throw errors.VENDOR_DOWN
  }
}
