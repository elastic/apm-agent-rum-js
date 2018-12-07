var elasticApm = require('../..')
var apmBase = elasticApm.apmBase

var ApmServerMock = require('elastic-apm-js-core/test/utils/apm-server-mock.js')
function createApmBase (config) {
  /**
   * globalConfigs - environment variable injected by webpack
   * during e2e build process
   */
  // eslint-disable-next-line
  var envConfig = globalConfigs
  if (!window.globalConfigs) {
    window.globalConfigs = envConfig
  }
  var gc = window.globalConfigs
  console.log(gc)
  var apmServer
  apmServer = apmBase.serviceFactory.getService('ApmServer')
  if (gc.serverUrl) {
    config.serverUrl = gc.serverUrl
  }
  var serverMock = new ApmServerMock(apmServer, gc.useMocks)
  apmBase.serviceFactory.registerServiceInstance('ApmServer', serverMock)

  return elasticApm.init(config)
}

module.exports = createApmBase
