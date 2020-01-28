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

import TransactionService from '../../src/performance-monitoring/transaction-service'
import Transaction from '../../src/performance-monitoring/transaction'
import Span from '../../src/performance-monitoring/span'
import Config from '../../src/common/config-service'
import LoggingService from '../../src/common/logging-service'
import { mockGetEntriesByType } from '../utils/globals-mock'
import { TRANSACTION_END, PAGE_LOAD } from '../../src/common/constants'

describe('TransactionService', function() {
  var transactionService
  var config
  var logger

  function sendPageLoadMetrics(name) {
    var tr = transactionService.startTransaction(name, 'page-load', {
      managed: true
    })
    tr.detectFinish()
    return tr
  }

  beforeEach(function() {
    logger = new LoggingService()
    spyOn(logger, 'debug')

    config = new Config()
    config.init()
    transactionService = new TransactionService(logger, config)
  })

  it('should not start span when there is no current transaction', function() {
    transactionService.startSpan('test-span', 'test-span')
    expect(logger.debug).toHaveBeenCalled()
  })

  it('should call startSpan on current Transaction', function() {
    var tr = new Transaction('transaction', 'transaction')
    spyOn(tr, 'startSpan').and.callThrough()
    transactionService.setCurrentTransaction(tr)
    transactionService.startSpan('test-span', 'test-span', { test: 'passed' })
    expect(
      transactionService.getCurrentTransaction().startSpan
    ).toHaveBeenCalledWith('test-span', 'test-span', { test: 'passed' })
  })

  it('should start transaction', function(done) {
    transactionService = new TransactionService(logger, config)

    var result = transactionService.startTransaction(
      'transaction1',
      'transaction'
    )
    expect(result).toBeDefined()
    result = transactionService.startTransaction(
      'transaction2',
      'transaction',
      { managed: true }
    )
    expect(result.name).toBe('transaction2')

    var origCb = result.onEnd
    result.onEnd = function() {
      var r = origCb.apply(this, arguments)
      done()
      return r
    }
    spyOn(result, 'onEnd').and.callThrough()
    transactionService.addTask('task1')
    var span = transactionService.startSpan('test', 'test')
    span.end()
    result.detectFinish()
    expect(result.onEnd).not.toHaveBeenCalled()
    transactionService.removeTask('task1')
    expect(result.onEnd).toHaveBeenCalled()
  })

  it('should create a reusable transaction on the first span', function() {
    transactionService = new TransactionService(logger, config)

    transactionService.startSpan('testSpan', 'testtype')
    var trans = transactionService.getCurrentTransaction()
    expect(trans.name).toBe('Unknown')
    transactionService.startTransaction('transaction', 'transaction', {
      managed: true,
      canReuse: true
    })
    expect(trans.name).toBe('transaction')
  })

  it('should fire onstart hook only once for a transaction', () => {
    const onStartSpy = jasmine.createSpy()
    transactionService = new TransactionService(logger, {
      config: {},
      events: {
        send: onStartSpy
      }
    })
    const options = {
      managed: true,
      canReuse: true
    }
    transactionService.startTransaction('/', 'custom', options)
    transactionService.startTransaction('/home', '', options)

    expect(onStartSpy).toHaveBeenCalledTimes(1)

    transactionService.startTransaction('/a', 'custom')
    transactionService.startTransaction('/b', 'custom')

    expect(onStartSpy).toHaveBeenCalledTimes(3)
  })

  it('should capture page load on first transaction', function(done) {
    // todo: can't test hard navigation metrics since karma runs tests inside an iframe
    config.setConfig({
      capturePageLoad: true
    })
    transactionService = new TransactionService(logger, config)

    var tr1 = transactionService.startTransaction(
      'transaction1',
      'transaction',
      { managed: true }
    )
    var tr1DoneFn = tr1.onEnd
    tr1.onEnd = function() {
      tr1DoneFn()
      expect(tr1.captureTimings).toBe(true)
      tr1.spans.forEach(function(t) {
        expect(t.duration()).toBeLessThan(5 * 60 * 1000)
        expect(t.duration()).toBeGreaterThan(-1)
      })
    }
    expect(tr1.captureTimings).toBe(true)
    tr1.detectFinish()

    var tr2 = transactionService.startTransaction('transaction2', 'transaction')
    expect(tr2.captureTimings).toBe(false)
    var tr2DoneFn = tr2.onEnd
    tr2.onEnd = function() {
      tr2DoneFn()
      expect(tr2.captureTimings).toBe(false)
      done()
    }
    tr2.detectFinish()
  })

  it('should not capture timings as spans for unsampled transactions', done => {
    const unMock = mockGetEntriesByType()

    config.events.observe(TRANSACTION_END, transaction => {
      expect(transaction.sampled).toBe(false)
      expect(transaction.captureTimings).toBe(false)
      expect(transaction.spans.length).toBe(0)
      unMock()
      done()
    })

    const tr = transactionService.startTransaction(
      'unsampled-test',
      PAGE_LOAD,
      { transactionSampleRate: 0 }
    )
    tr.detectFinish()
  })

  it('should reuse Transaction', function() {
    transactionService = new TransactionService(logger, config)
    const reusableTr = new Transaction('test-name', 'test-type', {
      canReuse: true
    })
    transactionService.setCurrentTransaction(reusableTr)
    const pageLoadTr = transactionService.startTransaction(name, 'page-load', {
      managed: true,
      canReuse: true
    })
    pageLoadTr.detectFinish()

    expect(pageLoadTr).toBe(reusableTr)
  })

  it('should not capture resource/user spans or marks for custom transaction', done => {
    const unMock = mockGetEntriesByType()

    config.events.observe(TRANSACTION_END, () => {
      expect(tr.marks).toBeUndefined()
      expect(tr.spans.length).toBe(0)
      unMock()
      done()
    })

    const tr = transactionService.startTransaction('test', 'custom')
    tr.detectFinish()
  })

  it('should use initial page load name before ending the transaction', function(done) {
    transactionService = new TransactionService(logger, config)

    const tr = transactionService.startTransaction(undefined, 'page-load', {
      managed: true
    })
    expect(tr.name).toBe('Unknown')

    config.setConfig({
      pageLoadTransactionName: 'page load name'
    })
    tr.detectFinish()

    /**
     * For page load transaction we set the transaction name using
     * transaction.onEnd
     */
    config.events.observe(TRANSACTION_END, tr => {
      expect(tr.name).toBe('page load name')
      done()
    })
  })

  xit('should not add duplicate resource spans', function() {
    transactionService = new TransactionService(logger, config)

    var tr = transactionService.startTransaction('transaction', 'transaction', {
      managed: true
    })
    tr.captureTimings = true
    var queryString = '?' + Date.now()
    var testUrl = '/base/test/performance/transactionService.spec.js'

    if (window.performance.getEntriesByType) {
      if (window.fetch) {
        window.fetch(testUrl + queryString).then(function() {
          var entries = window.performance
            .getEntriesByType('resource')
            .filter(function(entry) {
              return entry.name.indexOf(testUrl + queryString) > -1
            })
          expect(entries.length).toBe(1)

          tr.donePromise.then(function() {
            var filtered = tr.spans.filter(function(span) {
              return span.name.indexOf(testUrl) > -1
            })
            expect(filtered.length).toBe(1)
            console.log(filtered[0])
            fail()
          })

          var xhrTask = {
            source: 'XMLHttpRequest.send',
            XHR: { url: testUrl, method: 'GET' }
          }
          var spanName = xhrTask.XHR.method + ' ' + testUrl
          var span = transactionService.startSpan(spanName, 'external.http')
          span.end()
        })
      }
    }
  })

  it('should capture resources from navigation timing', function(done) {
    const unMock = mockGetEntriesByType()

    const customTransactionService = new TransactionService(logger, config)
    config.events.observe(TRANSACTION_END, function() {
      expect(tr.captureTimings).toBe(true)
      expect(
        tr.spans.filter(({ type }) => type === 'resource').length
      ).toBeGreaterThanOrEqual(1)
      expect(
        tr.spans.filter(({ type }) => type === 'app').length
      ).toBeGreaterThanOrEqual(1)
      expect(tr.marks.agent.firstContentfulPaint).toBeDefined()
      expect(tr.marks.navigationTiming).toBeDefined()
      unMock()
      done()
    })

    const zoneTr = new Transaction('test', 'test-transaction')
    customTransactionService.setCurrentTransaction(zoneTr)
    const span = zoneTr.startSpan('GET http://example.com', 'external.http')
    span.end()

    const tr = customTransactionService.startTransaction(
      'resource-test',
      PAGE_LOAD,
      { managed: true }
    )
    tr.detectFinish()
  })

  it('should ignore transactions that match the list', function() {
    config.setConfig({
      ignoreTransactions: ['transaction1', /transaction2/]
    })
    transactionService = new TransactionService(logger, config)

    expect(
      transactionService.shouldIgnoreTransaction('dont-ignore')
    ).toBeFalsy()
    expect(
      transactionService.shouldIgnoreTransaction('transaction1')
    ).toBeTruthy()
    expect(
      transactionService.shouldIgnoreTransaction(
        'something-transaction2-something'
      )
    ).toBeTruthy()

    config.setConfig({
      ignoreTransactions: []
    })
  })

  it('should apply sampling to transactions', function() {
    var transactionSampleRate = config.get('transactionSampleRate')
    expect(transactionSampleRate).toBe(1.0)
    var tr = transactionService.startTransaction('test', 'test')
    expect(tr.sampled).toBe(true)
    var span = transactionService.startSpan('testspan', 'test')
    expect(span.sampled).toBe(true)

    config.setConfig({
      transactionSampleRate: 0
    })
    tr = transactionService.startTransaction('test', 'test')
    expect(tr.sampled).toBe(false)
    span = tr.startSpan('testspan', 'test')
    expect(span.sampled).toBe(false)
  })

  it('should consider page load traceId and spanId', function(done) {
    config.setConfig({
      pageLoadTraceId: 'test-trace-id',
      pageLoadSpanId: 'test-span-id',
      pageLoadSampled: true
    })
    const unMock = mockGetEntriesByType()

    transactionService = new TransactionService(logger, config)
    const tr = sendPageLoadMetrics()
    expect(tr.traceId).toBe('test-trace-id')
    expect(tr.sampled).toBe(true)

    setTimeout(() => {
      var spans = tr.spans.filter(function(span) {
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
      unMock()
      done()
    })
  })

  it('should ensureCurrentTransaction once per startTransaction', function() {
    spyOn(transactionService, 'ensureCurrentTransaction').and.callThrough()
    transactionService.startTransaction('test-name', 'test-type', {
      managed: true
    })
    expect(transactionService.ensureCurrentTransaction).toHaveBeenCalledTimes(1)
  })

  it('should include size & server timing in page load context', done => {
    const unMock = mockGetEntriesByType()
    const customTrService = new TransactionService(logger, config)
    config.events.observe(TRANSACTION_END, function() {
      expect(tr.context.response).toEqual({
        transfer_size: 26941,
        encoded_body_size: 105297,
        decoded_body_size: 42687,
        headers: {
          'server-timing': 'edge;dur=4, cdn-cache;desc=HIT'
        }
      })
      unMock()
      done()
    })
    const tr = customTrService.startTransaction('test', 'page-load', {
      managed: true
    })
    tr.detectFinish()
  })

  it('should not capture breakdown metrics by default', done => {
    config.events.observe(TRANSACTION_END, function() {
      expect(tr1.breakdownTimings.length).toBe(0)
      done()
    })

    const tr1 = transactionService.startTransaction('test1', 'custom')
    const span1 = tr1.startSpan('span1', 'app')
    span1.end()
    tr1.detectFinish()
  })

  it('should create unmanaged transactions by default', () => {
    expect(transactionService.currentTransaction).toBeUndefined()
    const tr1 = transactionService.startTransaction('test-name', 'test-type')
    expect(tr1.name).toBe('test-name')
    expect(transactionService.currentTransaction).toBeUndefined()
    spyOn(tr1, 'removeTask')
    spyOn(tr1, 'startSpan')
    transactionService.removeTask('testId')
    expect(tr1.removeTask).not.toHaveBeenCalled()
    transactionService.startSpan('test-name', 'test-type')
    expect(tr1.startSpan).not.toHaveBeenCalled()
    expect(tr1.spans.length).toBe(0)
  })

  it('should create managed transactions if the managed option is provided', () => {
    expect(transactionService.currentTransaction).toBeUndefined()
    const tr1 = transactionService.startTransaction('test-name', 'test-type', {
      managed: true
    })
    expect(tr1.name).toBe('test-name')
    expect(transactionService.currentTransaction).toBe(tr1)

    const tr2 = transactionService.startTransaction(
      'unmanaged-name',
      'unmanaged-type'
    )
    expect(transactionService.currentTransaction).toBe(tr1)

    const span = transactionService.startSpan(
      'test-span-name',
      'test-span-type'
    )
    span.end()
    expect(tr1.spans[0]).toBe(span)
    expect(tr2.spans.length).toBe(0)
    spyOn(tr2, 'addTask').and.callThrough()
    spyOn(tr2, 'removeTask').and.callThrough()
    spyOn(tr2, 'end')
    spyOn(tr1, 'addTask').and.callThrough()
    spyOn(tr1, 'removeTask').and.callThrough()
    spyOn(tr1, 'end')
    transactionService.addTask('taskId')
    expect(tr1.addTask).toHaveBeenCalledWith('taskId')
    expect(tr2.addTask).not.toHaveBeenCalled()

    transactionService.removeTask('taskId')
    expect(tr1.removeTask).toHaveBeenCalledWith('taskId')
    expect(tr1.end).toHaveBeenCalled()
    expect(tr2.removeTask).not.toHaveBeenCalled()
    expect(tr2.end).not.toHaveBeenCalled()
  })

  it('should not produce negative durations while adjusting to the spans', () => {
    const transaction = transactionService.startTransaction(
      'transaction',
      'transaction'
    )
    let span = transaction.startSpan('test', 'test')
    span.end()
    span._end += 100
    span = transaction.startSpan('test', 'external.http')

    span.end()
    span._start = 10000000
    span._end = 11000000
    transaction.end()
    transactionService.adjustTransactionTime(transaction)
    expect(span.duration()).toBe(0)
  })

  it('should adjust transaction start based on earliest span start', done => {
    const firstSpan = new Span('first-span-name', 'first-span')
    firstSpan.end()

    const transaction = transactionService.startTransaction('/', 'transaction')
    transaction.onEnd = () => {
      transactionService.adjustTransactionTime(transaction)
      expect(transaction._start).toBe(firstSpan._start)
      expect(transaction._end).toBeGreaterThanOrEqual(lastSpan._end)
      done()
    }
    transaction.spans.push(firstSpan)

    const lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()

    transaction.detectFinish()
  })

  it('should adjust transaction end based on latest span end', done => {
    const transaction = transactionService.startTransaction('/', 'transaction')
    const transactionStart = transaction._start

    const firstSpan = transaction.startSpan('first-span-name', 'first-span')
    firstSpan.end()
    const longSpan = transaction.startSpan('long-span-name', 'long-span')
    const lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()
    longSpan.end()
    longSpan.end += 500

    transaction.onEnd = () => {
      transactionService.adjustTransactionTime(transaction)
      expect(transaction._start).toBe(transactionStart)
      expect(transaction._end).toBeGreaterThanOrEqual(longSpan._end)
      done()
    }
    transaction.detectFinish()
  })

  it('should truncate active spans after transaction ends', () => {
    const transaction = transactionService.startTransaction(
      'transaction',
      'transaction'
    )
    const span = transaction.startSpan('test', 'test')
    expect(transaction.spans.length).toBe(0)
    expect(Object.keys(transaction._activeSpans).length).toBe(1)
    transaction.end()

    transactionService.adjustTransactionTime(transaction)
    expect(transaction.spans.length).toBe(1)
    expect(Object.keys(transaction._activeSpans).length).toBe(0)
    expect(span.type).toContain('.truncated')
  })

  it('should account for spans start > transaction start during breakdown', done => {
    config.setConfig({
      breakdownMetrics: true
    })
    const tr = transactionService.startTransaction('transaction', 'custom', {
      startTime: 10
    })
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 0 })
    sp1.end(15)
    const sp2 = tr.startSpan('bar', 'ext.http', { startTime: 5 })
    sp2.end(30)

    config.events.observe(TRANSACTION_END, () => {
      const breakdown = tr.breakdownTimings
      expect(breakdown[0].samples).toEqual({
        'transaction.duration.count': { value: 1 },
        'transaction.duration.sum.us': { value: 30 },
        'transaction.breakdown.count': { value: 1 }
      })
      expect(breakdown[1]).toEqual({
        transaction: { name: 'transaction', type: 'custom' },
        span: { type: 'app', subtype: undefined },
        samples: {
          'span.self_time.count': { value: 1 },
          'span.self_time.sum.us': { value: 0 }
        }
      })
      expect(breakdown[2]).toEqual({
        transaction: { name: 'transaction', type: 'custom' },
        span: { type: 'ext', subtype: 'http' },
        samples: {
          'span.self_time.count': { value: 2 },
          'span.self_time.sum.us': { value: 40 }
        }
      })
      done()
    })
    tr.end(30)
  })

  it('should start temporary transaction on startSpan', () => {
    expect(transactionService.getCurrentTransaction()).toBeUndefined()
    transactionService.startSpan('test', 'test')
    let tr = transactionService.getCurrentTransaction()
    expect(tr).toBeDefined()
    expect(tr.type).toBe('temporary')
  })

  it('should only call setInterval once for current transaction', () => {
    let origSetInterval = window.setInterval
    let origClearInterval = window.clearInterval
    let count = 0
    let callback

    window.setInterval = cb => {
      callback = cb
      return count++
    }

    let clearCount = 0

    window.clearInterval = () => {
      clearCount++
    }

    var tr = transactionService.startTransaction('test', 'test', {
      managed: true,
      canReuse: true
    })
    expect(transactionService.getCurrentTransaction()).toBe(tr)
    expect(count).toBe(1)
    expect(transactionService.respIntervalId).toBe(0)

    transactionService.startTransaction('test 1', 'test', {
      managed: true,
      canReuse: true
    })
    expect(transactionService.getCurrentTransaction()).toBe(tr)
    expect(tr.name).toBe('test 1')
    expect(count).toBe(1)

    transactionService.startTransaction('test 2', 'test', {
      managed: true,
      canReuse: false
    })
    expect(transactionService.getCurrentTransaction()).not.toBe(tr)
    expect(count).toBe(1)
    expect(clearCount).toBe(0)
    tr = transactionService.getCurrentTransaction()
    tr.end()

    callback()
    expect(transactionService.respIntervalId).toBe(undefined)
    expect(clearCount).toBe(1)

    window.clearInterval = origClearInterval
    window.setInterval = origSetInterval
  })

  it('should redefine type based on the defined order', () => {
    transactionService.startSpan('span 1', 'span-type')
    let tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('temporary')

    transactionService.startTransaction('test 1', 'random-type', {
      managed: true,
      canReuse: true
    })

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('temporary')

    transactionService.startTransaction('test 1', 'route-change', {
      managed: true,
      canReuse: true
    })

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('route-change')

    transactionService.startTransaction('test 1', 'page-load', {
      managed: true,
      canReuse: true
    })

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('page-load')

    transactionService.startTransaction('test 1', 'route-change', {
      managed: true,
      canReuse: true
    })

    transactionService.startTransaction('test 1', 'random-type', {
      managed: true,
      canReuse: true
    })

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('page-load')
  })
})
