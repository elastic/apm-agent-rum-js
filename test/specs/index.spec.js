var apmBase = require('../../src/index.js').apmBase
var apmCore = require('elastic-apm-js-core')

describe('index', function () {
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

    apmBase.setUserContext({usertest: 'usertest',id: 'userId',username: 'username',email: 'email'})
    apmBase.setCustomContext({testContext: 'testContext'})

    try {
      throw new Error('ApmBase test error')
    } catch(error) {
      var promise = apmBase.captureError(error)
      if (apmCore.utils.isPlatformSupported()) {
        promise.then(function () {
          done()
        })
      } else {
        expect(promise).toBeUndefined()
        done()
      }
    }
  })
})
