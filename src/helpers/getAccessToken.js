const { log } = require('cozy-konnector-libs')

function getAccessToken(environment) {
  try {
    if (environment === 'development') {
      const cozyCredentials = JSON.parse(process.env.COZY_CREDENTIALS)
      return cozyCredentials.token.accessToken
    } else {
      return process.env.COZY_CREDENTIALS.trim()
    }
  } catch (err) {
    log(
      'error',
      `Please provide proper COZY_CREDENTIALS environment variable. ${process.env.COZY_CREDENTIALS} is not OK`
    )

    throw err
  }
}

module.exports = getAccessToken
