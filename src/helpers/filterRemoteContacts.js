const uniqBy = require('lodash/uniqBy')

const filterRemoteContacts = contacts => {
  return uniqBy(contacts, 'uuid').filter(({ uuid }) => !!uuid)
}

module.exports = filterRemoteContacts
