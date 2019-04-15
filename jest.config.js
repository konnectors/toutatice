module.exports = {
  setupFiles: ['<rootDir>/jestHelpers/setup.js'],
  transform: {
    '^.+\\.js?$': '<rootDir>/jestHelpers/babel-transformer.js',
    '^.+\\.konnector$': '<rootDir>/jestHelpers/json-transformer.js'
  }
}
