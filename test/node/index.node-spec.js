var apmBase = require('../../src/index.js').apmBase
describe('ApmBase', function () {
  it('should not init ApmBase', function () {
    apmBase.init({
      serverUrl: 'http://localhost:8200',
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
