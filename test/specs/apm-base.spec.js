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

  it('should provider public api', function () {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({})
    apmBase.setInitialPageLoadName('test')
    var trService = serviceFactory.getService('TransactionService')
    expect(trService.initialPageLoadName).toBe('test')

    var tr = apmBase.startTransaction('test-transaction', 'test-type')
    expect(tr).toBeDefined()
    expect(tr.name).toBe('test-transaction')
    expect(tr.type).toBe('test-type')

    spyOn(tr, 'startSpan').and.callThrough()
    apmBase.startSpan('test-span', 'test-type')
    expect(tr.startSpan).toHaveBeenCalledWith('test-span', 'test-type')

    expect(apmBase.getCurrentTransaction()).toBe(tr)
    expect(apmBase.getTransactionService()).toBe(trService)

    var filter = function (payload) {}
    apmBase.addFilter(filter)
    var configService = serviceFactory.getService('ConfigService')
    expect(configService.filters.length).toBe(1)
    expect(configService.filters[0]).toBe(filter)

    apmBase.config({testConfig: 'test'})
    expect(configService.config.testConfig).toBe('test')
  })
})
