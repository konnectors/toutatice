const get = require('lodash/get')
const mergeWith = require('lodash/mergeWith')
const isArray = require('lodash/isArray')
const isEqual = require('lodash/isEqual')
const remove = require('lodash/remove')
const unset = require('lodash/unset')
const omit = require('lodash/omit')
const transpileContactToCozy = require('./helpers/transpileContactToCozy')

const customMerge = connectorGroupIds => (existingValue, newValue, key) => {
  if (key === 'cozy') return cozyMergeStrategy(existingValue, newValue)
  if (key === 'relationships')
    return relationshipsMergeStrategy(connectorGroupIds)(
      existingValue,
      newValue
    )
  if (key === 'email') return emailMergeStrategy(existingValue, newValue)
  else return undefined // for other fields, use the normal lodash merge strategy
}

// for the email fields,
// we preserve existing addresses, we overwrite type 'Pro' addresses
const emailMergeStrategy = (existingEmails, newEmails) => {
  const hasAnEmail = isArray(newEmails) && newEmails.length > 0
  if (hasAnEmail) {
    const emails = existingEmails || []
    // Remove all emails with type Pro
    remove(emails, email => {
      return email.type == 'Pro'
    })
    // Add new Pro email
    return emails.concat(newEmails)
  } else return existingEmails
}

// for the cozy field, we always want to use the new value
const cozyMergeStrategy = (existingCozy, newCozy) => {
  const hasNewCozyValue = isArray(newCozy) && newCozy.length > 0
  if (hasNewCozyValue) return newCozy
  else return undefined
}

const relationshipsMergeStrategy =
  connectorGroupIds => (existingRelationships, newRelationships) => {
    const otherRelationships = omit(existingRelationships, 'groups')
    const existingGroups = get(existingRelationships, 'groups.data', [])
    const existingManualGroups = existingGroups.filter(
      ({ _id: existingGroupId }) =>
        !connectorGroupIds.some(
          ({ _id: connectorGroupId }) => connectorGroupId === existingGroupId
        )
    )
    const newGroups = get(newRelationships, 'groups.data', [])

    return {
      ...otherRelationships,
      groups: {
        data: [...newGroups, ...existingManualGroups]
      }
    }
  }

const getFinalContactData = (cozyContact, remoteContact, connectorGroupIds) => {
  const merged = mergeWith(
    {}, // we don't want to mutate cozyContact or remoteContact
    cozyContact,
    remoteContact,
    customMerge(connectorGroupIds)
  )
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
    'email',
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
  cozyContacts,
  connectorGroupIds
) => {
  const result = {
    contacts: {
      created: 0,
      updated: 0,
      skipped: 0
    }
  }

  for (const remoteContact of remoteContacts) {
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
    const finalContact = getFinalContactData(
      cozyContact,
      transpiledContact,
      connectorGroupIds
    )

    const needsUpdate = haveRemoteFieldsChanged(
      cozyContact,
      finalContact,
      contactAccountId
    )
    if (!cozyContact) {
      await cozyUtils.save(finalContact)
      result.contacts.created++
    } else if (needsUpdate) {
      await cozyUtils.save(finalContact)
      result.contacts.updated++
    } else {
      // the contact already exists and there is nothing to update
      result.contacts.skipped++
    }
  }

  const contactsDeletedOnRemote = cozyContacts.filter(cozyContact => {
    const cozyRemoteId = get(
      cozyContact,
      `cozyMetadata.sync.${contactAccountId}.id`
    )

    return !remoteContacts.some(
      remoteContact => cozyRemoteId === remoteContact.uuid
    )
  })

  for (const contactDeletedOnRemote of contactsDeletedOnRemote) {
    const onlyManualRelationships = relationshipsMergeStrategy(
      connectorGroupIds
    )(contactDeletedOnRemote.relationships, {})

    const contactWithoutConnectorGroups = {
      ...contactDeletedOnRemote,
      relationships: onlyManualRelationships
    }

    await cozyUtils.save(contactWithoutConnectorGroups)
    result.contacts.updated++
  }

  return result
}

module.exports = synchronizeContacts
