var testUtils = require('elastic-apm-js-core/dev-utils/test.js')

var env = testUtils.getTestEnvironmentVariables()
var serverUrl = 'http://localhost:8200'
if (env.isTravis) {
  serverUrl = 'http://localhost:8001'
}

var config = {
  agentConfig: {
    serverUrl: serverUrl,
    serviceName: 'apm-agent-js-base/test'
  },
  useMocks: false,
  mockApmServer: false,
  serverUrl: serverUrl,
  env: env
}

// if (env.sauceLabs) {
//   config.useMocks = true
// }

module.exports = config
