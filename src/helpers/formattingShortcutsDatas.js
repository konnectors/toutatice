const { log } = require('cozy-konnector-libs')

function formattingShortcutsDatas(apps) {
  log('info', 'formattingShortcutsDatas starts')
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
    log('error', "something went wrong when formatting shortcut's datas")
    throw err
  }
}

module.exports = formattingShortcutsDatas
