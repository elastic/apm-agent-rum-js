var ApmBase = require('../../src/apm-base.js')
describe('ApmBase', function () {
  it('should init ApmBase', function (done) {
    var apmBase = new ApmBase()
    apmBase.init({
      apiOrigin: 'http://localhost:8200',
      appName: 'apm-agent-js-base-test'
    })
    if (window.globalConfigs && window.globalConfigs.useMocks) {
      var apmServer = apmBase.serviceFactory.getService('ApmServer')
      apmServer._makeHttpRequest = function () {
        return Promise.resolve()
      }
    }
    var errorLogging = apmBase.serviceFactory.getService('ErrorLogging')
    try {
      throw new Error('ApmBase test error')
    } catch(error) {
      var promise = errorLogging.logErrorEvent({error: error})
      promise.then(function () {
        done()
      })
    }
  })
})
