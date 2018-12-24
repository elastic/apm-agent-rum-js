const testUtils = require('elastic-apm-js-core/dev-utils/test.js')

const env = testUtils.getTestEnvironmentVariables()
let serverUrl = 'http://localhost:8200'
if (env.serverUrl) {
  serverUrl = env.serverUrl
}

const config = {
  agentConfig: {
    serverUrl,
    serviceName: 'apm-agent-js-base/test'
  },
  useMocks: false,
  mockApmServer: false,
  serverUrl,
  env: env
}

// if (env.sauceLabs) {
//   config.useMocks = true
// }

module.exports = config
