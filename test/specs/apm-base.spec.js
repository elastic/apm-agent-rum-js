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
    var configService = serviceFactory.getService('ConfigService')
    configService.setConfig({
      sendPageLoadTransaction: true
    })

    apmBase._sendPageLoadMetrics()
    var tr = trService.getCurrentTransaction()
    expect(tr.name).toBe('Unknown')
    expect(tr.type).toBe('page-load')
    spyOn(tr, 'detectFinish')
    window.addEventListener('load', function () {
      setTimeout(() => {
        expect(tr.detectFinish).toHaveBeenCalled()
        apmBase.setInitialPageLoadName('new page load')
        expect(document.readyState).toBe('complete')

        apmBase._sendPageLoadMetrics()
        tr = trService.getCurrentTransaction()
        expect(tr.name).toBe('new page load')
        expect(tr.type).toBe('page-load')
        spyOn(tr, 'detectFinish')
        setTimeout(() => {
          expect(tr.detectFinish).toHaveBeenCalled()
          done()
        })
      })
    })
  })

  it('should provide the public api', function () {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({})
    apmBase.setInitialPageLoadName('test')
    var trService = serviceFactory.getService('TransactionService')
    var configService = serviceFactory.getService('ConfigService')
    var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')

    expect(configService.get('pageLoadTransactionName')).toBe('test')

    var tr = apmBase.startTransaction('test-transaction', 'test-type')
    expect(tr).toBeDefined()
    expect(tr.name).toBe('test-transaction')
    expect(tr.type).toBe('test-type')

    spyOn(tr, 'startSpan').and.callThrough()
    apmBase.startSpan('test-span', 'test-type')
    expect(tr.startSpan).toHaveBeenCalledWith('test-span', 'test-type')

    expect(apmBase.getCurrentTransaction()).toBe(tr)
    expect(apmBase.getTransactionService()).toBe(trService)

    var filter = function (payload) { }
    apmBase.addFilter(filter)
    var configService = serviceFactory.getService('ConfigService')
    expect(configService.filters.length).toBe(1)
    expect(configService.filters[0]).toBe(filter)

    apmBase.config({ testConfig: 'test' })
    expect(configService.config.testConfig).toBe('test')
    performanceMonitoring.cancelPatchSub()
  })

  it('should instrument xhr', function (done) {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({})
    var tr = apmBase.startTransaction('test-transaction', 'test-type')
    expect(tr).toBeDefined()
    var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')

    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener("load", function () {
      setTimeout(() => {
        expect(tr.spans.length).toBe(1)
        expect(tr.spans[0].name).toBe('GET /')
        performanceMonitoring.cancelPatchSub()
        done()
      });
    });

    req.send()
  })

  it('should instrument xhr when no transaction was started', function (done) {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({ capturePageLoad: false })
    var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
    var transactionService = serviceFactory.getService('TransactionService')
    transactionService.currentTransaction = undefined

    var tr
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener("load", function () {
      setTimeout(() => {
        expect(tr.spans.length).toBe(1)
        expect(tr.spans[0].name).toBe('GET /')
        performanceMonitoring.cancelPatchSub()
        done()
      });
    });
    req.send()
    tr = apmBase.getCurrentTransaction()
    expect(tr).toBeDefined()
    expect(tr.name).toBe('ZoneTransaction')
  })

  it('should instrument xhr when not active', function (done) {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({ capturePageLoad: false, active: false })
    var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')

    var tr

    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener("load", function () {
      setTimeout(() => {
        performanceMonitoring.cancelPatchSub()
        done()
      });
    });

    req.send()
    tr = apmBase.getCurrentTransaction()
    expect(tr).toBeUndefined()
  })


  it('should instrument sync xhr', function (done) {
    var apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({})
    var tr = apmBase.startTransaction('test-transaction', 'test-type')
    var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')

    expect(tr).toBeDefined()

    var req = new window.XMLHttpRequest()
    req.open('GET', '/', false)
    req.addEventListener("load", function () {
      done()
    });

    req.send()

    expect(tr.spans.length).toBe(1)
    expect(tr.spans[0].name).toBe('GET /')
    performanceMonitoring.cancelPatchSub()
  })
})
