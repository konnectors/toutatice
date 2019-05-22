const get = require('lodash/get')
const pLimit = require('p-limit')
const mergeWith = require('lodash/mergeWith')
const isArray = require('lodash/isArray')
const isEqual = require('lodash/isEqual')
const unset = require('lodash/unset')
const transpileContactToCozy = require('./helpers/transpileContactToCozy')

const customMerge = (objValue, srcValue, key) => {
  if (key === 'cozy') return cozyMergeStrategy(objValue, srcValue)
  else return undefined // for othr fields, use the normal lodash merge strategy
}

// for the cozy field, we want to always the new value
const cozyMergeStrategy = (objCozy, srcCozy) => {
  const hasNewCozyValue = isArray(srcCozy) && srcCozy.length > 0
  if (hasNewCozyValue) return srcCozy
  else return undefined
}

const getFinalContactData = (cozyContact, remoteContact) => {
  const merged = mergeWith({}, cozyContact, remoteContact, customMerge)
  unset(merged, 'trashed')
  return merged
}

const haveRemoteFieldsChanged = (
  currentContact,
  nextContact,
  contactAccountId
) => {
  const diffKeys = [
    'name.familyName',
    'name.givenName',
    'cozy.0.url',
    'jobTitle',
    'trashed', // always false for the remote/next contact
    `cozyMetadata.sync.${contactAccountId}.id`,
    'relationships.groups.data'
  ]
  return diffKeys.some(
    key => !isEqual(get(currentContact, key), get(nextContact, key))
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
    const finalContact = getFinalContactData(cozyContact, transpiledContact)

    const needsUpdate = haveRemoteFieldsChanged(
      cozyContact,
      finalContact,
      contactAccountId
    )

    if (!cozyContact) {
      cozyUtils.save(finalContact)
      result.contacts.created++
    } else if (needsUpdate) {
      cozyUtils.save(finalContact)
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
