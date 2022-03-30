module.exports = {
  setupFiles: ['<rootDir>/jestHelpers/setup.js'],
  transform: {
    '^.+\\.konnector$': '<rootDir>/jestHelpers/json-transformer.js'
  }
}
