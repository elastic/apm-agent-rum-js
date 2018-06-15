var testUtils = require('elastic-apm-js-core/dev-utils/test.js')

var env = testUtils.getTestEnvironmentVariables()
var serverUrl = 'http://localhost:8200'
if (env.serverUrl) {
  serverUrl = env.serverUrl
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
