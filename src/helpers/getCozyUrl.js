const { log } = require('cozy-konnector-libs')

function getCozyUrl() {
  if (process.env.COZY_URL === undefined) {
    log('error', 'Please provide COZY_URL environment variable.')
    throw new Error('COZY_URL environment variable is absent/not valid')
  } else {
    return process.env.COZY_URL
  }
}

module.exports = getCozyUrl
