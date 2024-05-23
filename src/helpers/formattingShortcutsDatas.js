const { log } = require('cozy-konnector-libs')

function formattingShortcutsDatas(apps) {
  log('info', 'formattingShortcutsDatas starts')
  let files = []
  // keeping all commented lines around for test/debug purposes while in beta
  let typeValues = [
    'app',
    'info'
    //  'espace', 'perso'
  ]
  let index = 0
  try {
    for (const app of apps) {
      // if (!app.hubMetadata.favori) {
      app.hubMetadata.favori = true
      // }
      // else {
      //   app.hubMetadata.favori = true
      // }
      files.push({
        title: app.title[0],
        description: app.description,
        url: app.source,
        icon: app.vignette,
        source: app.rights,
        networkAccess: app.networkAccessibility,
        hubMetadata: app.hubMetadata,
        // type: app.type
        type: typeValues[index % typeValues.length]
      })
      index++
    }
    return files
  } catch (err) {
    log('error', "something went wrong when formatting shortcut's datas")
    throw err
  }
}

module.exports = formattingShortcutsDatas
