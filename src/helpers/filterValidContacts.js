const uniqBy = require('lodash/uniqBy')

const filterValidContacts = contacts => {
  return uniqBy(contacts, 'uuid').filter(({ uuid }) => !!uuid)
}

module.exports = filterValidContacts
