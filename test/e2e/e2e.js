var initElasticApm = require('../..').init
var apmBase = require('../..').apmBase
var ApmServerMock = require('elastic-apm-js-core/test/utils/apm-server-mock.js')
function createApmBase(config) {
  // config.serverUrl = 'http://localhost:8200'
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

  elasticApm = initElasticApm(config)
  return elasticApm
}

module.exports = createApmBase
