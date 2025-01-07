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
import Span from '../../src/performance-monitoring/span'
import Config from '../../src/common/config-service'
import LoggingService from '../../src/common/logging-service'
import { mockGetEntriesByType } from '../utils/globals-mock'
import {
  TRANSACTION_END,
  PAGE_LOAD,
  ROUTE_CHANGE,
  TEMPORARY_TYPE,
  LONG_TASK,
  LARGEST_CONTENTFUL_PAINT,
  PAINT,
  TRUNCATED_TYPE,
  FIRST_INPUT,
  LAYOUT_SHIFT,
  LOCAL_CONFIG_KEY,
  TRANSACTION_IGNORE
} from '../../src/common/constants'
import { state } from '../../src/state'
import { isPerfTypeSupported } from '../../src/common/utils'
import Transaction from '../../src/performance-monitoring/transaction'
import { metrics } from '../../src/performance-monitoring/metrics/metrics'

describe('TransactionService', function () {
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

  beforeEach(function () {
    logger = new LoggingService()
    spyOn(logger, 'debug')

    config = new Config()
    spyOn(config, 'dispatchEvent').and.callThrough()
    transactionService = new TransactionService(logger, config)
  })

  it('should not start span when there is no current transaction', function () {
    transactionService.startSpan('test-span', 'test-span')
    expect(logger.debug).toHaveBeenCalled()
  })

  it('should call startSpan on current Transaction', function () {
    const tr = transactionService.createCurrentTransaction(
      'transaction',
      'transaction'
    )
    spyOn(tr, 'startSpan').and.callThrough()
    transactionService.startSpan('test-span', 'test-span', { test: 'passed' })
    expect(
      transactionService.getCurrentTransaction().startSpan
    ).toHaveBeenCalledWith('test-span', 'test-span', { test: 'passed' })
  })

  it('should start transaction', function (done) {
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
    result.onEnd = function () {
      var r = origCb.apply(this, arguments)
      done()
      return r
    }
    spyOn(result, 'onEnd').and.callThrough()
    var span = transactionService.startSpan('test', 'test', { blocking: true })
    result.detectFinish()
    expect(result.onEnd).not.toHaveBeenCalled()
    span.end()
    expect(result.onEnd).toHaveBeenCalled()
  })

  it('should create a reusable transaction on the first span', function () {
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
      },
      get: () => {}
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

  it('should capture page load on first transaction', function (done) {
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
    tr1.onEnd = function () {
      tr1DoneFn()
      expect(tr1.captureTimings).toBe(true)
      tr1.spans.forEach(function (t) {
        expect(t.duration()).toBeLessThan(5 * 60 * 1000)
        expect(t.duration()).toBeGreaterThan(-1)
      })
    }
    expect(tr1.captureTimings).toBe(true)
    tr1.detectFinish()

    var tr2 = transactionService.startTransaction('transaction2', 'transaction')
    expect(tr2.captureTimings).toBe(false)
    var tr2DoneFn = tr2.onEnd
    tr2.onEnd = function () {
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

  it('should reuse Transaction', function () {
    transactionService = new TransactionService(logger, config)
    const reusableTr = transactionService.createCurrentTransaction(
      'test-name',
      'test-type',
      {
        canReuse: true
      }
    )
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

  it('should use initial page load name before ending the transaction', function (done) {
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

  it('should set page load parentId before ending the transaction', function (done) {
    config.setConfig({
      pageLoadParentId: 'test-page-load-parent-id'
    })
    transactionService = new TransactionService(logger, config)

    const tr = transactionService.startTransaction(undefined, 'page-load', {
      managed: true
    })

    tr.detectFinish()

    /**
     * For page load transaction we set the transaction parentId using
     * transaction.onEnd
     */
    config.events.observe(TRANSACTION_END, tr => {
      expect(tr.parentId).toBe('test-page-load-parent-id')
      done()
    })
  })

  it('should capture resources from navigation timing', function (done) {
    const unMock = mockGetEntriesByType()

    const customTransactionService = new TransactionService(logger, config)
    config.events.observe(TRANSACTION_END, function () {
      expect(tr.captureTimings).toBe(true)
      expect(
        tr.spans.filter(({ type }) => type === 'resource').length
      ).toBeGreaterThanOrEqual(1)
      expect(
        tr.spans.filter(({ type }) => type === 'app').length
      ).toBeGreaterThanOrEqual(1)
      unMock()
      done()
    })

    const zoneTr = transactionService.createCurrentTransaction(
      'test',
      'test-transaction'
    )
    const span = zoneTr.startSpan('GET http://example.com', 'external.http')
    span.end()

    const tr = customTransactionService.startTransaction(
      'resource-test',
      PAGE_LOAD,
      { managed: true }
    )
    tr.detectFinish()
  })

  it('should ignore transactions that match the list', function () {
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

  it('should apply sampling to transactions', function () {
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

  it('should consider page load traceId and spanId', function (done) {
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
      unMock()
      done()
    })
  })

  it('should consider page load parentId', function () {
    config.setConfig({
      pageLoadParentId: 'test-page-load-parent-id'
    })

    transactionService = new TransactionService(logger, config)
    const tr = sendPageLoadMetrics()
    expect(tr.options.pageLoadParentId).toBe('test-page-load-parent-id')
  })

  it('should call createCurrentTransaction once per startTransaction', function () {
    spyOn(transactionService, 'createCurrentTransaction').and.callThrough()
    transactionService.startTransaction('test-name', 'test-type', {
      managed: true
    })
    expect(transactionService.createCurrentTransaction).toHaveBeenCalledTimes(1)
  })

  it('should include size & server timing in page load context', done => {
    const unMock = mockGetEntriesByType()
    const customTrService = new TransactionService(logger, config)
    config.events.observe(TRANSACTION_END, function () {
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
    config.events.observe(TRANSACTION_END, function () {
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
    spyOn(tr1, 'startSpan')
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

    const span1 = transactionService.startSpan('blocked-span', 'custom', {
      blocking: true
    })
    expect(tr1.addTask).toHaveBeenCalled()
    expect(tr2.addTask).not.toHaveBeenCalled()
    span1.end()
    expect(tr1.spans.length).toBe(2)
    expect(tr1.removeTask).toHaveBeenCalled()
    expect(tr1.end).toHaveBeenCalled()
    expect(tr2.removeTask).not.toHaveBeenCalled()
    expect(tr2.end).not.toHaveBeenCalled()
  })

  it('should not produce negative durations while adjusting to the spans', () => {
    const transaction = transactionService.startTransaction(
      'transaction',
      'transaction',
      {
        startTime: 10
      }
    )
    let span = transaction.startSpan('test', 'test')
    span.end(100)
    span = transaction.startSpan('test', 'external.http', {
      startTime: 10000000
    })

    span.end(11000000)

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
    const transaction = transactionService.startTransaction(
      '/',
      'transaction',
      { startTime: 10 }
    )

    const longSpan = transaction.startSpan('long-span-name', 'long-span', {
      startTime: 15
    })
    const lastSpan = transaction.startSpan('last-span-name', 'last-span', {
      startTime: 20
    })
    lastSpan.end(45)
    longSpan.end(60)

    transaction.onEnd = () => {
      transactionService.adjustTransactionTime(transaction)
      expect(transaction._start).toBe(10)
      expect(transaction._end).toBe(60)
      done()
    }

    transaction.end(50)
  })

  describe('page load transactions', () => {
    beforeEach(() => {
      metrics.lcp = undefined
    })

    it('should have its end time adjusted to match with LCP if it is the event that have lasted the most', done => {
      const transaction = transactionService.startTransaction('/', PAGE_LOAD, {
        startTime: 10
      })

      const span = transaction.startSpan('span-name', 'span')
      span.end(15)

      const externalSpan = transaction.startSpan('span-name', 'external')
      externalSpan.end(20)

      metrics.lcp = 25

      transaction.onEnd = () => {
        transactionService.adjustTransactionTime(transaction)
        expect(transaction._start).toBe(10)
        expect(transaction._end).toBe(metrics.lcp)
        done()
      }

      transaction.end(1000)
    })

    it('should have its end time adjusted to match with network request span it is the event that have lasted the most', done => {
      const transaction = transactionService.startTransaction('/', PAGE_LOAD, {
        startTime: 10
      })

      const span = transaction.startSpan('span-name', 'span')
      span.end(15)

      const externalSpan = transaction.startSpan('span-name', 'external')
      externalSpan.end(30)

      metrics.lcp = 20

      transaction.onEnd = () => {
        transactionService.adjustTransactionTime(transaction)
        expect(transaction._start).toBe(10)
        expect(transaction._end).toBe(30)
        done()
      }

      transaction.end(1000)
    })

    it('should have its end time adjusted to match with non-network request span it is the event that have lasted the most', done => {
      const transaction = transactionService.startTransaction('/', PAGE_LOAD, {
        startTime: 10
      })

      const span = transaction.startSpan('span-name', 'span')
      span.end(50)

      const externalSpan = transaction.startSpan('span-name', 'external')
      externalSpan.end(30)

      metrics.lcp = 20

      transaction.onEnd = () => {
        transactionService.adjustTransactionTime(transaction)
        expect(transaction._start).toBe(10)
        expect(transaction._end).toBe(50)
        done()
      }

      transaction.end(1000)
    })

    it('should subtract the page load delay from its end time if no event has occurred after page load', done => {
      const transaction = transactionService.startTransaction('/', PAGE_LOAD, {
        startTime: 10
      })

      const span = transaction.startSpan('span-name', 'span')
      span.end(15)

      const externalSpan = transaction.startSpan('span-name', 'external')
      externalSpan.end(20)

      transaction.onEnd = () => {
        const endBeforeAdjusting = transaction._end
        transactionService.adjustTransactionTime(transaction)
        expect(transaction._start).toBe(10)
        expect(transaction._end).toBe(endBeforeAdjusting - 1000)
        done()
      }

      // This represents the time when the page load has been triggered
      const pageLoadTime = 30

      transaction.end(pageLoadTime + 1000)
    })
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
    expect(span.type).toContain(TRUNCATED_TYPE)
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
      expect(breakdown[0]).toEqual({
        transaction: { name: 'transaction', type: 'custom' },
        span: { type: 'app', subtype: undefined },
        samples: {
          'span.self_time.count': { value: 1 },
          'span.self_time.sum.us': { value: 0 }
        }
      })
      expect(breakdown[1]).toEqual({
        transaction: { name: 'transaction', type: 'custom' },
        span: { type: 'ext', subtype: 'http' },
        samples: {
          'span.self_time.count': { value: 2 },
          'span.self_time.sum.us': { value: 40000 }
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

  it('should redefine type based on the defined order', () => {
    transactionService.startSpan('span 1', 'span-type')
    let tr = transactionService.getCurrentTransaction()
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

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('page-load')

    transactionService.startTransaction('test 1', 'custom-type', {
      managed: true,
      canReuse: true
    })

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('custom-type')

    transactionService.startTransaction('test 1', 'page-load', {
      managed: true,
      canReuse: true
    })

    tr = transactionService.getCurrentTransaction()
    expect(tr.type).toBe('custom-type')
  })

  it('should discard transaction if page has been hidden', async () => {
    let { lastHiddenStart } = state
    state.lastHiddenStart = performance.now() + 1000
    let tr = transactionService.startTransaction('test-name', 'test-type')
    await tr.end()
    expect(logger.debug).toHaveBeenCalledWith(
      `transaction(${tr.id}, ${tr.name}, ${tr.type}) was discarded! The page was hidden during the transaction!`
    )
    expect(config.dispatchEvent).toHaveBeenCalledWith(TRANSACTION_IGNORE)

    state.lastHiddenStart = performance.now() - 1000
    tr = transactionService.startTransaction('test-name', 'test-type')
    await tr.end()
    expect(logger.debug).not.toHaveBeenCalledWith(
      `transaction(${tr.id}, ${tr.name}, ${tr.type}) was discarded! The page was hidden during the transaction!`
    )
    state.lastHiddenStart = lastHiddenStart
  })

  it('should discard TEMPORARY_TYPE transactions', async () => {
    let tr = transactionService.startTransaction('test-name', TEMPORARY_TYPE)
    await tr.end()
    expect(logger.debug).toHaveBeenCalledWith(
      `transaction(${tr.id}, ${tr.name}, ${tr.type}) is ignored`
    )
    expect(config.dispatchEvent).toHaveBeenCalledWith(TRANSACTION_IGNORE)
  })

  it('should discard transaction configured to be ignored', async () => {
    config.setConfig({
      ignoreTransactions: ['ignore-tr']
    })
    let tr = transactionService.startTransaction('ignore-tr', 'type')
    await tr.end()
    config.setConfig({ ignoreTransactions: [] })
    expect(logger.debug).toHaveBeenCalledWith(
      `transaction(${tr.id}, ${tr.name}, ${tr.type}) is ignored`
    )
    expect(config.dispatchEvent).toHaveBeenCalledWith(TRANSACTION_IGNORE)
  })

  it('should set session information on transaction', () => {
    config.setConfig({ session: true })
    const tr = new Transaction('test', 'test')
    transactionService.setSession(tr)
    expect(tr.session.id).toBeDefined()
    let localConfig = config.getLocalConfig()
    expect(localConfig.session).toEqual({
      id: tr.session.id,
      sequence: 1,
      timestamp: jasmine.any(Number)
    })
    localStorage.removeItem(LOCAL_CONFIG_KEY)
  })

  it('should create a new session after the session timeout', () => {
    const clock = jasmine.clock()
    clock.install()
    clock.mockDate()
    config.setConfig({ session: true })
    const tr = new Transaction('test', 'test')
    transactionService.setSession(tr)
    expect(tr.session.id).toBeDefined()
    const firstConfig = config.getLocalConfig()
    const firstTime = firstConfig.session.timestamp
    expect(firstConfig.session).toEqual({
      id: tr.session.id,
      sequence: 1,
      timestamp: firstTime
    })

    clock.tick(500)
    const tr2 = new Transaction('tr2', 'test')
    transactionService.setSession(tr2)

    expect(tr2.session).toEqual({ id: tr.session.id, sequence: 2 })
    const secondConfig = config.getLocalConfig()
    expect(secondConfig.session.timestamp).toEqual(firstTime + 500)

    clock.tick(31 * 60000)

    const tr3 = new Transaction('tr3', 'test')
    transactionService.setSession(tr3)
    const thirdConfig = config.getLocalConfig()
    expect(tr3.session.id).not.toEqual(tr.session.id)
    expect(thirdConfig.session).toEqual({
      id: tr3.session.id,
      sequence: 1,
      timestamp: firstTime + 31 * 60000 + 500
    })

    localStorage.removeItem(LOCAL_CONFIG_KEY)
    clock.uninstall()
  })

  it('should allow setting session id through configuration', () => {
    config.setConfig({ session: { id: 123 } })
    const tr = new Transaction('test', 'test')
    transactionService.setSession(tr)
    expect(tr.session).toEqual({ id: 123, sequence: 1 })
    const tr2 = new Transaction('tr2', 'test')
    transactionService.setSession(tr2)
    expect(tr2.session).toEqual({ id: 123, sequence: 2 })
    const localConfig = config.getLocalConfig()
    expect(localConfig.session).toEqual({
      id: 123,
      sequence: 2,
      timestamp: jasmine.any(Number)
    })
  })

  describe('performance entry recorder', () => {
    const logger = new LoggingService()
    const config = new Config()
    const trService = new TransactionService(logger, config)
    const startSpy = jasmine.createSpy()
    const stopSpy = jasmine.createSpy()

    trService.recorder = {
      start: startSpy,
      stop: stopSpy
    }
    const resetSpies = () => {
      startSpy.calls.reset()
      stopSpy.calls.reset()
    }

    afterEach(() => resetSpies())

    it('should start/stop performance recorder for managed transaction', async () => {
      const pageLoadTr = trService.startTransaction('test', PAGE_LOAD, {
        managed: true
      })
      expect(startSpy).toHaveBeenCalledTimes(5)
      expect(startSpy.calls.allArgs()).toEqual([
        [LARGEST_CONTENTFUL_PAINT],
        [PAINT],
        [FIRST_INPUT],
        [LAYOUT_SHIFT],
        [LONG_TASK]
      ])
      await pageLoadTr.end()
      expect(stopSpy).toHaveBeenCalled()
      resetSpies()

      const routeChangeTr = trService.startTransaction('test', ROUTE_CHANGE, {
        managed: true
      })
      expect(startSpy).toHaveBeenCalled()
      expect(startSpy.calls.allArgs()).toEqual([[LONG_TASK]])
      await routeChangeTr.end()
      expect(stopSpy).toHaveBeenCalled()
    })

    it('should start recorder only once during redefining', async () => {
      const managed1 = trService.startTransaction('test', 'test', {
        managed: true,
        canReuse: true
      })
      expect(startSpy).toHaveBeenCalledWith(LONG_TASK)
      const managed2 = trService.startTransaction('test', 'custom', {
        managed: true,
        canReuse: true
      })
      expect(startSpy).toHaveBeenCalledTimes(1)
      await managed1.end()
      await managed2.end()

      expect(stopSpy).toHaveBeenCalledTimes(1)
    })

    it('should stop recorder before starting a non-reusable transaction', async () => {
      const managedReusable = trService.startTransaction('test', 'test', {
        managed: true,
        canReuse: true
      })
      expect(startSpy).toHaveBeenCalledWith(LONG_TASK)
      const managedNonReusable = trService.startTransaction('test', 'custom', {
        managed: true
      })
      expect(startSpy.calls.allArgs()).toEqual([[LONG_TASK], [LONG_TASK]])
      expect(stopSpy).toHaveBeenCalled()
      await managedReusable.end()
      await managedNonReusable.end()
      expect(stopSpy).toHaveBeenCalledTimes(2)
    })

    it('should not record longtasks when monitorLongtasks is false', async () => {
      config.setConfig({
        monitorLongtasks: false
      })
      const pageLoadTr = trService.startTransaction('test', PAGE_LOAD, {
        managed: true
      })
      expect(startSpy).toHaveBeenCalledTimes(4)
      expect(startSpy.calls.allArgs()).toEqual([
        [LARGEST_CONTENTFUL_PAINT],
        [PAINT],
        [FIRST_INPUT],
        [LAYOUT_SHIFT]
      ])
      await pageLoadTr.end()
      expect(stopSpy).toHaveBeenCalled()
      resetSpies()

      const routeChangeTr = trService.startTransaction('test', ROUTE_CHANGE, {
        managed: true
      })
      expect(startSpy).not.toHaveBeenCalled()
      await routeChangeTr.end()
      expect(stopSpy).toHaveBeenCalled()
    })

    it('should set experience on Transaction', async () => {
      const tr = trService.startTransaction('test', PAGE_LOAD, {
        managed: true
      })
      expect(tr.captureTimings).toBe(true)
      await tr.end()
      expect(tr.experience).toBeDefined()
      if (isPerfTypeSupported(LONG_TASK)) {
        expect(tr.experience.tbt).toBeGreaterThanOrEqual(0)
      }
      if (isPerfTypeSupported(LAYOUT_SHIFT)) {
        expect(tr.experience.cls).toBeGreaterThanOrEqual(0)
      }
    })
  })
})
