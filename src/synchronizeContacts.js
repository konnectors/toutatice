const get = require('lodash/get')
const merge = require('lodash/merge')
const pLimit = require('p-limit')
const transpileContactToCozy = require('./helpers/transpileContactToCozy')

const haveRemoteFieldsChanged = (
  currentContact,
  nextContact,
  contactAccountId
) => {
  const diffKeys = [
    'name.familyName',
    'name.givenName',
    'cozy.url',
    'jobTitle',
    `cozyMetadata.sync.${contactAccountId}.id`
  ]
  return diffKeys.some(
    key => get(currentContact, key) !== get(nextContact, key)
  )
}

const synchronizeContacts = async (
  cozyUtils,
  contactAccountId,
  remoteContacts,
  cozyContacts
) => {
  const result = {
    contacts: {
      created: 0,
      updated: 0,
      skipped: 0
    }
  }
  const promises = remoteContacts.map(remoteContact => async () => {
    const cozyContact = cozyContacts.find(cozyContact => {
      const cozyRemoteId = get(
        cozyContact,
        `cozyMetadata.sync.${contactAccountId}.id`
      )
      return cozyRemoteId === remoteContact.uuid
    })

    const transpiledContact = transpileContactToCozy(
      remoteContact,
      contactAccountId
    )
    const needsUpdate = haveRemoteFieldsChanged(
      cozyContact,
      transpiledContact,
      contactAccountId
    )

    if (!cozyContact) {
      cozyUtils.save(transpiledContact)
      result.contacts.created++
    } else if (needsUpdate) {
      const merged = merge({}, cozyContact, transpiledContact)
      cozyUtils.save(merged)
      result.contacts.updated++
    } else {
      // the contact already exists and there is nothing to update
      result.contacts.skipped++
    }
  })

  const limit = pLimit(50)
  await Promise.all(promises.map(limit))
  return result
}

module.exports = synchronizeContacts
