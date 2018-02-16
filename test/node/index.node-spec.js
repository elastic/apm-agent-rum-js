var apmBase = require('../../src/index.js').apmBase
var testConfig = require('../../test.config')
describe('ApmBase', function () {
  it('should not init ApmBase', function () {
    apmBase.init({
      serverUrl: testConfig.serverUrl,
      serviceName: 'apm-agent-js-base-test'
    })
    try {
      throw new Error('ApmBase test error')
    } catch(error) {
      var result = apmBase.captureError(error)
      expect(result).toBeUndefined()
    }
  })
})
