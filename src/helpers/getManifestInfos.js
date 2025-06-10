const fs = require('fs')

module.exports = () => {
  if (process.env.NODE_ENV === 'development') {
    if (process.env.NODE_ENV === 'development') {
      return JSON.parse(fs.readFileSync('./manifest.konnector', 'utf8'))
    } else {
      if (typeof __WEBPACK_PROVIDED_MANIFEST__ === 'undefined')
        throw new Error('__WEBPACK_PROVIDED_MANIFEST__ is not defined')
      // eslint-disable-next-line no-undef
      return JSON.parse(__WEBPACK_PROVIDED_MANIFEST__)
    }
  }
}
