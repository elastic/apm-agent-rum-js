var ApmBase = require('../../src/apm-base')
var apmCore = require('elastic-apm-js-core')
var enabled = require('../../src/bootstrap')()

describe('ApmBase', function () {
  var serviceFactory
  beforeEach(function () {
    serviceFactory = apmCore.createServiceFactory()
  })

  it('should send page load metrics before or after load event', function (done) {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    var trService = serviceFactory.getService('TransactionService')
    spyOn(trService, 'sendPageLoadMetrics')
    
    apmBase._sendPageLoadMetrics()
    window.addEventListener('load', function () {
      setTimeout(() => {
        expect(trService.sendPageLoadMetrics).toHaveBeenCalled()
        trService.sendPageLoadMetrics.calls.reset()
        expect(trService.sendPageLoadMetrics).not.toHaveBeenCalled()
        expect(document.readyState).toBe('complete')
        apmBase._sendPageLoadMetrics()
        setTimeout(() => {
          expect(trService.sendPageLoadMetrics).toHaveBeenCalled()
          done()
        })
      })
    })
  })
})
