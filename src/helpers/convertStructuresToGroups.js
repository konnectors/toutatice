const get = require('lodash/get')

const convertStructuresToGroups = structures => {
  return structures.reduce((groups, structure) => {
    const structureId = get(structure, 'structure')
    const structureName = get(structure, 'name')
    const structureGroups = get(structure, 'groups', [])

    // uuid construction has been changed from gid to name of the group
    // old uuid was `${structureId}-${structureGroup.gid}`
    structureGroups.forEach(structureGroup => {
      groups.push({
        uuid: `${structureId}-${structureGroup.name}`,
        structure: structureId,
        structureName,
        ...structureGroup
      })
    })

    return groups
  }, [])
}

module.exports = convertStructuresToGroups
