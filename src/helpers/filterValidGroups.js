const uniqBy = require('lodash/uniqBy')

const filterValidGroups = groups => {
  return uniqBy(groups, 'uuid').filter(({ structure, gid }) => gid && structure)
}
module.exports = filterValidGroups
