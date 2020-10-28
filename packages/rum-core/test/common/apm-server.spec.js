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

import compareVersions from 'compare-versions'
import Transaction from '../../src/performance-monitoring/transaction'
import {
  LOCAL_CONFIG_KEY,
  ERRORS,
  TRANSACTIONS
} from '../../src/common/constants'
import { getGlobalConfig } from '../../../../dev-utils/test-config'
import { describeIf } from '../../../../dev-utils/jasmine'
import { createServiceFactory, generateTransaction, generateErrors } from '../'

const { agentConfig, testConfig } = getGlobalConfig('rum-core')

describe('ApmServer', function() {
  var serviceFactory
  var apmServer
  var configService
  var loggingService
  var originalTimeout
  var performanceMonitoring
  var errorLogging

  beforeEach(function() {
    /**
     * Setting longer timeout to mitigate if the connection
     * to APM server takes longer than the default timeout
     */
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    configService.setConfig(agentConfig)
    loggingService = serviceFactory.getService('LoggingService')
    apmServer = serviceFactory.getService('ApmServer')
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
    errorLogging = serviceFactory.getService('ErrorLogging')
  })

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it('should not send events when there are no events', function() {
    spyOn(apmServer, '_postJson')
    var result = apmServer.sendEvents([])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should report http errors when server is down', function(done) {
    configService.setConfig({
      serverUrl: 'http://localhost:54321',
      serviceName: 'test-service'
    })
    var result = apmServer.sendEvents([
      {
        [TRANSACTIONS]: { test: 'test' }
      }
    ])
    expect(result).toBeDefined()
    result.then(
      () => fail('Request should have failed!'),
      reason => {
        expect(reason).toBeDefined()
        done()
      }
    )
  })

  it('should queue items before sending', function() {
    configService.setConfig({
      serviceName: 'serviceName'
    })
    apmServer.init()
    spyOn(apmServer, '_postJson')

    const trs = generateTransaction(19)
    trs.forEach(apmServer.addTransaction.bind(apmServer))
    expect(apmServer.queue.items.length).toBe(19)
    expect(apmServer._postJson).not.toHaveBeenCalled()

    apmServer.queue.flush()
    expect(apmServer._postJson).toHaveBeenCalled()
    expect(apmServer.queue.items.length).toBe(0)
  })

  it('should not add any items to queue when not initialized', function() {
    const clock = jasmine.clock()
    clock.install()
    configService.setConfig({ flushInterval: 200 })

    spyOn(apmServer, 'sendEvents')
    expect(apmServer.queue).toBeUndefined()

    apmServer.addError({})
    apmServer.addTransaction({})
    expect(apmServer.queue).toBeUndefined()

    apmServer.init()
    apmServer.addTransaction({})
    apmServer.addError({})

    expect(apmServer.queue.items.length).toBe(2)
    clock.tick(201)
    expect(apmServer.sendEvents).toHaveBeenCalled()
    clock.uninstall()
  })

  it('should log parse error when response is invalid', done => {
    spyOn(loggingService, 'debug').and.callFake(message => {
      expect(message).toEqual('Error parsing response from APM server')
      done()
    })

    const error = apmServer._constructError({
      url: 'http://localhost:54321',
      status: 0,
      responseText: 'abc'
    })

    expect(error.message).toEqual('http://localhost:54321 HTTP status: 0')
  })

  it('should report http errors for queued events', function(done) {
    apmServer.init()
    spyOn(loggingService, 'warn')
    var _sendEvents = apmServer.sendEvents
    apmServer.sendEvents = function() {
      var result = _sendEvents.apply(apmServer, arguments)
      result.then(
        () => fail('Request should have failed!'),
        () => {
          setTimeout(() => {
            expect(loggingService.warn).toHaveBeenCalledWith(
              'Failed sending events!',
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
    apmServer.addTransaction({ test: 'test' })

    expect(apmServer.queue.items.length).toEqual(2)
    expect(loggingService.warn).not.toHaveBeenCalled()
    apmServer.queue.flush()
  })

  it('should throttle adding events to the queue every minute', () => {
    const clock = jasmine.clock()
    clock.install()
    spyOn(apmServer, 'sendEvents')
    spyOn(loggingService, 'warn')

    configService.setConfig({
      serviceName: 'serviceName',
      flushInterval: 100,
      eventsLimit: 5
    })
    apmServer.init()

    const errors = generateErrors(3)
    errors.forEach(apmServer.addError.bind(apmServer))
    const transactions = generateTransaction(3)
    transactions.forEach(apmServer.addTransaction.bind(apmServer))

    expect(apmServer.queue.items.length).toBe(5)
    expect(apmServer.sendEvents).not.toHaveBeenCalled()
    expect(loggingService.warn).toHaveBeenCalledWith(
      'Dropped events due to throttling!'
    )
    // Kickoff queue flush interval
    clock.tick(120)
    expect(apmServer.queue.items.length).toBe(0)
    expect(apmServer.sendEvents).toHaveBeenCalled()

    // add more events to the queue
    errors.forEach(apmServer.addError.bind(apmServer))
    expect(apmServer.queue.items.length).toBe(0)

    // tick throttle limit of 1 minute
    clock.tick(60001)

    errors.forEach(apmServer.addError.bind(apmServer))
    expect(apmServer.queue.items.length).toBe(3)

    clock.uninstall()
  })

  it('should ignore undefined filtered payload', function() {
    spyOn(loggingService, 'warn')
    configService.setConfig({
      serviceName: 'serviceName'
    })
    configService.addFilter(function() {})
    spyOn(apmServer, '_postJson')

    const result = apmServer.sendEvents([
      {
        [TRANSACTIONS]: { test: 'test' }
      }
    ])
    expect(result).toBeUndefined()
    expect(apmServer._postJson).not.toHaveBeenCalled()
  })

  it('should set metadata from config along with defaults', async () => {
    configService.setConfig({
      serviceName: 'test',
      serviceVersion: '0.0.1',
      environment: 'staging'
    })
    configService.setVersion('4.0.1')
    configService.addLabels({ test: 'testlabel' })

    /** To catch agent version mismatch during release */
    const meta = apmServer.createMetaData()
    expect(meta).toEqual({
      service: {
        name: 'test',
        version: '0.0.1',
        environment: 'staging',
        agent: {
          name: 'rum-js',
          version: '4.0.1'
        },
        language: { name: 'javascript' }
      },
      labels: { test: 'testlabel' }
    })

    const tr = new Transaction('test-meta-tr', 'test-type', {
      startTime: 10
    })
    const sp = tr.startSpan('test-meta-span', 'test-type', { startTime: 0 })
    sp.end(50)
    tr.end(100)
    const payload = performanceMonitoring.createTransactionDataModel(tr)
    await apmServer.sendEvents([
      {
        [TRANSACTIONS]: payload
      }
    ])
  })

  it('should ndjson all events', async () => {
    const clock = jasmine.clock()
    clock.install()
    apmServer.init()
    spyOn(apmServer, '_postJson')
    const trs = generateTransaction(2).map(tr =>
      performanceMonitoring.createTransactionDataModel(tr)
    )
    const errors = generateErrors(2).map(err => ({
      name: err.name,
      message: err.message
    }))

    trs.forEach(apmServer.addTransaction.bind(apmServer))
    errors.forEach(apmServer.addError.bind(apmServer))

    clock.tick(600)

    expect(apmServer._postJson).toHaveBeenCalled()
    const payload = apmServer._postJson.calls.argsFor(0)[1]

    const expected = [
      '{"metadata":{"service":{"name":"test","agent":{"name":"rum-js","version":"N/A"},"language":{"name":"javascript"}}}}',
      '{"error":{"name":"Error","message":"error #0"}}',
      '{"error":{"name":"Error","message":"error #1"}}',
      '{"transaction":{"id":"transaction-id-0","trace_id":"trace-id-0","name":"transaction #0","type":"transaction","duration":990,"span_count":{"started":1},"sampled":false}}',
      '{"span":{"id":"span-id-0-1","transaction_id":"transaction-id-0","parent_id":"transaction-id-0","trace_id":"trace-id-0","name":"name","type":"type","subtype":"subtype","sync":false,"start":10,"duration":10}}',
      '{"transaction":{"id":"transaction-id-1","trace_id":"trace-id-1","name":"transaction #1","type":"transaction","duration":990,"span_count":{"started":1},"sampled":false}}',
      '{"span":{"id":"span-id-1-1","transaction_id":"transaction-id-1","parent_id":"transaction-id-1","trace_id":"trace-id-1","name":"name","type":"type","subtype":"subtype","sync":false,"start":10,"duration":10}}'
    ]

    expect(payload.split('\n').filter(a => a)).toEqual(expected)
    clock.uninstall()
  })

  it('should compress all events when apiVersion is >2', () => {
    const clock = jasmine.clock()
    clock.install()
    configService.setConfig({ apiVersion: 3 })
    apmServer.init()
    spyOn(apmServer, '_postJson')
    const trs = generateTransaction(1, true).map(tr =>
      performanceMonitoring.createTransactionDataModel(tr)
    )
    const errors = generateErrors(1).map((err, i) => {
      let model = errorLogging.createErrorDataModel(err)
      model.id = 'error-id-' + i
      model.context = null
      return model
    })

    trs.forEach(tr => apmServer.addTransaction(tr))
    errors.forEach(err => apmServer.addError(err))
    clock.tick(600)

    expect(apmServer._postJson).toHaveBeenCalled()
    const payload = apmServer._postJson.calls.argsFor(0)[1]

    const expected = [
      '{"m":{"se":{"n":"test","a":{"n":"rum-js","ve":"N/A"},"la":{"n":"javascript"}}}}',
      '{"e":{"id":"error-id-0","cl":"(inline script)","ex":{"mg":"error #0","st":[]},"c":null}}',
      '{"x":{"id":"transaction-id-0","tid":"trace-id-0","n":"transaction #0","t":"transaction","d":990,"c":null,"m":null,"me":[{"sa":{"xdc":{"v":1},"xds":{"v":990},"xbc":{"v":1}}},{"y":{"t":"app"},"sa":{"ysc":{"v":1},"yss":{"v":980}}},{"y":{"t":"type"},"sa":{"ysc":{"v":1},"yss":{"v":10}}}],"y":[{"id":"span-id-0-1","n":"name","t":"type","s":10,"d":10,"c":null,"su":"subtype"}],"yc":{"sd":1},"sm":true}}'
    ]
    expect(payload.split('\n').filter(a => a)).toEqual(expected)
    clock.uninstall()
  })

  it('should ndjson transactions', function() {
    var trs = generateTransaction(3)
    const payload = trs.map(tr =>
      performanceMonitoring.createTransactionDataModel(tr)
    )
    var result = apmServer.ndjsonTransactions(payload)
    /* eslint-disable max-len */
    var expected = [
      '{"transaction":{"id":"transaction-id-0","trace_id":"trace-id-0","name":"transaction #0","type":"transaction","duration":990,"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-0-1","transaction_id":"transaction-id-0","parent_id":"transaction-id-0","trace_id":"trace-id-0","name":"name","type":"type","subtype":"subtype","sync":false,"start":10,"duration":10}}\n',
      '{"transaction":{"id":"transaction-id-1","trace_id":"trace-id-1","name":"transaction #1","type":"transaction","duration":990,"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-1-1","transaction_id":"transaction-id-1","parent_id":"transaction-id-1","trace_id":"trace-id-1","name":"name","type":"type","subtype":"subtype","sync":false,"start":10,"duration":10}}\n',
      '{"transaction":{"id":"transaction-id-2","trace_id":"trace-id-2","name":"transaction #2","type":"transaction","duration":990,"span_count":{"started":1},"sampled":false}}\n{"span":{"id":"span-id-2-1","transaction_id":"transaction-id-2","parent_id":"transaction-id-2","trace_id":"trace-id-2","name":"name","type":"type","subtype":"subtype","sync":false,"start":10,"duration":10}}\n'
    ]
    expect(result).toEqual(expected)
  })

  it('should ndjson metricsets along with transactions', function() {
    const trs = generateTransaction(1, true)
    const payload = trs.map(tr =>
      performanceMonitoring.createTransactionDataModel(tr)
    )
    const result = apmServer.ndjsonTransactions(payload)
    /* eslint-disable max-len */
    const expected = [
      '{"transaction":{"id":"transaction-id-0","trace_id":"trace-id-0","name":"transaction #0","type":"transaction","duration":990,"span_count":{"started":1},"sampled":true}}\n',
      '{"span":{"id":"span-id-0-1","transaction_id":"transaction-id-0","parent_id":"transaction-id-0","trace_id":"trace-id-0","name":"name","type":"type","subtype":"subtype","sync":false,"start":10,"duration":10}}\n',
      '{"metricset":{"transaction":{"name":"transaction #0","type":"transaction"},"samples":{"transaction.duration.count":{"value":1},"transaction.duration.sum.us":{"value":990},"transaction.breakdown.count":{"value":1}}}}\n',
      '{"metricset":{"transaction":{"name":"transaction #0","type":"transaction"},"span":{"type":"app"},"samples":{"span.self_time.count":{"value":1},"span.self_time.sum.us":{"value":980}}}}\n',
      '{"metricset":{"transaction":{"name":"transaction #0","type":"transaction"},"span":{"type":"type","subtype":"subtype"},"samples":{"span.self_time.count":{"value":1},"span.self_time.sum.us":{"value":10}}}}\n'
    ].join('')
    expect(result).toEqual([expected])
  })

  it('should pass correct payload to filters', () => {
    configService.setConfig({
      serviceName: 'serviceName'
    })
    /**
     * We don't want to send these payloads to the apm server
     * since they are only tests and not valid payloads.
     */
    spyOn(apmServer, '_postJson')
    let type = ''
    configService.addFilter(function(payload) {
      expect(payload[type]).toEqual([{ test: type }])
      return payload
    })

    type = ERRORS
    apmServer.sendEvents([
      {
        [ERRORS]: { test: type }
      }
    ])

    type = TRANSACTIONS
    apmServer.sendEvents([
      {
        [TRANSACTIONS]: { test: type }
      }
    ])
  })

  /**
   * Stream API in blob is only supported on few browsers
   */
  if (window.Response && typeof new Blob().stream === 'function') {
    it('should send uncompressed payload when compression failed', async () => {
      const transactions = generateTransaction(1, true).map(tr => {
        const model = performanceMonitoring.createTransactionDataModel(tr)
        return model
      })
      const payload = apmServer.ndjsonTransactions(transactions, true).join('')

      spyOn(apmServer, '_makeHttpRequest').and.resolveTo({
        responseText: 'success'
      })
      spyOn(loggingService, 'debug')

      function mockCompressionStream() {
        const original = window.CompressionStream
        window.CompressionStream = function() {
          throw new Error('Compression Failed')
        }
        return function unMock() {
          window.CompressionStream = original
        }
      }
      const unMock = mockCompressionStream()
      const isCompressionStreamSupported =
        typeof CompressionStream === 'function'

      await apmServer._postJson('/test', payload)

      if (isCompressionStreamSupported) {
        expect(loggingService.debug).toHaveBeenCalledWith(
          'Compressing the payload using CompressionStream API failed',
          'Compression Failed'
        )
      }
      expect(apmServer._makeHttpRequest).toHaveBeenCalledWith('POST', '/test', {
        payload,
        headers: { 'Content-Type': 'application/x-ndjson' }
      })
      unMock()
    })
  }

  describeIf(
    '7.5+',
    () => {
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
    },
    testConfig.stackVersion &&
      compareVersions(testConfig.stackVersion, '7.5.0') >= 0
  )

  describeIf(
    '7.8+',
    () => {
      it('should post compressed payload without errors', async () => {
        configService.setConfig({ apiVersion: 3 })
        const transactions = generateTransaction(1, true).map(tr =>
          performanceMonitoring.createTransactionDataModel(tr)
        )
        const errors = generateErrors(1, true).map(err =>
          errorLogging.createErrorDataModel(err)
        )
        await apmServer.sendEvents([
          {
            [TRANSACTIONS]: transactions[0]
          },
          {
            [ERRORS]: errors[0]
          }
        ])
      })
    },
    testConfig.stackVersion &&
      compareVersions(testConfig.stackVersion, '7.8.0') >= 0
  )

  describeIf(
    '7.10-',
    () => {
      it('should capture errors logs from apm-server', done => {
        apmServer.init()
        spyOn(loggingService, 'warn').and.callFake((failedMsg, error) => {
          expect(failedMsg).toEqual('Failed sending events!')
          /**
           * APM server error varies by stack, So we check for
           * explicit characters instead of whole message
           */
          expect(error.message).toContain(
            ': I[#] S[#] doesn\'t validate with "transaction#'
          )
          expect(error.message).toContain('missing properties: "trace_id"')
          done()
        })

        apmServer.addTransaction({
          id: '21312',
          span_count: 0,
          duration: 100,
          type: 'app'
        })
        apmServer.queue.flush()
      })
    },
    testConfig.stackVersion &&
      compareVersions(testConfig.stackVersion, '7.10.0') < 0
  )

  describeIf(
    '7.10+',
    () => {
      it('should capture errors logs from apm-server', done => {
        apmServer.init()
        spyOn(loggingService, 'warn').and.callFake((failedMsg, error) => {
          expect(failedMsg).toEqual('Failed sending events!')
          expect(error.message).toContain(
            `validation error: transaction: 'trace_id' required`
          )
          done()
        })

        apmServer.addTransaction({
          id: '21312',
          span_count: { started: 0 },
          duration: 100,
          type: 'app'
        })
        apmServer.queue.flush()
      })
    },
    testConfig.stackVersion &&
      compareVersions(testConfig.stackVersion, '7.10.0') >= 0
  )
})
