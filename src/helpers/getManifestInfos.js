const fs = require('fs')

module.exports = () => {
  if (process.env.NODE_ENV === 'development') {
    return JSON.parse(fs.readFileSync('./manifest.konnector', 'utf8'))
  } else {
    return require('../../manifest.konnector')
  }
}
