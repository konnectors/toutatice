const get = require('lodash/get')
const merge = require('lodash/merge')
const pLimit = require('p-limit')
const transpileToCozy = require('./helpers/transpileToCozy')

const synchronize = async (
  cozyUtils,
  contactAccountId,
  remoteContacts,
  cozyContacts
) => {
  const result = {
    contacts: {
      created: 0,
      updated: 0
    }
  }
  await cozyUtils.prepareIndex()

  const promises = remoteContacts.map(remoteContact => async () => {
    const cozyContact = cozyContacts.find(cozyContact => {
      const cozyRemoteId = get(
        cozyContact,
        `cozyMetadata.sync.${contactAccountId}.id`
      )
      return cozyRemoteId === remoteContact.uuid
    })

    const transpiledContact = transpileToCozy(remoteContact, contactAccountId)

    if (!cozyContact) {
      cozyUtils.save(transpiledContact)
      result.contacts.created++
    } else {
      const merged = merge(cozyContact, transpiledContact)
      cozyUtils.save(merged)
      result.contacts.updated++
    }
  })

  const limit = pLimit(50)
  await Promise.all(promises.map(limit))
  return result
}

module.exports = synchronize
