const { BaseKonnector, log, errors } = require('cozy-konnector-libs')
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
    //
    // fetch contacts and groups
    //
    // create all groups on cozy
    //
    // foreach remote contact
    // - transpiler to cozy
    // - attach groups
    // - fetch cozy contact
    // - - if inexistent, create it
    // - - else update by overriding with remote first
  } catch (err) {
    log('error', 'caught an unexpected error')
    log('error', err.message)
    throw errors.VENDOR_DOWN
  }
}
