var apmBase = require('../../src/index.js').apmBase
describe('ApmBase', function () {
  it('should init ApmBase', function (done) {
    apmBase.init({
      serverUrl: 'http://localhost:8200',
      serviceName: 'apm-agent-js-base-test'
    })
    if (window.globalConfigs && window.globalConfigs.useMocks) {
      var apmServer = apmBase.serviceFactory.getService('ApmServer')
      apmServer._makeHttpRequest = function () {
        return Promise.resolve()
      }
    }
    try {
      throw new Error('ApmBase test error')
    } catch(error) {
      var promise = apmBase.captureError(error)
      promise.then(function () {
        done()
      })
    }
  })
})
