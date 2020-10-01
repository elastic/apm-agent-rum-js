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
import {
  groupSmallContinuouslySimilarSpans,
  adjustTransactionSpans
} from '../../src/performance-monitoring/performance-monitoring'
import { getGlobalConfig } from '../../../../dev-utils/test-config'
import { waitFor } from '../../../../dev-utils/jasmine'
import { getDtHeaderValue } from '../../src/common/utils'
import { globalState } from '../../src/common/patching/patch-utils'
import { patchEventHandler as originalPatchHandler } from '../../src/common/patching'
import {
  SCHEDULE,
  FETCH,
  XMLHTTPREQUEST,
  HISTORY,
  EVENT_TARGET,
  PAGE_LOAD,
  ROUTE_CHANGE,
  TRANSACTION_END,
  TRANSACTIONS
} from '../../src/common/constants'
import { state } from '../../src/state'
import patchEventHandler from '../common/patch'
import { mockGetEntriesByType } from '../utils/globals-mock'
import resourceEntries from '../fixtures/resource-entries'

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
    const payload = performanceMonitoring.createTransactionDataModel(tr)
    var promise = apmServer.sendEvents([
      {
        [TRANSACTIONS]: payload
      }
    ])
    expect(promise).toBeDefined()
    promise
      .catch(reason => {
        fail('Failed sending transactions to the server, reason: ' + reason)
      })
      .then(() => done())
  })

  it('should filter transactions based on duration and spans', () => {
    spyOn(logger, 'debug').and.callThrough()
    const transaction1 = new Transaction('test', 'custom', {
      id: 1,
      startTime: 0,
      managed: true
    })
    transaction1.end(60001)
    expect(transaction1.duration()).toBe(60001)
    expect(performanceMonitoring.filterTransaction(transaction1)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'transaction(1, test) was discarded! Transaction duration (60001) is greater than managed transaction threshold (60000)'
    )
    logger.debug.calls.reset()

    const transaction3 = new Transaction(null, null, { id: 3 })
    expect(performanceMonitoring.filterTransaction(transaction3)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      "transaction(3, Unknown) was discarded! Transaction wasn't ended"
    )
    logger.debug.calls.reset()

    const transaction4 = new Transaction('', '', { id: 4 })
    transaction4.end()
    transaction4._start = transaction4._end = 0
    expect(performanceMonitoring.filterTransaction(transaction4)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'transaction(4, Unknown) was discarded! Transaction duration is 0'
    )
  })

  it('should initialize and add transaction to the queue', async () => {
    performanceMonitoring.init()
    spyOn(apmServer, 'addTransaction')

    const tr = performanceMonitoring._transactionService.startTransaction(
      'transaction',
      'transaction',
      { startTime: 0 }
    )
    let span = tr.startSpan('test span', 'test span type', { startTime: 0 })
    span.end(100)
    span = tr.startSpan('test span 2', 'test span type', { startTime: 20 })
    span.end(300)
    tr.end(400)

    await waitFor(() => apmServer.addTransaction.calls.any())

    expect(apmServer.addTransaction).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'transaction',
        type: 'transaction'
      })
    )
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
    tr._end = span._end + 100

    var payload = performanceMonitoring.createTransactionPayload(tr)
    expect(payload.name).toBe('transaction1')
    expect(payload.type).toBe('transaction1type')
    expect(payload.spans.length).toBe(1)
    expect(payload.spans[0].name).toBe('span1')
    expect(payload.spans[0].type).toBe('span1type')
    expect(payload.spans[0].start).toBe(parseInt(span._start - tr._start))
    expect(payload.spans[0].duration).toBe(parseInt(span._end - span._start))
  })

  it('should sendPageLoadMetrics', function(done) {
    const unMock = mockGetEntriesByType()
    const transactionService = serviceFactory.getService('TransactionService')

    configService.events.observe(TRANSACTION_END, function(tr) {
      expect(tr.captureTimings).toBe(true)
      const payload = performanceMonitoring.createTransactionDataModel(tr)
      var promise = apmServer.sendEvents([
        {
          [TRANSACTIONS]: payload
        }
      ])
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
    const tr = transactionService.startTransaction('resource-test', PAGE_LOAD, {
      managed: true
    })
    tr.detectFinish()
  })

  it('should filter out empty transactions', function() {
    var tr = new Transaction('test', 'test', {
      transactionSampleRate: 1,
      startTime: 0
    })
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

    tr.end(100)
    expect(tr.duration()).toBe(100)
    result = performanceMonitoring.filterTransaction(tr)
    expect(result).toBe(true)
  })

  it('should filter managed transactions with duration above threshold', function() {
    var tr = new Transaction('/test/outlier', 'page-load-slow', {
      startTime: 0,
      managed: true
    })
    var span1 = new Span('span 1', 'test-span')
    span1.end()
    tr.spans.push(span1)
    tr.end(60001)
    var payload = performanceMonitoring.createTransactionPayload(tr)
    expect(payload).toBeUndefined()
    var promise = apmServer.sendEvents([
      {
        [TRANSACTIONS]: payload
      }
    ])
    expect(promise).toBeUndefined()
  })

  it('should correctly use xhr patch', function(done) {
    var fn = performanceMonitoring.getXHRSub()
    expect(typeof fn).toBe('function')
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    spyOn(req, 'setRequestHeader').and.callThrough()
    var task = {
      source: XMLHTTPREQUEST,
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
    var fn = performanceMonitoring.getXHRSub()
    expect(typeof fn).toBe('function')
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    var task = {
      source: XMLHTTPREQUEST,
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
      const origBootstrapTime = state.bootstrapTime
      // ignore capturing resource timing spans
      state.bootstrapTime = 0
      var fn = performanceMonitoring.getFetchSub()
      var dTHeaderValue
      const cancelFetchSub = patchEventHandler.observe(FETCH, function(
        event,
        task
      ) {
        fn(event, task)
        if (event === SCHEDULE) {
          dTHeaderValue = task.data.target.headers.get(
            configService.get('distributedTracingHeaderName')
          )
        }
      })
      var transactionService = performanceMonitoring._transactionService
      var tr = transactionService.startTransaction(
        'fetch transaction',
        'custom',
        { managed: true }
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
            },
            destination: {
              service: {
                name: 'http://localhost:9876',
                resource: 'localhost:9876',
                type: 'external'
              },
              address: 'localhost',
              port: 9876
            }
          })
          expect(dTHeaderValue).toBeDefined()
          cancelFetchSub()
          state.bootstrapTime = origBootstrapTime
          done()
        })
      })
      expect(transactionService.startSpan).toHaveBeenCalledWith(
        'GET /',
        'external.http',
        { blocking: true }
      )
    })

    it('should redact auth from xhr tasks', () => {
      const fn = performanceMonitoring.getXHRSub()
      const transactionService = performanceMonitoring._transactionService
      const fakeXHRTask = {
        source: XMLHTTPREQUEST,
        data: {
          method: 'GET',
          url: 'https://a:b@c.com/d?e=10&f=20'
        }
      }
      spyOn(transactionService, 'startSpan').and.callThrough()
      fn(SCHEDULE, fakeXHRTask)

      expect(
        transactionService.startSpan
      ).toHaveBeenCalledWith(
        'GET https://[REDACTED]:[REDACTED]@c.com/d',
        'external.http',
        { blocking: true }
      )
    })

    it('should not duplicate xhr spans if fetch is a polyfill', function(done) {
      const origBootstrapTime = state.bootstrapTime
      // ignore capturing resource timing spans
      state.bootstrapTime = 0
      const xhrFn = performanceMonitoring.getXHRSub()
      const fetchFn = performanceMonitoring.getFetchSub()

      const events = []
      const cancelXHRSub = patchEventHandler.observe(XMLHTTPREQUEST, function(
        event,
        task
      ) {
        events.push({ event, source: task.source })
        xhrFn(event, task)
      })
      const cancelFetchSub = patchEventHandler.observe(FETCH, function(
        event,
        task
      ) {
        events.push({ event, source: task.source })
        fetchFn(event, task)
      })

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
        'custom',
        { managed: true }
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
              source: FETCH
            },
            {
              event: 'schedule',
              source: XMLHTTPREQUEST
            },
            {
              event: 'invoke',
              source: XMLHTTPREQUEST
            },
            {
              event: 'invoke',
              source: FETCH
            }
          ])
          cancelXHRSub()
          cancelFetchSub()
          state.bootstrapTime = origBootstrapTime
          done()
        })
      })

      window['__fetchDelegate'] = undefined
    })
  }

  it('should add xhr tasks', function(done) {
    var fn = performanceMonitoring.getXHRSub()
    var transactionService = performanceMonitoring._transactionService
    var tr = transactionService.startTransaction('task transaction', 'custom', {
      managed: true
    })
    expect(typeof fn).toBe('function')
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)

    var task = {
      source: XMLHTTPREQUEST,
      data: {
        target: req
      }
    }
    req.addEventListener('readystatechange', function() {
      if (req.readyState === req.DONE) {
        fn('invoke', task)
        expect(tr._activeTasks.size).toBe(0)
        expect(tr.ended).toBeTruthy()
        done()
      }
    })
    fn('schedule', task)
    expect(tr._activeTasks.size).toBe(1)
    req.send()
  })

  it('should create Transactions on history.pushState', function() {
    const historySubFn = performanceMonitoring.getHistorySub()
    const cancelHistorySub = patchEventHandler.observe(HISTORY, historySubFn)
    const transactionService = performanceMonitoring._transactionService

    spyOn(transactionService, 'startTransaction').and.callThrough()

    history.pushState(undefined, 'test', 'test')

    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      'test',
      ROUTE_CHANGE,
      { canReuse: true, managed: true }
    )
    cancelHistorySub()
  })

  it('should subscribe to events based on instrumentation flags', () => {
    spyOn(originalPatchHandler, 'observe')
    performanceMonitoring.init({
      [HISTORY]: false,
      [XMLHTTPREQUEST]: true,
      [FETCH]: true
    })

    expect(originalPatchHandler.observe.calls.argsFor(0)).toEqual([
      XMLHTTPREQUEST,
      jasmine.any(Function)
    ])

    expect(originalPatchHandler.observe.calls.argsFor(1)).toEqual([
      FETCH,
      jasmine.any(Function)
    ])
  })

  function createXHRTask(method, url) {
    let req = new window.XMLHttpRequest()
    req.open(method, url)

    let task = {
      source: XMLHTTPREQUEST,
      data: {
        target: req,
        method,
        url
      }
    }
    return task
  }

  it('should create http-request transaction if no current transaction exist', done => {
    const transactionService = serviceFactory.getService('TransactionService')
    spyOn(transactionService, 'startTransaction').and.callThrough()

    let task = createXHRTask('GET', '/')

    performanceMonitoring.processAPICalls('schedule', task)
    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      'GET /',
      'http-request',
      jasmine.objectContaining({ managed: true })
    )

    let tr = transactionService.getCurrentTransaction()
    expect(tr).toBeDefined()

    setTimeout(() => {
      performanceMonitoring.processAPICalls('invoke', task)
      expect(tr.ended).toBe(true)
      const payload = performanceMonitoring.createTransactionDataModel(tr)
      apmServer
        .sendEvents([
          {
            [TRANSACTIONS]: payload
          }
        ])
        .then(done, reason => {
          done.fail(
            `Failed sending http-request transaction to the server, reason: ${reason}`
          )
        })
    }, 100)
  })

  it('should include multiple XHRs in the same transaction', () => {
    const transactionService = serviceFactory.getService('TransactionService')
    spyOn(transactionService, 'startTransaction').and.callThrough()

    let task1 = createXHRTask('GET', '/first')
    performanceMonitoring.processAPICalls('schedule', task1)
    let tr = transactionService.getCurrentTransaction()
    expect(tr).toBeDefined()
    expect(tr.name).toBe('GET /first')

    let task2 = createXHRTask('GET', '/second')
    performanceMonitoring.processAPICalls('schedule', task2)
    performanceMonitoring.processAPICalls('invoke', task1)
    expect(tr.ended).toBeFalsy()
    performanceMonitoring.processAPICalls('invoke', task2)
    expect(tr.ended).toBe(true)
    expect(tr.spans.length).toBe(2)
    expect(tr.spans.map(s => s.name)).toEqual(['GET /first', 'GET /second'])

    let task3 = createXHRTask('GET', '/third')
    performanceMonitoring.processAPICalls('schedule', task3)
    tr = transactionService.getCurrentTransaction()
    expect(tr.name).toBe('GET /third')
    performanceMonitoring.processAPICalls('invoke', task3)
    expect(tr.ended).toBe(true)
  })

  it('should send span context destination details to apm-server', done => {
    const transactionService = serviceFactory.getService('TransactionService')

    const tr = transactionService.startTransaction('with-context', 'custom')
    const data = {
      url: 'http://localhost:3000/b/c',
      method: 'GET',
      target: {
        status: 200
      }
    }
    const xhrSpan = tr.startSpan(`GET ${data.url}`, 'external')
    xhrSpan.end(null, data)

    const resourceUrl = 'http://example.com'
    const rtData = {
      url: resourceUrl,
      entry: resourceEntries.filter(({ name }) => name === resourceUrl)[0]
    }
    const rtSpan = tr.startSpan(rtData.url, 'resource')
    rtSpan.end(null, rtData)

    configService.events.observe(TRANSACTION_END, () => {
      expect(tr.spans.length).toBe(2)
      const [span1, span2] = tr.spans
      expect(span1.context.destination).toBeDefined()
      expect(span2.context.destination).toBeDefined()

      const payload = performanceMonitoring.createTransactionDataModel(tr)
      expect(payload.spans[0].context.destination).toBeDefined()
      expect(payload.spans[1].context.destination).toBeDefined()

      apmServer
        .sendEvents([
          {
            [TRANSACTIONS]: payload
          }
        ])
        .then(done, reason => {
          done.fail(
            `Failed sending span destination context details, reason: ${reason}`
          )
        })
    })

    tr.end()
  })

  it('should filter only sampled transaction without spans', () => {
    spyOn(logger, 'debug').and.callThrough()
    const sampledTr = new Transaction('test', 'custom', {
      startTime: 0,
      transactionSampleRate: 1,
      managed: true,
      id: 1
    })
    sampledTr.end(100)
    expect(performanceMonitoring.filterTransaction(sampledTr)).toBe(false)
    expect(logger.debug).toHaveBeenCalledWith(
      'transaction(1, test) was discarded! Transaction does not have any spans'
    )

    logger.debug.calls.reset()

    const unsampledTr = new Transaction('test', 'custom', {
      startTime: 0,
      transactionSampleRate: 0,
      managed: true,
      id: 2
    })
    unsampledTr.end(100)
    expect(performanceMonitoring.filterTransaction(unsampledTr)).toBe(true)
    expect(logger.debug).not.toHaveBeenCalled()
  })

  if (window.EventTarget) {
    it('should create click transactions', () => {
      let transactionService = performanceMonitoring._transactionService
      let etsub = performanceMonitoring.getEventTargetSub()
      patchEventHandler.observe(EVENT_TARGET, (event, task) => {
        etsub(event, task)
      })
      let element = document.createElement('button')
      element.setAttribute('class', 'cool-button purchase-style')

      const listener = e => {
        expect(e.type).toBe('click')
      }

      element.addEventListener('click', listener)
      element.click()

      let tr = transactionService.getCurrentTransaction()
      expect(tr).toBeDefined()
      expect(tr.name).toBe('Click - button')
      expect(tr.context.custom).toEqual({
        classes: 'cool-button purchase-style'
      })
      expect(tr.type).toBe('user-interaction')

      element.setAttribute('name', 'purchase')
      element.click()
      let newTr = transactionService.getCurrentTransaction()

      expect(newTr).toBe(tr)
      expect(newTr.name).toBe('Click - button["purchase"]')
    })

    it('should respect the transaction type priority order', function() {
      const historySubFn = performanceMonitoring.getHistorySub()
      const cancelHistorySub = patchEventHandler.observe(HISTORY, historySubFn)
      let etsub = performanceMonitoring.getEventTargetSub()
      const cancelEventTargetSub = patchEventHandler.observe(
        EVENT_TARGET,
        (event, task) => {
          etsub(event, task)
        }
      )
      const transactionService = performanceMonitoring._transactionService

      let element = document.createElement('button')
      element.setAttribute('name', 'purchase')

      const listener = () => {
        let tr = transactionService.getCurrentTransaction()
        expect(tr.type).toBe('user-interaction')
        history.pushState(undefined, undefined, 'test')
      }

      element.addEventListener('click', listener)
      element.click()

      let tr = transactionService.getCurrentTransaction()
      expect(tr.name).toBe('Click - button["purchase"]')
      expect(tr.type).toBe('route-change')

      cancelHistorySub()
      cancelEventTargetSub()
    })
  }

  it('should set outcome on transaction and spans', done => {
    let transactionService = performanceMonitoring._transactionService

    let task = createXHRTask('GET', '/')

    performanceMonitoring.processAPICalls('schedule', task)
    let tr = transactionService.getCurrentTransaction()

    let spanTask = createXHRTask('GET', '/span')
    performanceMonitoring.processAPICalls('schedule', spanTask)

    spanTask.data.target = { status: 200 }
    performanceMonitoring.processAPICalls('invoke', spanTask)

    expect(tr.type).toBe('http-request')
    expect(task.data.target.status).toBe(0)
    performanceMonitoring.processAPICalls('invoke', task)
    expect(tr.ended).toBe(true)
    expect(tr.outcome).toBe('failure')
    expect(tr.spans.length).toBe(2)
    expect(tr.spans[0].outcome).toBe('success')
    expect(tr.spans[1].outcome).toBe('failure')

    const payload = performanceMonitoring.createTransactionDataModel(tr)
    expect(payload.outcome).toBe('failure')
    expect(payload.spans[0].outcome).toBe('success')
    const promise = apmServer.sendEvents([
      {
        [TRANSACTIONS]: payload
      }
    ])
    expect(promise).toBeDefined()
    promise
      .catch(reason => {
        fail('Failed sending transactions to the server, reason: ' + reason)
      })
      .then(() => done())
  })

  describe('PerformanceMonitoring Utils', () => {
    it('should group small continuously similar spans up until the last one', function() {
      var tr = new Transaction('transaction', 'transaction', { startTime: 10 })
      var span1 = tr.startSpan('name', 'type', { startTime: 10 })
      span1.end(30)
      var span2 = tr.startSpan('name', 'type', { startTime: 31 })
      span2.end(35)
      var span3 = tr.startSpan('another-name', 'type', { startTime: 35 })
      span3.end(45)
      var span4 = tr.startSpan('name', 'type', { startTime: 50 })
      span4.end(60)
      var span5 = tr.startSpan('name', 'type', { startTime: 61 })
      span5.end(70)
      tr.end(1000)

      var grouped = groupSmallContinuouslySimilarSpans(
        tr.spans,
        tr.duration(),
        0.05
      )
      expect(grouped.length).toBe(3)
      expect(grouped[0].name).toBe('2x name')
      expect(grouped[1].name).toBe('another-name')
      expect(grouped[2].name).toBe('2x name')
    })

    it('should group small continuously similar spans', function() {
      var tr = new Transaction('transaction', 'transaction', { startTime: 10 })
      var span1 = tr.startSpan('name', 'type', { startTime: 20 })
      span1.end(30)
      var span2 = tr.startSpan('name', 'type', { startTime: 31 })
      span2.end(35)
      var span3 = tr.startSpan('name', 'type', { startTime: 35 })
      span3.end(45)
      var span4 = tr.startSpan('name', 'type', { startTime: 50 })
      span4.end(60)
      var span5 = tr.startSpan('another-name', 'type', { startTime: 60 })
      span5.end(70)
      tr.end(1000)

      var grouped = groupSmallContinuouslySimilarSpans(
        tr.spans,
        tr.duration(),
        0.05
      )
      expect(grouped.length).toBe(2)
      expect(grouped[0].name).toBe('4x name')
      expect(grouped[1].name).toBe('another-name')
    })

    it('should reset spans for unsampled transactions', function() {
      const tr = new Transaction('unsampled', 'test', {
        transactionSampleRate: 0,
        startTime: 0
      })
      const span = tr.startSpan('span1', 'type1', { startTime: 10 })
      span.end(20)
      tr.end(30)
      expect(tr.spans.length).toBe(1)
      const adjustedTransaction = adjustTransactionSpans(tr)
      expect(adjustedTransaction.spans.length).toBe(0)
    })
  })
})
