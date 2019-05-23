const get = require('lodash/get')
const { log } = require('cozy-konnector-libs')

const getRemoteGroupsForContact = (remoteGroups, contactId) => {
  return remoteGroups.filter(remoteGroup => {
    const groupContacts = get(remoteGroup, 'group_contacts', [])
    return groupContacts.find(({ uuid }) => uuid === contactId)
  })
}

const attachGroupsToContacts = (
  contacts,
  remoteGroups,
  cozyGroups,
  contactsAccountsId
) => {
  const cozyGroupsByRemoteId = cozyGroups.reduce((acc, cozyGroup) => {
    const remoteId = get(
      cozyGroup,
      `cozyMetadata.sync.${contactsAccountsId}.id`
    )

    const matchingGroup = remoteGroups.find(({ uuid }) => remoteId === uuid)
    if (matchingGroup) acc[matchingGroup.uuid] = cozyGroup
    else {
      log(
        'warn',
        `Unable to find a matching remote group for cozy group with id ${
          cozyGroup._id
        }`
      )
      log('warn', remoteGroups)
    }
    return acc
  }, {})

  return contacts.map(contact => {
    const contactRemoteGroups = getRemoteGroupsForContact(
      remoteGroups,
      contact.uuid
    )
    const contactCozyGroups = contactRemoteGroups
      .map(({ uuid }) => cozyGroupsByRemoteId[uuid])
      .filter(cozyGroup => !!cozyGroup)

    const contactWithGroups = {
      ...contact,
      groups: contactCozyGroups.map(group => ({ _id: get(group, '_id') }))
    }
    return contactWithGroups
  })
}

module.exports = attachGroupsToContacts
