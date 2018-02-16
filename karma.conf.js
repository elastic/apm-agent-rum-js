var karmaUtils = require('elastic-apm-js-core/dev-utils/karma.js')
var testUtils = require('elastic-apm-js-core/dev-utils/test.js')

module.exports = function (config) {
  config.set(karmaUtils.baseConfig)
  var testConfig = require('./test.config')
  var customeConfig = {
    globalConfigs: testConfig,
    testConfig: testConfig.env
  }
  console.log('customeConfig:', customeConfig)
  config.set(customeConfig)
  var cfg = karmaUtils.prepareConfig(config)
  config.set(cfg)
}
