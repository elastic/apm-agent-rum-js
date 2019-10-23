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

import ApmServer from '../../src/common/apm-server'
import Transaction from '../../src/performance-monitoring/transaction'
import {
  getGlobalConfig,
  isVersionInRange
} from '../../../../dev-utils/test-config'
import { captureBreakdown } from '../../src/performance-monitoring/breakdown'
import { createServiceFactory } from '../'

const { agentConfig, testConfig } = getGlobalConfig('rum-core')
import { LOCAL_CONFIG_KEY } from '../../src/common/constants'

function generateTransaction(count, breakdown = false) {
  var result = []
  for (var i = 0; i < count; i++) {
    var tr = new Transaction('transaction #' + i, 'transaction', {})
    tr.id = 'transaction-id-' + i
    tr.traceId = 'trace-id-' + i
    var span1 = tr.startSpan('name', 'type', { sync: false })
    span1.end()
    span1.id = 'span-id-' + i + '-1'
    tr.end()
    tr.context.page.referer = 'referer'
    tr.context.page.url = 'url'
    tr._start = 10
    tr._end = 1000
    span1._start = 20
    span1._end = 30
    if (breakdown) {
      tr.sampled = true
      tr.selfTime = tr.duration() - span1.duration()
      tr.breakdownTimings = captureBreakdown(tr)
    }

    result.push(tr)
  }
  return result
}

