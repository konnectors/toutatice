const get = require('lodash/get')
const set = require('lodash/set')
const transpileGroupToCozy = require('./helpers/transpileGroupToCozy')

const synchronizeGroups = async (
  cozyUtils,
  contactAccountId,
  remoteGroups,
  cozyGroups
) => {
  const result = {
    created: 0,
    updated: 0,
    skipped: 0,
    groups: []
  }
  for (const remoteGroup of remoteGroups) {
    const remoteOldId = remoteGroup.structure + '-' + remoteGroup.gid
    const transpiledGroup = transpileGroupToCozy(remoteGroup, contactAccountId)
    const remoteIdKey = `cozyMetadata.sync.${contactAccountId}.id`
    const remoteId = get(transpiledGroup, remoteIdKey)

    const cozyGroup = cozyGroups.find(group => {
      const cozyRemoteId = get(group, remoteIdKey)
      return cozyRemoteId === remoteId
    })

    const cozyGroupWithOldId = cozyGroups.find(group => {
      const cozyRemoteId = get(group, remoteIdKey)
      return cozyRemoteId === remoteOldId
    })

    if (!cozyGroup && cozyGroupWithOldId) {
      const creationDate = Date.parse(
        get(cozyGroupWithOldId, 'cozyMetadata.createdAt')
      )
      // This date was especially choosen because of api opening the 13Sept2021
      if (creationDate < Date.parse('2021-09-10')) {
        const created = await cozyUtils.save(transpiledGroup)
        result.groups.push(created.data)
        result.created++
      } else {
        // Update
        let updatedGroup = cozyGroupWithOldId
        set(
          updatedGroup,
          `cozyMetadata.sync.${contactAccountId}.id`,
          remoteGroup.structure + '-' + remoteGroup.name
        )
        const updated = await cozyUtils.save(updatedGroup)
        result.groups.push(updated.data)
        result.updated++
      }
    } else if (!cozyGroup) {
      const created = await cozyUtils.save(transpiledGroup)
      result.groups.push(created.data)
      result.created++
    } else {
      // the group already exists and there is nothing to update
      result.groups.push(cozyGroup)
      result.skipped++
    }
  }

  return result
}

module.exports = synchronizeGroups
