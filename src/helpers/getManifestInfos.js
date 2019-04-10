const fs = require('fs')
const manifestPath = './manifest.konnector'

module.exports = () => {
  if (process.env.NODE_ENV === 'development') {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  } else {
    return require(manifestPath)
  }
}
