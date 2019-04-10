const { BaseKonnector, log, errors } = require('cozy-konnector-libs')
const fetch = require('node-fetch')
const get = require('lodash/get')
const CozyUtils = require('./CozyUtils')
const getAccountId = require('./helpers/getAccountId')

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
    log('info', contactAccount)

    const response = await fetch(
      'https://gist.githubusercontent.com/y-lohse/32686b06ab953bef7ffd6904b76651cf/raw/04f2ef9bf19897698146e6d2ef22d382f4454abf/enseignant.json'
    )
    const remoteData = await response.json()
    //
    // create all groups on cozy
    //
    // foreach remote contact
    // - transpiler to cozy
    // - attach groups
    // - fetch cozy contact
    // - - if inexistent, create it
    // - - else update by overriding with remote first
    const remoteContacts = get(remoteData, 'contacts', [])
    log('info', remoteContacts)
  } catch (err) {
    log('error', 'caught an unexpected error')
    log('error', err.message)
    throw errors.VENDOR_DOWN
  }
}
