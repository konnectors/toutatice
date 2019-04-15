function getAccountId() {
  try {
    return process.env.NODE_ENV === 'development'
      ? 'fakeAccountId'
      : JSON.parse(process.env.COZY_FIELDS).account
  } catch (err) {
    throw new Error(`You must provide 'account' in COZY_FIELDS: ${err.message}`)
  }
}

module.exports = getAccountId
