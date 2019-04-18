const uniqBy = require('lodash/uniqBy')

const filterRemoteGroups = groups => {
  return uniqBy(groups, 'gid').filter(({ structure, gid }) => gid && structure)
}
module.exports = filterRemoteGroups
