module.exports = {
  setupFiles: ['<rootDir>/jestHelpers/setup.js'],
  transform: {
    '^.+\\.(js|jsx)?$': '<rootDir>/jestHelpers/babel-transformer.js',
    '^.+\\.konnector$': '<rootDir>/jestHelpers/json-transformer.js'
  }
}
