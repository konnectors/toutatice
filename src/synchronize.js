const { log } = require('cozy-konnector-libs')
const get = require('lodash/get')
const pLimit = require('p-limit')

const synchronize = async (cozyUtils, contactAccountId, remoteContacts) => {
  await cozyUtils.prepareIndex()

  const promises = remoteContacts.map(remoteContact => async () => {
    const remoteId = get(
      remoteContact,
      `cozyMetadata.sync.${contactAccountId}.id`
    )
    const cozyContact = await cozyUtils.findContact(contactAccountId, remoteId)

    if (!cozyContact) {
      cozyUtils.save(remoteContact)
    } else {
      log('info', 'Update contact ' + remoteContact.name)
    }
  })

  const limit = pLimit(50)
  await Promise.all(promises.map(limit))
}

module.exports = synchronize
