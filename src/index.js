const { BaseKonnector, log, errors } = require('cozy-konnector-libs')
const getAccountId = require('./helpers/getAccountId')

module.exports = new BaseKonnector(start)

// The start function is run by the BaseKonnector instance only when it got all the account
// information (fields). When you run this connector yourself in "standalone" mode or "dev" mode,
// the account information come from ./konnector-dev-config.json file
async function start() {
  log('info', 'Starting the Toutatice connector')

  // get or create contacts.account
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
  try {
    const accountId = getAccountId()
  } catch (err) {
    log('error', 'caught an unexpected error')
    log('error', err.message)
    throw errors.VENDOR_DOWN
  }
}
