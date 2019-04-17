const uniqBy = require('lodash/uniqBy')

const filterRemoteGroups = groups => {
  return uniqBy(groups, 'gid').filter(({ gid }) => !!gid)
}
module.exports = filterRemoteGroups