function generateErrors(count) {
  var result = []
  for (var i = 0; i < count; i++) {
    result.push(new Error('error #' + i))
  }
  return result
}
describe('ApmServer', function() {
  var serviceFactory
  var apmServer
  var configService
  var loggingService
  var originalTimeout
  var performanceMonitoring

  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000

    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    configService.setConfig(agentConfig)
    loggingService = serviceFactory.getService('LoggingService')
    apmServer = serviceFactory.getService('ApmServer')
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  })

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it('should not send transctions when the list is empty', function() {
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendTransactions([])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should report http errors', function(done) {
    var apmServer = new ApmServer(configService, loggingService)
    configService.setConfig({
      serverUrl: 'http://localhost:54321',
      serviceName: 'test-service'
    })
    var result = apmServer.sendTransactions([{ test: 'test' }])
    expect(result).toBeDefined()
    result.then(
      function() {
        fail('Request should have failed!')
      },
      function(reason) {
        expect(reason).toBeDefined()
        done()
      }
    )
  })

  xit('should queue items', function() {
    spyOn(loggingService, 'warn').and.callThrough()
    configService.setConfig({
      serviceName: 'serviceName',
      throttlingRequestLimit: 1
    })
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
      // eslint-disable-next-line
      'ElasticAPM: Dropped request to http://localhost:8200/v1/client-side/transactions due to throttling!'
    )
    expect(apmServer._makeHttpRequest).not.toHaveBeenCalled()
  })

  it('should init queue if not initialized before', function(done) {
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

  it('should capture errors logs from apm-server', done => {
    spyOn(loggingService, 'warn').and.callFake((failedMsg, error) => {
      expect(failedMsg).toEqual('Failed sending transactions!')
      /**
       * APM server error varies by stack, So we check for
       * explicit characters instead of whole message
       */
      expect(error.message).toContain(
        'validating JSON document against schema: I[#] S[#] doesn\'t validate with "transaction#'
      )
      expect(error.message).toContain('missing properties: "trace_id"')
      done()
    })
    const apmServer = new ApmServer(configService, loggingService)

    apmServer.addTransaction({
      id: '21312',
      span_count: 0,
      duration: 100,
      type: 'app'
    })
    apmServer.transactionQueue.flush()
  })

  it('should log parse error when response is invalid', done => {
    spyOn(loggingService, 'debug').and.callFake(message => {
      expect(message).toEqual('Error parsing response from APM server')
      done()
    })
    const apmServer = new ApmServer(configService, loggingService)

    const error = apmServer._constructError({
      url: 'http://localhost:54321',
      status: 0,
      responseText: 'abc'
    })

    expect(error.message).toEqual('http://localhost:54321 HTTP status: 0')
  })

  it('should report http errors for queued errors', function(done) {
    spyOn(loggingService, 'warn')
    var apmServer = new ApmServer(configService, loggingService)
    var _sendErrors = apmServer.sendErrors
    apmServer.sendErrors = function() {
      var result = _sendErrors.apply(apmServer, arguments)
      result.then(
        function() {
          fail('Request should have failed!')
        },
        function() {
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
    apmServer.addError({ test: 'test' })

    expect(loggingService.warn).not.toHaveBeenCalled()
    apmServer.errorQueue.flush()
  })

  it('should report http errors for queued transactions', function(done) {
    spyOn(loggingService, 'warn')
    var apmServer = new ApmServer(configService, loggingService)
    var _sendTransactions = apmServer.sendTransactions
    apmServer.sendTransactions = function() {
      var result = _sendTransactions.apply(apmServer, arguments)
      result.then(
        function() {
          fail('Request should have failed!')
        },
        function() {
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
    apmServer.addTransaction({ test: 'test' })

    expect(loggingService.warn).not.toHaveBeenCalled()
    apmServer.transactionQueue.flush()
  })

  it('should throttle adding to the error queue', function(done) {
    configService.setConfig({
      serviceName: 'serviceName',
      flushInterval: 100,
      errorThrottleLimit: 5,
      errorThrottleInterval: 200
    })
    spyOn(apmServer, 'sendErrors')
    spyOn(loggingService, 'warn')

    var errors = generateErrors(6)
    errors.forEach(apmServer.addError.bind(apmServer))
    expect(apmServer.errorQueue.items.length).toBe(5)
    expect(apmServer.sendErrors).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalledWith(
      'Dropped error due to throttling!'
    )

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

  it('should throttle adding to the transaction queue', function(done) {
    configService.setConfig({
      serviceName: 'serviceName',
      flushInterval: 100,
      transactionThrottleLimit: 5,
      transactionThrottleInterval: 200
    })
    spyOn(apmServer, 'sendTransactions')
    spyOn(loggingService, 'warn')

    var transactions = generateTransaction(6)
    transactions.forEach(apmServer.addTransaction.bind(apmServer))
    expect(apmServer.transactionQueue.items.length).toBe(5)
    expect(apmServer.sendTransactions).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalledWith(
      'Dropped transaction due to throttling!'
    )

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

  it('should ignore undefined payload', function() {
    spyOn(loggingService, 'warn')
    configService.setConfig({
      serviceName: 'serviceName'
    })
    configService.addFilter(function() {})
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendErrors([{ test: 'test' }])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
    result = apmServer.sendTransactions([{ test: 'test' }])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should set metadata from config along with defaults', () => {
    configService.setConfig({
      serviceName: 'test',
      serviceVersion: '0.0.1',
      environment: 'staging'
    })

    configService.setVersion('4.0.1')

    /** To catch agent version mismatch during release */
    const { service } = apmServer.createMetaData()
    expect(service).toEqual({
      name: 'test',
      version: '0.0.1',
      environment: 'staging',
      agent: {
        name: 'js-base',
        version: '4.0.1'
      },
      language: { name: 'javascript' }
    })
  })

  it('should ndjson transactions', function() {
    var trs = generateTransaction(3)
    trs = performanceMonitoring.convertTransactionsToServerModel(trs)
    var result = apmServer.ndjsonTransactions(trs)
    /* eslint-disable max-len */
    var expected = [
      '{"transaction":{"id":"transaction-id-0","trace_id":"trace-id-0","name":"transaction #0","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-0-1","transaction_id":"transaction-id-0","parent_id":"transaction-id-0","trace_id":"trace-id-0","name":"name","type":"type","sync":false,"start":10,"duration":10}}\n',
      '{"transaction":{"id":"transaction-id-1","trace_id":"trace-id-1","name":"transaction #1","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-1-1","transaction_id":"transaction-id-1","parent_id":"transaction-id-1","trace_id":"trace-id-1","name":"name","type":"type","sync":false,"start":10,"duration":10}}\n',
      '{"transaction":{"id":"transaction-id-2","trace_id":"trace-id-2","name":"transaction #2","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-2-1","transaction_id":"transaction-id-2","parent_id":"transaction-id-2","trace_id":"trace-id-2","name":"name","type":"type","sync":false,"start":10,"duration":10}}\n'
    ]
    expect(result).toEqual(expected)
  })

  it('should ndjson metricsets along with transactions', function() {
    const tr = generateTransaction(1, true)
    jasmine.clock().install()
    jasmine.clock().mockDate(new Date(0))
    const payload = performanceMonitoring.convertTransactionsToServerModel(tr)
    const result = apmServer.ndjsonTransactions(payload)
    /* eslint-disable max-len */
    const expected = [
      '{"transaction":{"id":"transaction-id-0","trace_id":"trace-id-0","name":"transaction #0","type":"transaction","duration":990,"context":{"page":{"referer":"referer","url":"url"}},"span_count":{"started":1},"sampled":true}}\n',
      '{"span":{"id":"span-id-0-1","transaction_id":"transaction-id-0","parent_id":"transaction-id-0","trace_id":"trace-id-0","name":"name","type":"type","sync":false,"start":10,"duration":10}}\n',
      '{"metricset":{"timestamp":0,"transaction":{"name":"transaction #0","type":"transaction"},"samples":{"transaction.duration.count":{"value":1},"transaction.duration.sum.us":{"value":990},"transaction.breakdown.count":{"value":1}}}}\n',
      '{"metricset":{"timestamp":0,"transaction":{"name":"transaction #0","type":"transaction"},"span":{"type":"app"},"samples":{"span.self_time.count":{"value":1},"span.self_time.sum.us":{"value":980}}}}\n',
      '{"metricset":{"timestamp":0,"transaction":{"name":"transaction #0","type":"transaction"},"span":{"type":"type"},"samples":{"span.self_time.count":{"value":1},"span.self_time.sum.us":{"value":10}}}}\n'
    ].join('')
    expect(result).toEqual([expected])
    jasmine.clock().uninstall()
  })

  if (isVersionInRange(testConfig.stackVersion, '7.3.0')) {
    it('should fetch remote config', async () => {
      spyOn(configService, 'setLocalConfig')
      spyOn(configService, 'getLocalConfig')

      var config = await apmServer.fetchConfig('nonexistent-service')
      expect(configService.getLocalConfig).toHaveBeenCalled()
      expect(configService.setLocalConfig).toHaveBeenCalled()

      expect(config).toEqual({ etag: jasmine.any(String) })

      config = await apmServer.fetchConfig(
        'nonexistent-service',
        'nonexistent-env'
      )
      expect(config).toEqual({ etag: jasmine.any(String) })

      try {
        config = await apmServer.fetchConfig()
      } catch (e) {
        expect(e).toBe('serviceName is required for fetching central config.')
      }
    })

    it('should use local config if available', async () => {
      configService.setLocalConfig({
        transaction_sample_rate: '0.5',
        etag: 'test'
      })

      apmServer._makeHttpRequest = () => {
        return Promise.resolve({
          status: 304
        })
      }

      let config = await apmServer.fetchConfig(
        'nonexistent-service',
        'nonexistent-env'
      )
      expect(config).toEqual({
        transaction_sample_rate: '0.5',
        etag: 'test'
      })
      sessionStorage.removeItem(LOCAL_CONFIG_KEY)
    })
  }
})
