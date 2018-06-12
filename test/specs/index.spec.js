var apmBase = require('../../src/index.js').apmBase
var apmCore = require('elastic-apm-js-core')

describe('index', function () {
  var originalTimeout

  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
  })

  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it('should init ApmBase', function (done) {
    var apmServer = apmBase.serviceFactory.getService('ApmServer')
    if (window.globalConfigs && window.globalConfigs.useMocks) {
      apmServer._makeHttpRequest = function () {
        return Promise.resolve()
      }
    }

    spyOn(apmServer, 'sendErrors').and.callThrough()
    spyOn(apmServer, '_postJson').and.callThrough()

    try {
      throw new Error('ApmBase test error')
    } catch(error) {
      apmBase.captureError(error)
      if (apmCore.utils.isPlatformSupported()) {
        expect(apmServer.errorQueue).toBeUndefined()
        expect(apmServer.sendErrors).not.toHaveBeenCalled()
        expect(apmServer._postJson).not.toHaveBeenCalled()
      }
    }
    apmBase.init({
      serverUrl: window.globalConfigs.serverUrl,
      serviceName: 'apm-agent-js-base-test',
      flushInterval: 100
    })

    apmBase.setUserContext({usertest: 'usertest',id: 'userId',username: 'username',email: 'email'})
    apmBase.setCustomContext({testContext: 'testContext'})
    apmBase.setTags({'testTagKey': 'testTagValue'})

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
            // Wait before ending the test to make sure the result are processed by the agent.
            // Karma changes the iframe src when the tests finish and Chrome would cancel any
            // request that was made by an iframe that got removed or had it's src changed
            // and the agent would recieved http status 0
            setTimeout(() => {
              done()
            }, 100);
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
