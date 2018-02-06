var apmBase = require('../../src/index.js').apmBase
var apmCore = require('elastic-apm-js-core')

describe('index', function () {
  it('should init ApmBase', function (done) {
    apmBase.init({
      serverUrl: 'http://localhost:8200',
      serviceName: 'apm-agent-js-base-test',
      flushInterval: 100
    })
    var apmServer = apmBase.serviceFactory.getService('ApmServer')
    if (window.globalConfigs && window.globalConfigs.useMocks) {
      apmServer._makeHttpRequest = function () {
        return Promise.resolve()
      }
    }

    spyOn(apmServer, 'sendErrors').and.callThrough()

    apmBase.setUserContext({usertest: 'usertest',id: 'userId',username: 'username',email: 'email'})
    apmBase.setCustomContext({testContext: 'testContext'})

    try {
      throw new Error('ApmBase test error')
    } catch(error) {
      apmBase.captureError(error)
      expect(apmServer.sendErrors).not.toHaveBeenCalled()
      if (apmCore.utils.isPlatformSupported()) {
        expect(apmServer.errorQueue.items.length).toBe(1)
        setTimeout(() => {
          expect(apmServer.sendErrors).toHaveBeenCalled()
          var callData = apmServer.sendErrors.calls.mostRecent()
          callData.returnValue.then(() => {
            done()
          }, (reason) => {
            fail('Failed sending error:', reason)
          })
        }, 200)
      } else {
        done()
      }
    }
  })
})
