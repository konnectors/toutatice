const { log } = require('cozy-konnector-libs')

function createFiles(apps) {
  log('info', 'createFiles starts')
  let files = []
  try {
    for (const app of apps) {
      files.push({
        title: app.title[0],
        description: app.description,
        url: app.source,
        thumbnail: app.vignette,
        source: app.rights,
        networkAccess: app.networkAccessibility,
        hubMetadata: app.hubMetadata
      })
    }
    return files
  } catch (err) {
    log('error', 'something wen wrong when creating files')
    throw err
  }
}

module.exports = createFiles
