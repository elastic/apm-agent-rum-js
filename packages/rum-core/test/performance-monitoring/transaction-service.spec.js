/**
 * MIT License
 *
 * Copyright (c) 2017-present, Elasticsearch BV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

var TransactionService = require('../../src/performance-monitoring/transaction-service')
var Transaction = require('../../src/performance-monitoring/transaction')

var Config = require('../../src/common/config-service')
var LoggingService = require('../../src/common/logging-service')

var resourceEntries = require('../fixtures/resource-entries')
var paintEntries = require('../fixtures/paint-entries')

describe('TransactionService', function () {
  var transactionService
  var config
  var logger
  beforeEach(function () {
    logger = new LoggingService()
    spyOn(logger, 'debug')

    config = new Config()
    config.init()
    transactionService = new TransactionService(logger, config)
  })

  it('should not start span when there is no current transaction', function () {
    transactionService.startSpan('test-span', 'test-span')
    expect(logger.debug).toHaveBeenCalled()
  })

  it('should call startSpan on current Transaction', function () {
    var tr = new Transaction('transaction', 'transaction')
    spyOn(tr, 'startSpan').and.callThrough()
    transactionService.setCurrentTransaction(tr)
    transactionService.startSpan('test-span', 'test-span', { test: 'passed' })
    expect(transactionService.getCurrentTransaction().startSpan).toHaveBeenCalledWith(
      'test-span',
      'test-span',
      { test: 'passed' }
    )
  })

  it('should not start span when performance monitoring is disabled', function () {
    config.set('active', false)
    transactionService = new TransactionService(logger, config)
    var tr = new Transaction('transaction', 'transaction')
    spyOn(tr, 'startSpan').and.callThrough()
    transactionService.setCurrentTransaction(tr)
    transactionService.startSpan('test-span', 'test-span')
    expect(transactionService.getCurrentTransaction().startSpan).not.toHaveBeenCalled()
  })

  it('should not start transaction when performance monitoring is disabled', function () {
    config.set('active', false)
    transactionService = new TransactionService(logger, config)

    var result = transactionService.startTransaction('transaction', 'transaction')

    expect(result).toBeUndefined()
  })

  it('should start transaction', function (done) {
    config.set('active', true)
    config.set('browserResponsivenessInterval', true)
    transactionService = new TransactionService(logger, config)

    var result = transactionService.startTransaction('transaction1', 'transaction')
    expect(result).toBeDefined()
    result = transactionService.startTransaction('transaction2', 'transaction')
    expect(result.name).toBe('transaction2')

    var origCb = result.onEnd
    result.onEnd = function () {
      var r = origCb.apply(this, arguments)
      done()
      return r
    }
    spyOn(result, 'onEnd').and.callThrough()
    transactionService.addTask('task1')
    var span = transactionService.startSpan('test', 'test')
    span.end()
    transactionService.detectFinish()
    expect(result.onEnd).not.toHaveBeenCalled()
    transactionService.removeTask('task1')
    transactionService.detectFinish()
    expect(result.onEnd).toHaveBeenCalled()
  })

  it('should create a zone transaction on the first span', function () {
    config.set('active', true)
    transactionService = new TransactionService(logger, config)

    transactionService.startSpan('testSpan', 'testtype')
    var trans = transactionService.getCurrentTransaction()
    expect(trans.name).toBe('ZoneTransaction')
    transactionService.startTransaction('transaction', 'transaction')
    expect(trans.name).toBe('transaction')
  })

  it('should not create transaction if performance is not enabled', function () {
    config.set('active', false)
    transactionService = new TransactionService(logger, config)
    var result = transactionService.createTransaction('test', 'test', config.get('performance'))
    expect(result).toBeUndefined()
  })

  it('should capture page load on first transaction', function (done) {
    // todo: can't test hard navigation metrics since karma runs tests inside an iframe
    config.set('active', true)
    config.set('capturePageLoad', true)
    transactionService = new TransactionService(logger, config)

    var tr1 = transactionService.startTransaction('transaction1', 'transaction')
    var tr1DoneFn = tr1.onEnd
    tr1.onEnd = function () {
      tr1DoneFn()
      expect(tr1.isHardNavigation).toBe(true)
      tr1.spans.forEach(function (t) {
        expect(t.duration()).toBeLessThan(5 * 60 * 1000)
        expect(t.duration()).toBeGreaterThan(-1)
      })
    }
    expect(tr1.isHardNavigation).toBe(false)
    tr1.isHardNavigation = true
    tr1.detectFinish()

    var tr2 = transactionService.startTransaction('transaction2', 'transaction')
    expect(tr2.isHardNavigation).toBe(false)
    var tr2DoneFn = tr2.onEnd
    tr2.onEnd = function () {
      tr2DoneFn()
      expect(tr2.isHardNavigation).toBe(false)
      done()
    }
    tr2.detectFinish()
  })

  it('should sendPageLoadMetrics', function (done) {
    config.set('active', true)
    config.set('capturePageLoad', true)

    transactionService = new TransactionService(logger, config)

    transactionService.subscribe(function () {
      expect(tr.isHardNavigation).toBe(true)
      expect(tr.marks.agent).toBeDefined()
      expect(tr.marks.navigationTiming).toBeDefined()
      done()
    })
    var tr = transactionService.sendPageLoadMetrics('test')

    transactionService = new TransactionService(logger, config)
    var zoneTr = new Transaction('ZoneTransaction', 'zone-transaction')
    transactionService.setCurrentTransaction(zoneTr)

    var pageLoadTr = transactionService.sendPageLoadMetrics('new tr')

    expect(pageLoadTr).toBe(zoneTr)
  })

  it('should consider initial page load name or use location.pathname', function () {
    transactionService = new TransactionService(logger, config)
    var tr

    tr = transactionService.sendPageLoadMetrics()
    expect(tr.name).toBe('Unknown')

    config.set('pageLoadTransactionName', 'page load name')
    tr = transactionService.sendPageLoadMetrics()
    expect(tr.name).toBe('page load name')

    tr = transactionService.sendPageLoadMetrics('hamid-test')
    expect(tr.name).toBe('hamid-test')
  })

  xit('should not add duplicate resource spans', function () {
    config.set('active', true)
    config.set('capturePageLoad', true)
    transactionService = new TransactionService(logger, config)

    var tr = transactionService.startTransaction('transaction', 'transaction')
    tr.isHardNavigation = true
    var queryString = '?' + Date.now()
    var testUrl = '/base/test/performance/transactionService.spec.js'

    if (window.performance.getEntriesByType) {
      if (window.fetch) {
        window.fetch(testUrl + queryString).then(function () {
          var entries = window.performance.getEntriesByType('resource').filter(function (entry) {
            return entry.name.indexOf(testUrl + queryString) > -1
          })
          expect(entries.length).toBe(1)

          tr.donePromise.then(function () {
            var filtered = tr.spans.filter(function (span) {
              return span.name.indexOf(testUrl) > -1
            })
            expect(filtered.length).toBe(1)
            console.log(filtered[0])
            fail()
          })

          var xhrTask = { source: 'XMLHttpRequest.send', XHR: { url: testUrl, method: 'GET' } }
          var spanName = xhrTask.XHR.method + ' ' + testUrl
          var span = transactionService.startSpan(spanName, 'external.http')
          span.end()
        })
      }
    }
  })

  it('should capture resources from navigation timing', function (done) {
    var _getEntriesByType = window.performance.getEntriesByType

    window.performance.getEntriesByType = function (type) {
      expect(['resource', 'paint']).toContain(type)
      if (type === 'resource') {
        return resourceEntries
      }
      return paintEntries
    }

    config.set('active', true)
    config.set('capturePageLoad', true)

    var transactionService = new TransactionService(logger, config)
    transactionService.subscribe(function () {
      expect(tr.isHardNavigation).toBe(true)
      window.performance.getEntriesByType = _getEntriesByType
      done()
    })

    var zoneTr = new Transaction('ZoneTransaction', 'zone-transaction')
    transactionService.setCurrentTransaction(zoneTr)
    var span = zoneTr.startSpan('GET http://example.com', 'external.http')
    span.end()
    var tr = transactionService.sendPageLoadMetrics('resource-test')
  })

  it('should ignore transactions that match the list', function () {
    config.set('ignoreTransactions', ['transaction1', /transaction2/])
    transactionService = new TransactionService(logger, config)

    expect(transactionService.shouldIgnoreTransaction('dont-ignore')).toBeFalsy()
    expect(transactionService.shouldIgnoreTransaction('transaction1')).toBeTruthy()
    expect(
      transactionService.shouldIgnoreTransaction('something-transaction2-something')
    ).toBeTruthy()

    config.set('ignoreTransactions', [])
  })

  it('should apply sampling to transactions', function () {
    var transactionSampleRate = config.get('transactionSampleRate')
    expect(transactionSampleRate).toBe(1.0)
    var tr = transactionService.startTransaction('test', 'test')
    expect(tr.sampled).toBe(true)
    var span = transactionService.startSpan('testspan', 'test')
    expect(span.sampled).toBe(true)

    config.set('transactionSampleRate', 0)
    tr = transactionService.startTransaction('test', 'test')
    expect(tr.sampled).toBe(false)
    span = transactionService.startSpan('testspan', 'test')
    expect(span.sampled).toBe(false)
  })

  it('should consider page load traceId and spanId', function (done) {
    config.setConfig({
      pageLoadTraceId: 'test-trace-id',
      pageLoadSpanId: 'test-span-id',
      pageLoadSampled: true
    })

    window.performance.getEntriesByType = function (type) {
      expect(['resource', 'paint']).toContain(type)
      if (type === 'resource') {
        return resourceEntries
      }
      return {}
    }

    transactionService = new TransactionService(logger, config)
    var tr = transactionService.sendPageLoadMetrics()
    expect(tr.traceId).toBe('test-trace-id')
    expect(tr.sampled).toBe(true)

    setTimeout(() => {
      var spans = tr.spans.filter(function (span) {
        return span.pageResponse
      })
      if (spans.length > 0) {
        expect(spans[0].id).toBe('test-span-id')
        expect(spans.length).toBe(1)
        expect(spans[0].traceId).toBe('test-trace-id')
        expect(spans[0].sampled).toBe(true)
        expect(spans[0].id).toBe('test-span-id')
        expect(spans[0].name).toBe('Requesting and receiving the document')
      }
      done()
    })
  })
})
