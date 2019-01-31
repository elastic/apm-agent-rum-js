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

var ApmServer = require('../../src/common/apm-server')
var Transaction = require('../../src/performance-monitoring/transaction')
// var performanceMonitoring = require('../../src/performance-monitoring/performance-monitoring')
var createServiceFactory = require('..').createServiceFactory

function generateTransaction (count) {
  var result = []
  for (var i = 0; i < count; i++) {
    var tr = new Transaction('transaction #' + i, 'transaction', {})
    tr.id = 'transaction-id-' + i
    tr.traceId = 'trace-id-' + i
    var span1 = tr.startSpan('name', 'type', { sync: false })
    span1.end()
    span1.id = 'span-id-' + i + '-1'
    tr.end()
    tr.ensureContext()
    tr.context.page.referer = 'referer'
    tr.context.page.url = 'url'
    tr._start = 10
    tr._end = 1000

    span1._start = 20
    span1._end = 30

    result.push(tr)
  }
  return result
}

function generateErrors (count) {
  var result = []
  for (var i = 0; i < count; i++) {
    result.push(new Error('error #' + i))
  }
  return result
}
describe('ApmServer', function () {
  var serviceFactory
  var apmServer
  var configService
  var loggingService
  var originalTimeout
  var performanceMonitoring
  beforeEach(function () {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000

    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    loggingService = serviceFactory.getService('LoggingService')
    apmServer = serviceFactory.getService('ApmServer')
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  })

  afterEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it('should not send transctions when the list is empty', function () {
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendTransactions([])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should report http errors', function (done) {
    var apmServer = new ApmServer(configService, loggingService)
    configService.setConfig({
      serverUrl: 'http://localhost:54321',
      serviceName: 'test-service'
    })
    var result = apmServer.sendTransactions([{ test: 'test' }])
    expect(result).toBeDefined()
    result.then(
      function () {
        fail('Request should have failed!')
      },
      function (reason) {
        expect(reason).toBeDefined()
        done()
      }
    )
  })

  it('should check config validity before making request to the server', function () {
    spyOn(apmServer, '_postJson')
    spyOn(loggingService, 'warn')
    spyOn(loggingService, 'debug')
    expect(configService.isValid()).toBe(false)

    var result = apmServer.sendTransactions([{ test: 'test' }])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalled()
    expect(loggingService.debug).not.toHaveBeenCalled()

    loggingService.warn.calls.reset()
    result = apmServer.sendErrors([{ test: 'test' }])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
    expect(loggingService.warn).not.toHaveBeenCalled()
    expect(loggingService.debug).toHaveBeenCalled()

    configService.setConfig({ serviceName: 'serviceName' })
    expect(configService.isValid()).toBe(true)
    apmServer.sendTransactions([{ test: 'test' }])
    expect(apmServer._postJson).toHaveBeenCalled()
    expect(loggingService.warn).not.toHaveBeenCalled()
  })

  xit('should queue items', function () {
    spyOn(loggingService, 'warn').and.callThrough()
    configService.setConfig({
      serviceName: 'serviceName',
      throttlingRequestLimit: 1
    })
    expect(configService.isValid()).toBe(true)
    spyOn(apmServer, '_postJson').and.callThrough()
    spyOn(apmServer, '_makeHttpRequest').and.callThrough()
    apmServer.init()
    spyOn(apmServer, '_throttledMakeRequest').and.callThrough()

    var trs = generateTransaction(19)
    trs.forEach(apmServer.addTransaction.bind(apmServer))
    expect(apmServer.transactionQueue.items.length).toBe(19)
    expect(apmServer._postJson).not.toHaveBeenCalled()
    trs = generateTransaction(1)
    trs.forEach(apmServer.addTransaction.bind(apmServer))

    expect(apmServer._postJson).toHaveBeenCalled()
    expect(apmServer._makeHttpRequest).toHaveBeenCalled()
    expect(apmServer.transactionQueue.items.length).toBe(0)

    apmServer._makeHttpRequest.calls.reset()
    loggingService.warn.calls.reset()
    trs = generateTransaction(20)
    trs.forEach(apmServer.addTransaction.bind(apmServer))
    expect(apmServer._throttledMakeRequest).toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalledWith(
      'ElasticAPM: Dropped request to http://localhost:8200/v1/client-side/transactions due to throttling!'
    )
    expect(apmServer._makeHttpRequest).not.toHaveBeenCalled()
  })

  it('should init queue if not initialized before', function (done) {
    configService.setConfig({ flushInterval: 200 })
    spyOn(apmServer, 'sendErrors')
    spyOn(apmServer, 'sendTransactions')

    expect(apmServer.errorQueue).toBeUndefined()
    apmServer.addError({})
    expect(apmServer.errorQueue).toBeDefined()

    expect(apmServer.transactionQueue).toBeUndefined()
    apmServer.addTransaction({})
    expect(apmServer.transactionQueue).toBeDefined()

    expect(apmServer.sendErrors).not.toHaveBeenCalled()
    expect(apmServer.sendTransactions).not.toHaveBeenCalled()

    apmServer.init()

    expect(apmServer.sendErrors).toHaveBeenCalled()
    expect(apmServer.sendTransactions).toHaveBeenCalled()

    apmServer.sendErrors.calls.reset()
    apmServer.sendTransactions.calls.reset()

    apmServer.addTransaction({})
    apmServer.addError({})

    apmServer.init()

    expect(apmServer.sendErrors).not.toHaveBeenCalled()
    expect(apmServer.sendTransactions).not.toHaveBeenCalled()

    setTimeout(() => {
      expect(apmServer.sendErrors).toHaveBeenCalled()
      expect(apmServer.sendTransactions).toHaveBeenCalled()
      done()
    }, 300)
  })

  it('should report http errors for queued errors', function (done) {
    spyOn(loggingService, 'warn').and.callThrough()
    var apmServer = new ApmServer(configService, loggingService)
    var _sendErrors = apmServer.sendErrors
    apmServer.sendErrors = function () {
      var result = _sendErrors.apply(apmServer, arguments)
      result.then(
        function () {
          fail('Request should have failed!')
        },
        function () {
          setTimeout(() => {
            expect(loggingService.warn).toHaveBeenCalledWith(
              'Failed sending errors!',
              jasmine.objectContaining({})
            )
            done()
          })
        }
      )
      return result
    }
    configService.setConfig({
      serverUrl: 'http://localhost:54321',
      serviceName: 'test-service'
    })
    expect(configService.isValid()).toBe(true)
    apmServer.addError({ test: 'test' })

    expect(loggingService.warn).not.toHaveBeenCalled()
    apmServer.errorQueue.flush()
  })

  it('should report http errors for queued transactions', function (done) {
    spyOn(loggingService, 'warn').and.callThrough()
    var apmServer = new ApmServer(configService, loggingService)
    var _sendTransactions = apmServer.sendTransactions
    apmServer.sendTransactions = function () {
      var result = _sendTransactions.apply(apmServer, arguments)
      result.then(
        function () {
          fail('Request should have failed!')
        },
        function () {
          setTimeout(() => {
            expect(loggingService.warn).toHaveBeenCalledWith(
              'Failed sending transactions!',
              jasmine.objectContaining({})
            )
            done()
          })
        }
      )
      return result
    }
    configService.setConfig({
      serverUrl: 'http://localhost:54321',
      serviceName: 'test-service'
    })
    expect(configService.isValid()).toBe(true)
    apmServer.addTransaction({ test: 'test' })

    expect(loggingService.warn).not.toHaveBeenCalled()
    apmServer.transactionQueue.flush()
  })

  it('should throttle adding to the error queue', function (done) {
    configService.setConfig({
      serviceName: 'serviceName',
      flushInterval: 100,
      errorThrottleLimit: 5,
      errorThrottleInterval: 200
    })
    expect(configService.isValid()).toBe(true)
    spyOn(apmServer, 'sendErrors')
    spyOn(loggingService, 'warn').and.callThrough()

    var errors = generateErrors(6)
    errors.forEach(apmServer.addError.bind(apmServer))
    expect(apmServer.errorQueue.items.length).toBe(5)
    expect(apmServer.sendErrors).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalledWith('Dropped error due to throttling!')

    setTimeout(() => {
      expect(apmServer.errorQueue.items.length).toBe(0)
      expect(apmServer.sendErrors).toHaveBeenCalledWith(
        jasmine.objectContaining(errors.slice(0, 4))
      )
      errors.forEach(apmServer.addError.bind(apmServer))
      expect(apmServer.errorQueue.items.length).toBe(5)
      apmServer.errorQueue._clear()
      done()
    }, 300)
  })

  it('should throttle adding to the transaction queue', function (done) {
    configService.setConfig({
      serviceName: 'serviceName',
      flushInterval: 100,
      transactionThrottleLimit: 5,
      transactionThrottleInterval: 200
    })
    expect(configService.isValid()).toBe(true)
    spyOn(apmServer, 'sendTransactions')
    spyOn(loggingService, 'warn').and.callThrough()

    var transactions = generateTransaction(6)
    transactions.forEach(apmServer.addTransaction.bind(apmServer))
    expect(apmServer.transactionQueue.items.length).toBe(5)
    expect(apmServer.sendTransactions).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalledWith('Dropped transaction due to throttling!')

    setTimeout(() => {
      expect(apmServer.transactionQueue.items.length).toBe(0)
      expect(apmServer.sendTransactions).toHaveBeenCalledWith(
        jasmine.objectContaining(transactions.slice(0, 4))
      )
      transactions.forEach(apmServer.addTransaction.bind(apmServer))
      expect(apmServer.transactionQueue.items.length).toBe(5)
      apmServer.transactionQueue._clear()
      done()
    }, 300)
  })

  it('should check isActive', function () {
    configService.setConfig({
      active: false
    })
    expect(configService.isActive()).toBe(false)

    expect(apmServer.transactionQueue).toBeUndefined()
    expect(apmServer.errorQueue).toBeUndefined()

    apmServer.addTransaction({ test: 'test' })
    apmServer.addError({ test: 'test' })

    expect(apmServer.transactionQueue).toBeUndefined()
    expect(apmServer.errorQueue).toBeUndefined()
  })

  it('should ignore undefined payload', function () {
    configService.setConfig({
      serviceName: 'serviceName'
    })
    configService.addFilter(function () {})
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendErrors([{ test: 'test' }])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
    result = apmServer.sendTransactions([{ test: 'test' }])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should ndjson transactions', function () {
    var trs = generateTransaction(3)
    trs = performanceMonitoring.convertTransactionsToServerModel(trs)
    var result = apmServer.ndjsonTransactions(trs)
    var expected = [
      '{"transaction":{"id":"transaction-id-0","trace_id":"trace-id-0","name":"transaction #0","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-0-1","transaction_id":"transaction-id-0","parent_id":"transaction-id-0","trace_id":"trace-id-0","name":"name","type":"type","subType":"NA","action":"NA","sync":false,"start":10,"duration":10}}\n',
      '{"transaction":{"id":"transaction-id-1","trace_id":"trace-id-1","name":"transaction #1","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-1-1","transaction_id":"transaction-id-1","parent_id":"transaction-id-1","trace_id":"trace-id-1","name":"name","type":"type","subType":"NA","action":"NA","sync":false,"start":10,"duration":10}}\n',
      '{"transaction":{"id":"transaction-id-2","trace_id":"trace-id-2","name":"transaction #2","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-2-1","transaction_id":"transaction-id-2","parent_id":"transaction-id-2","trace_id":"trace-id-2","name":"name","type":"type","subType":"NA","action":"NA","sync":false,"start":10,"duration":10}}\n'
    ]
    expect(result).toEqual(expected)
  })
})
