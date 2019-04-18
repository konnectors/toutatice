const get = require('lodash/get')

const convertStructuresToGroups = structures => {
  return structures.reduce((groups, structure) => {
    const structureId = get(structure, 'structure')
    const structureName = get(structure, 'name')
    const structureGroups = get(structure, 'groups', [])

    structureGroups.forEach(structureGroup => {
      groups.push({
        uuid: `${structureId}-${structureGroup.gid}`,
        structure: structureId,
        structureName,
        ...structureGroup
      })
    })

    return groups
  }, [])
}

module.exports = convertStructuresToGroups
