const uniqBy = require('lodash/uniqBy')

const filterValidGroups = groups => {
  return uniqBy(groups, 'gid').filter(({ structure, gid }) => gid && structure)
}
module.exports = filterValidGroups
