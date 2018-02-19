var karmaUtils = require('elastic-apm-js-core/dev-utils/karma.js')
var testUtils = require('elastic-apm-js-core/dev-utils/test.js')

module.exports = function (config) {
  // temporarily set firefox version to 44 due to apm-server#676 issue
  karmaUtils.baseConfig.customLaunchers.SL_FIREFOX.version = '44'

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
