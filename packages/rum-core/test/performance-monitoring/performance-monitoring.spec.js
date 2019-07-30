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

import { createServiceFactory } from '../'
import Transaction from '../../src/performance-monitoring/transaction'
import Span from '../../src/performance-monitoring/span'
import { getGlobalConfig } from '../../../../dev-utils/test-config'
import { getDtHeaderValue } from '../../src/common/utils'
import { globalState } from '../../src/common/patching/patch-utils'
import { SCHEDULE, ON_TASK } from '../../src/common/constants'
import patchEventHandler from '../common/patch'
import { mockGetEntriesByType } from '../utils/globals-mock'
import { ON_TRANSACTION_END } from '../../src/common/constants'

const { agentConfig } = getGlobalConfig('rum-core')

describe('PerformanceMonitoring', function() {
  var serviceFactory
  var apmServer
  var performanceMonitoring
  var configService
  var logger

  beforeEach(function() {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    logger = serviceFactory.getService('LoggingService')
    configService.setConfig(agentConfig)

    apmServer = serviceFactory.getService('ApmServer')
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  })

  it('should send performance monitoring data to apm-server', function(done) {
    var tr = new Transaction('tr-name', 'tr-type', configService.config)
    var span1 = new Span('span 1', 'test-span')
    span1.end()
    tr.spans.push(span1)
    tr.end()
    var payload = performanceMonitoring.convertTransactionsToServerModel([tr])
    var promise = apmServer.sendTransactions(payload)
    expect(promise).toBeDefined()
    promise
      .catch(reason => {
        fail('Failed sending transactions to the server, reason: ' + reason)
      })
      .then(() => done())
  })

  it('should group small continuously similar spans up until the last one', function() {
    var tr = new Transaction('transaction', 'transaction')
    var span1 = tr.startSpan('name', 'type')
    span1.end()
    var span2 = tr.startSpan('name', 'type')
    span2.end()
    var span3 = tr.startSpan('another-name', 'type')
    span3.end()
    var span4 = tr.startSpan('name', 'type')
    span4.end()
    var span5 = tr.startSpan('name', 'type')
    span5.end()

    tr.end()

    tr._start = 10
    tr._end = 1000

    span1._start = 20
    span1._end = 30

    span2._start = 31
    span2._end = 35

    span3._start = 35
    span3._end = 45

    span4._start = 50
    span4._end = 60

    span5._start = 61
    span5._end = 70

    tr.spans.sort(function(spanA, spanB) {
      return spanA._start - spanB._start
    })
    var grouped = performanceMonitoring.groupSmallContinuouslySimilarSpans(
      tr,
      0.05
    )

    expect(grouped.length).toBe(3)
    expect(grouped[0].name).toBe('2x name')
    expect(grouped[1].name).toBe('another-name')
    expect(grouped[2].name).toBe('2x name')
  })

  it('should group small continuously similar spans', function() {
    var tr = new Transaction('transaction', 'transaction')
    var span1 = tr.startSpan('name', 'type')
    span1.end()
    var span2 = tr.startSpan('name', 'type')
    span2.end()
    var span3 = tr.startSpan('name', 'type')
    span3.end()
    var span4 = tr.startSpan('name', 'type')
    span4.end()
    var span5 = tr.startSpan('another-name', 'type')
    span5.end()

    tr.end()

    tr._start = 10
    tr._end = 1000

    span1._start = 20
    span1._end = 30

    span2._start = 31
    span2._end = 35

    span3._start = 35
    span3._end = 45

    span4._start = 50
    span4._end = 60

    span5._start = 60
    span5._end = 70

    tr.spans.sort(function(spanA, spanB) {
      return spanA._start - spanB._start
    })

    var grouped = performanceMonitoring.groupSmallContinuouslySimilarSpans(
      tr,
      0.05
    )

    expect(grouped.length).toBe(2)
    expect(grouped[0].name).toBe('4x name')
    expect(grouped[1].name).toBe('another-name')
  })

  it('should calculate browser responsiveness', function() {
    var tr = new Transaction('transaction', 'transaction', {})
    tr.end()

    tr._start = 1

    tr._end = 400
    tr.browserResponsivenessCounter = 0
    var resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(true)

    tr._end = 1001
    tr.browserResponsivenessCounter = 2
    resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(true)

    tr._end = 1601
    tr.browserResponsivenessCounter = 2
    resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(true)

    tr._end = 3001
    tr.browserResponsivenessCounter = 3
    resp = performanceMonitoring.checkBrowserResponsiveness(tr, 500, 2)
    expect(resp).toBe(false)
  })

  it('should sendTransactionInterval', function() {
    var tr = new Transaction('test transaction', 'transaction', {
      transactionSampleRate: 1
    })
    var span = tr.startSpan('test span', 'test span thype')
    span.end()
    span._end += 10
    tr.detectFinish()
    expect(tr._end).toBeDefined()
    if (tr._end === tr._start) {
      tr._end = tr._end + 100
    }
    var result = performanceMonitoring.sendTransactions([tr])
    expect(result).toBeDefined()
  })

  it('should filter transactions based on duration and spans', () => {
    configService.setConfig({
      transactionDurationThreshold: 200
    })
    spyOn(logger, 'debug').and.callThrough()
    const transaction1 = new Transaction()
    transaction1.end()
    transaction1._start = 0
    transaction1._end = 201
    expect(transaction1.duration()).toBe(201)
    expect(performanceMonitoring.filterTransaction(transaction1)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'Transaction was discarded! Transaction duration (201) is greater than the transactionDurationThreshold configuration (200)'
    )
    logger.debug.calls.reset()

    const transaction2 = new Transaction()
    transaction2.end()
    transaction2._end = transaction2._end + 100
    expect(performanceMonitoring.filterTransaction(transaction2)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'Transaction was discarded! Transaction does not include any spans'
    )
    logger.debug.calls.reset()

    const transaction3 = new Transaction()
    expect(performanceMonitoring.filterTransaction(transaction3)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      "Transaction was discarded! Transaction wasn't ended"
    )
    logger.debug.calls.reset()

    const transaction4 = new Transaction()
    transaction4.end()
    transaction4._start = transaction4._end = 0
    expect(performanceMonitoring.filterTransaction(transaction4)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'Transaction was discarded! Transaction duration is 0'
    )
  })

  it('should filter transactions based on browser responsiveness', function() {
    configService.setConfig({
      browserResponsivenessInterval: 500,
      checkBrowserResponsiveness: true,
      browserResponsivenessBuffer: 2
    })
    spyOn(logger, 'debug').and.callThrough()
    expect(logger.debug).not.toHaveBeenCalled()
    var tr = new Transaction('transaction', 'transaction', {
      transactionSampleRate: 1
    })
    var span = tr.startSpan('test span', 'test span type')
    span.end()
    tr.end()
    tr._start = 1

    tr._end = 3001
    tr.browserResponsivenessCounter = 3
    var wasBrowserResponsive = performanceMonitoring.filterTransaction(tr)
    expect(wasBrowserResponsive).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'Transaction was discarded! Browser was not responsive enough during the transaction.',
      ' duration:',
      3000,
      ' browserResponsivenessCounter:',
      3,
      'interval:',
      500
    )
  })

  xit('should initialize', function(done) {
    performanceMonitoring.init()
    spyOn(apmServer, 'addTransaction').and.callThrough()

    var tr = performanceMonitoring._transactionService.startTransaction(
      'transaction',
      'transaction'
    )
    var span = tr.startSpan('test span', 'test span type')
    span.end()
    span = tr.startSpan('test span 2', 'test span type')
    span.end()
    tr.detectFinish()
    setTimeout(() => {
      expect(apmServer.addTransaction).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'transaction',
          type: 'transaction'
        })
      )
      done()
    }, 10)
  })

  it('should adjust transaction start based on earliest span start', function(done) {
    const firstSpan = new Span('first-span-name', 'first-span')
    firstSpan.end()

    const transaction = new Transaction('/', 'transaction', {})
    transaction.onEnd = function() {
      performanceMonitoring.adjustTransactionTime(transaction)
      expect(transaction._start).toBe(firstSpan._start)
      expect(transaction._end).toBeGreaterThanOrEqual(lastSpan._end)
      done()
    }
    transaction.spans.push(firstSpan)

    const lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()

    transaction.detectFinish()
  })

  it('should adjust transaction end based on latest span end', function(done) {
    const transaction = new Transaction('/', 'transaction', {})
    const transactionStart = transaction._start

    const firstSpan = transaction.startSpan('first-span-name', 'first-span')
    firstSpan.end()

    const longSpan = transaction.startSpan('long-span-name', 'long-span')

    const lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()

    longSpan.end()
    longSpan.end += 500

    transaction.onEnd = function() {
      performanceMonitoring.adjustTransactionTime(transaction)
      expect(transaction._start).toBe(transactionStart)
      expect(transaction._end).toBeGreaterThanOrEqual(longSpan._end)
      done()
    }
    transaction.detectFinish()
  })

  it('should truncate active spans after transaction ends', () => {
    const transaction = new Transaction('transaction', 'transaction')
    const span = transaction.startSpan('test', 'test')
    expect(transaction.spans.length).toBe(0)
    expect(Object.keys(transaction._activeSpans).length).toBe(1)
    transaction.end()

    performanceMonitoring.adjustTransactionTime(transaction)
    expect(transaction.spans.length).toBe(1)
    expect(Object.keys(transaction._activeSpans).length).toBe(0)
    expect(span.type).toContain('.truncated')
  })

  it('should create correct payload', function() {
    var tr = new Transaction('transaction1', 'transaction1type', {
      transactionSampleRate: 1
    })
    var span = tr.startSpan('span1', 'span1type')
    span.end()
    span._end += 10
    tr.detectFinish()

    expect(tr._end).toBeDefined()
    if (tr._end === tr._start) {
      tr._end = tr._end + 100
    }

    var payload = performanceMonitoring.createTransactionPayload(tr)
    expect(payload.name).toBe('transaction1')
    expect(payload.type).toBe('transaction1type')
    expect(payload.spans.length).toBe(1)
    expect(payload.spans[0].name).toBe('span1')
    expect(payload.spans[0].type).toBe('span1type')
    expect(payload.spans[0].start).toBe(span._start - tr._start)
    expect(payload.spans[0].duration).toBe(span._end - span._start)
  })

  it('should not produce negative durations while adjusting to the spans', function() {
    var transaction = new Transaction('transaction', 'transaction')
    var span = transaction.startSpan('test', 'test')
    span.end()
    span._end += 100
    span = transaction.startSpan('test', 'external.http')

    span.end()
    span._start = 10000000
    span._end = 11000000
    transaction.end()
    performanceMonitoring.adjustTransactionTime(transaction)
    expect(span.duration()).toBe(0)
  })

  it('should sendPageLoadMetrics', function(done) {
    const unMock = mockGetEntriesByType()
    const transactionService = serviceFactory.getService('TransactionService')

    configService.events.observe(ON_TRANSACTION_END, function(tr) {
      expect(tr.isHardNavigation).toBe(true)
      var payload = performanceMonitoring.convertTransactionsToServerModel([tr])
      var promise = apmServer.sendTransactions(payload)
      expect(promise).toBeDefined()
      promise
        .then(
          () => unMock(),
          reason =>
            fail(
              'Failed sending page load metrics so the server, reason: ' +
                reason
            )
        )
        .then(() => done())
    })
    const tr = transactionService.startTransaction('resource-test', 'page-load')
    tr.detectFinish()
  })

  it('should filter out empty transactions', function() {
    var tr = new Transaction('test', 'test', { transactionSampleRate: 1 })
    var result = performanceMonitoring.filterTransaction(tr)
    expect(tr.spans.length).toBe(0)
    expect(tr.duration()).toBe(null)
    expect(result).toBe(false)
    var span = tr.startSpan('span1', 'span1type')
    span.end()

    expect(tr.spans.length).toBe(1)
    expect(tr.duration()).toBe(null)
    result = performanceMonitoring.filterTransaction(tr)
    expect(result).toBe(false)

    tr.end()
    if (tr._end && tr._end === tr._start) {
      tr._end += 100
    }
    expect(tr.duration()).toBeGreaterThan(0)
    result = performanceMonitoring.filterTransaction(tr)
    expect(result).toBe(true)
  })

  it('should not filter unsampled transactions with spans', function() {
    const tr = new Transaction('unsampled', 'test', {
      transactionSampleRate: 0
    })
    tr.end()
    if (tr._end && tr._end === tr._start) {
      tr._end += 100
    }
    expect(tr.duration()).toBeGreaterThan(0)
    expect(tr.spans.length).toBe(0)
    expect(performanceMonitoring.filterTransaction(tr)).toBe(false)

    const tr2 = new Transaction('unsampled', 'test', {
      transactionSampleRate: 0
    })
    tr2.startSpan('span1', 'type1').end()
    tr2.end()
    if (tr2._end && tr2._end === tr2._start) {
      tr2._end += 100
    }
    expect(tr2.spans.length).toBe(1)
    expect(performanceMonitoring.filterTransaction(tr2)).toBe(true)
    expect(tr2.spans.length).toBe(0)
  })

  it('should filter the transactions with duration above threshold', function() {
    var threshold = configService.get('transactionDurationThreshold')
    var tr = new Transaction(
      '/test/outlier',
      'page-load-slow',
      configService.config
    )
    var span1 = new Span('span 1', 'test-span')
    span1.end()
    tr.spans.push(span1)
    tr.end()
    tr._end += 60001
    expect(tr.duration()).toBeGreaterThanOrEqual(threshold)
    var payload = performanceMonitoring.createTransactionPayload(tr)
    expect(payload).toBeUndefined()
    var promise = apmServer.sendTransactions(payload)
    expect(promise).toBeUndefined()
  })

  it('should correctly use xhr patch', function(done) {
    var fn = performanceMonitoring.getXhrPatchSubFn()
    expect(typeof fn).toBe('function')
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    spyOn(req, 'setRequestHeader').and.callThrough()
    var task = {
      source: 'XMLHttpRequest.send',
      data: {
        target: req
      }
    }
    req.addEventListener('readystatechange', function() {
      if (req.readyState === req.DONE) {
        fn('invoke', task)
        expect(task.data.span.ended).toBeTruthy()
        done()
      }
    })
    fn('schedule', task)
    req.send()
    expect(task.data.span).toBeDefined()
    expect(task.data.span.ended).toBeFalsy()
    var headerName = configService.get('distributedTracingHeaderName')
    var headerValue = getDtHeaderValue(task.data.span)
    expect(req.setRequestHeader).toHaveBeenCalledWith(headerName, headerValue)
  })

  it('should consider fetchInProgress to avoid duplicate spans', function(done) {
    var fn = performanceMonitoring.getXhrPatchSubFn()
    expect(typeof fn).toBe('function')
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    var task = {
      source: 'XMLHttpRequest.send',
      data: {
        target: req
      }
    }

    req.addEventListener('readystatechange', function() {
      if (req.readyState === req.DONE) {
        fn('invoke', task)
        expect(task.data.span.ended).toBeTruthy()
        done()
      }
    })

    globalState.fetchInProgress = true
    fn('schedule', task)
    expect(task.data.span).toBeUndefined()

    globalState.fetchInProgress = false
    fn('schedule', task)
    req.send()
    expect(task.data.span).toBeDefined()
    expect(task.data.span.ended).toBeFalsy()
  })

  if (window.fetch) {
    it('should create fetch spans', function(done) {
      var fn = performanceMonitoring.getXhrPatchSubFn()
      var dTHeaderValue
      performanceMonitoring.cancelPatchSub = patchEventHandler.observe(
        ON_TASK,
        function(event, task) {
          fn(event, task)
          if (event === SCHEDULE) {
            dTHeaderValue = task.data.target.headers.get(
              configService.get('distributedTracingHeaderName')
            )
          }
        }
      )
      var transactionService = performanceMonitoring._transactionService
      var tr = transactionService.startTransaction(
        'fetch transaction',
        'custom'
      )
      spyOn(transactionService, 'startSpan').and.callThrough()

      window.fetch('/?a=b&c=d').then(function() {
        setTimeout(() => {
          expect(tr.spans.length).toBe(1)
          expect(tr.spans[0].name).toBe('GET /')
          expect(tr.spans[0].context).toEqual({
            http: {
              method: 'GET',
              url: 'http://localhost:9876/?a=b&c=d',
              status_code: 200
            }
          })
          expect(dTHeaderValue).toBeDefined()
          performanceMonitoring.cancelPatchSub()
          done()
        })
      })
      expect(transactionService.startSpan).toHaveBeenCalledWith(
        'GET /',
        'external.http'
      )
    })

    it('should redact auth from xhr tasks', () => {
      const fn = performanceMonitoring.getXhrPatchSubFn()
      const transactionService = performanceMonitoring._transactionService
      const fakeXHRTask = {
        source: 'XMLHttpRequest.send',
        data: {
          method: 'GET',
          url: 'https://a:b@c.com/d?e=10&f=20'
        }
      }
      spyOn(transactionService, 'startSpan').and.callThrough()
      fn(SCHEDULE, fakeXHRTask)

      expect(transactionService.startSpan).toHaveBeenCalledWith(
        'GET https://[REDACTED]:[REDACTED]@c.com/d',
        'external.http'
      )
    })

    it('should not duplicate xhr spans if fetch is a polyfill', function(done) {
      var fn = performanceMonitoring.getXhrPatchSubFn()

      var events = []
      performanceMonitoring.cancelPatchSub = patchEventHandler.observe(
        ON_TASK,
        function(event, task) {
          events.push({ event, source: task.source })
          fn(event, task)
        }
      )

      window['__fetchDelegate'] = function(request) {
        return new Promise(function(resolve) {
          var url
          if (typeof request === 'string') {
            url = request
          } else {
            url = request.url
          }
          var req = new window.XMLHttpRequest()
          req.open('GET', url, true)
          req.addEventListener('readystatechange', function() {
            // to guarantee the order of event execution
            setTimeout(() => {
              if (req.readyState === req.DONE) {
                resolve(req.responseText)
              }
            })
          })

          // Can't rely on the fetch-patch to set this flag because of the way karma executes tests
          globalState.fetchInProgress = true
          req.send()
          globalState.fetchInProgress = false
        })
      }
      var transactionService = performanceMonitoring._transactionService
      var tr = transactionService.startTransaction(
        'fetch transaction',
        'custom'
      )

      var promise = window.fetch('/')
      expect(promise).toBeDefined()
      promise.then(function(response) {
        setTimeout(() => {
          expect(response).toBeDefined()
          expect(tr.spans.length).toBe(1)
          expect(events).toEqual([
            {
              event: 'schedule',
              source: 'fetch'
            },
            {
              event: 'schedule',
              source: 'XMLHttpRequest.send'
            },
            {
              event: 'invoke',
              source: 'XMLHttpRequest.send'
            },
            {
              event: 'invoke',
              source: 'fetch'
            }
          ])
          done()
        })
      })

      window['__fetchDelegate'] = undefined
    })
  }

  it('should add xhr tasks', function(done) {
    var fn = performanceMonitoring.getXhrPatchSubFn()
    var transactionService = performanceMonitoring._transactionService
    var tr = transactionService.startTransaction('task transaction', 'custom')
    expect(typeof fn).toBe('function')
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)

    var task = {
      source: 'XMLHttpRequest.send',
      data: {
        target: req
      }
    }
    req.addEventListener('readystatechange', function() {
      if (req.readyState === req.DONE) {
        fn('invoke', task)
        expect(tr._scheduledTasks).toEqual([])
        expect(tr.ended).toBeTruthy()
        done()
      }
    })
    fn('schedule', task)
    expect(task.id).toBeDefined()
    expect(tr._scheduledTasks).toEqual(['task1'])
    req.send()
  })

  it('should create Transactions on history.pushState', function() {
    var fn = performanceMonitoring.getXhrPatchSubFn()
    performanceMonitoring.cancelPatchSub = patchEventHandler.observe(
      ON_TASK,
      function(event, task) {
        fn(event, task)
      }
    )
    var transactionService = performanceMonitoring._transactionService

    spyOn(transactionService, 'startTransaction').and.callThrough()

    history.pushState(undefined, 'test', 'test')

    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      'test',
      'route-change',
      { canReuse: true }
    )
    performanceMonitoring.cancelPatchSub()
  })
})
