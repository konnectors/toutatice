const get = require('lodash/get')
const merge = require('lodash/merge')
const pLimit = require('p-limit')

const synchronize = async (cozyUtils, contactAccountId, remoteContacts) => {
  const result = {
    contacts: {
      created: 0,
      updated: 0
    }
  }
  await cozyUtils.prepareIndex()

  const promises = remoteContacts.map(remoteContact => async () => {
    const remoteId = get(
      remoteContact,
      `cozyMetadata.sync.${contactAccountId}.id`
    )
    const cozyContact = await cozyUtils.findContact(contactAccountId, remoteId)

    if (!cozyContact) {
      cozyUtils.save(remoteContact)
      result.contacts.created++
    } else {
      const merged = merge(cozyContact, remoteContact)
      cozyUtils.save(merged)
      result.contacts.updated++
    }
  })

  const limit = pLimit(50)
  await Promise.all(promises.map(limit))
  return result
}

module.exports = synchronize
