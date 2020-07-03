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

import ApmBase from '../../src/apm-base'
import {
  createServiceFactory,
  bootstrap,
  PAGE_LOAD
} from '@elastic/apm-rum-core'
import { TRANSACTION_END } from '@elastic/apm-rum-core/src/common/constants'
import { getGlobalConfig } from '../../../../dev-utils/test-config'
import Promise from 'promise-polyfill'
import { scheduleTaskCycles } from '../../../rum-core/test'

var enabled = bootstrap()
const { serviceName, serverUrl } = getGlobalConfig('rum').agentConfig

describe('ApmBase', function() {
  let serviceFactory
  let apmBase
  beforeEach(function() {
    serviceFactory = createServiceFactory()
    apmBase = new ApmBase(serviceFactory, !enabled)
  })

  it('should send page load metrics after load event', done => {
    apmBase.config({ serviceName, serverUrl })
    apmBase._sendPageLoadMetrics()
    var tr = apmBase.getCurrentTransaction()
    expect(tr.name).toBe('Unknown')
    expect(tr.type).toBe(PAGE_LOAD)
    spyOn(tr, 'detectFinish').and.callThrough()

    apmBase.setInitialPageLoadName('new page load')
    apmBase.observe(TRANSACTION_END, endedTr => {
      expect(endedTr).toEqual(tr)
      expect(document.readyState).toBe('complete')
      expect(tr.detectFinish).toHaveBeenCalled()
      expect(tr.name).toBe('new page load')
      expect(tr.type).toBe(PAGE_LOAD)
      done()
    })
  })

  it('should disable all auto instrumentations when instrument is false', () => {
    const trService = serviceFactory.getService('TransactionService')
    const ErrorLogging = serviceFactory.getService('ErrorLogging')
    const loggingInstane = ErrorLogging['__proto__']
    spyOn(loggingInstane, 'registerListeners')

    apmBase.init({
      serviceName,
      serverUrl,
      instrument: false
    })
    /**
     * Page load transaction and error listeners are disabled
     */
    expect(trService.getCurrentTransaction()).toBeUndefined()
    expect(loggingInstane.registerListeners).not.toHaveBeenCalled()
  })

  it('should selectively enable/disable instrumentations based on config', () => {
    const trService = serviceFactory.getService('TransactionService')
    const ErrorLogging = serviceFactory.getService('ErrorLogging')
    const loggingInstane = ErrorLogging['__proto__']
    spyOn(loggingInstane, 'registerListeners')

    apmBase.init({
      serviceName,
      serverUrl,
      instrument: true,
      disableInstrumentations: [PAGE_LOAD]
    })
    expect(trService.getCurrentTransaction()).toBeUndefined()
    expect(loggingInstane.registerListeners).toHaveBeenCalled()
  })

  it('should allow custom instrumentations via API when instrument is false', () => {
    apmBase.init({
      serviceName,
      serverUrl,
      instrument: false,
      flushInterval: 1
    })
    /**
     * Drop the payload
     */
    apmBase.addFilter(() => {})
    const tr = apmBase.startTransaction('custom-tr', 'custom')
    expect(tr.name).toBe('custom-tr')
    expect(tr.type).toBe('custom')
    const span = apmBase.startSpan('custom-span', 'app')
    expect(span.name).toBe('custom-span')
    expect(span.type).toBe('app')
    span.end()
    tr.end()
  })

  it('should be noop for auto instrumentaion when agent is not active', done => {
    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'info')

    apmBase.init({
      active: false
    })
    /**
     * Start a XHR which shouldn't be captured as transaction
     */
    const req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener('load', function() {
      setTimeout(() => {
        const tr = apmBase.getCurrentTransaction()
        expect(tr).toBeUndefined()
        expect(loggingService.info).toHaveBeenCalledWith(
          'RUM agent is inactive'
        )
        done()
      })
    })

    req.send()
  })

  it('should be noop when API methods are used and agent is not active', () => {
    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'info')

    apmBase.init({
      active: false
    })
    expect(loggingService.info).toHaveBeenCalledWith('RUM agent is inactive')
    const tr = apmBase.startTransaction('test')
    const span = apmBase.startSpan('span1')

    expect(tr).toBeUndefined()
    expect(span).toBeUndefined()
    expect(apmBase.getCurrentTransaction()).toBeUndefined()
  })

  it('should provide the public api', function() {
    apmBase.init({ serviceName, serverUrl })
    apmBase.setInitialPageLoadName('test')
    var configService = serviceFactory.getService('ConfigService')

    expect(configService.get('pageLoadTransactionName')).toBe('test')

    var tr = apmBase.startTransaction('test-transaction', 'test-type', {
      managed: true,
      canReuse: true
    })
    expect(tr).toBeDefined()
    expect(tr.name).toBe('test-transaction')
    expect(tr.type).toBe('test-type')

    spyOn(tr, 'startSpan').and.callThrough()
    apmBase.startSpan('test-span', 'test-type')
    expect(tr.startSpan).toHaveBeenCalledWith(
      'test-span',
      'test-type',
      undefined
    )

    expect(apmBase.getCurrentTransaction()).toBe(tr)

    var filter = function() {}
    apmBase.addFilter(filter)
    expect(configService.filters.length).toBe(1)
    expect(configService.filters[0]).toBe(filter)

    apmBase.config({ testConfig: 'test' })
    expect(configService.config.testConfig).toBe('test')
  })

  it('should instrument xhr', function(done) {
    apmBase.init({ serviceName, serverUrl })
    var tr = apmBase.startTransaction('test-transaction', 'test-type', {
      managed: true
    })
    expect(tr).toBeDefined()
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener('load', function() {
      scheduleTaskCycles(() => {
        expect(tr.spans.length).toBe(1)
        expect(tr.spans[0].name).toBe('GET /')
        done()
      }, 2)
    })

    req.send()
  })

  it('should instrument xhr when no transaction was started', function(done) {
    apmBase.init({
      disableInstrumentations: [PAGE_LOAD],
      serviceName,
      serverUrl
    })
    var transactionService = serviceFactory.getService('TransactionService')
    transactionService.currentTransaction = undefined
    var tr
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener('load', function() {
      scheduleTaskCycles(() => {
        expect(tr.spans.length).toBe(1)
        expect(tr.spans[0].name).toBe('GET /')
        done()
      }, 2)
    })
    req.send()
    tr = apmBase.getCurrentTransaction()
    expect(tr).toBeDefined()
    expect(tr.name).toBe('GET /')
  })

  it('should patch xhr when not active', function(done) {
    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'info')

    apmBase.init({ active: false })

    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener('load', function() {
      setTimeout(() => {
        /**
         * We patch and register symbols on the native XHR with
         * our own APM symbol keys
         */
        expect(Object.keys(req).length).toBeGreaterThanOrEqual(5)
        done()
      })
    })
    req.send()
    const tr = apmBase.getCurrentTransaction()
    expect(tr).toBeUndefined()
    expect(loggingService.info).toHaveBeenCalledWith('RUM agent is inactive')
  })

  it('should log errors when config is invalid', () => {
    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'info')
    const logErrorSpy = spyOn(loggingService, 'error')
    apmBase.init({
      serverUrl: undefined,
      serviceName: ''
    })
    expect(loggingService.error).toHaveBeenCalledWith(
      `RUM agent isn't correctly configured. serverUrl, serviceName is missing`
    )
    const configService = serviceFactory.getService('ConfigService')
    expect(configService.get('active')).toEqual(false)

    logErrorSpy.calls.reset()
    apmBase.config({
      serverUrl: '',
      serviceName: 'abc.def'
    })
    expect(loggingService.error).toHaveBeenCalledWith(
      `RUM agent isn't correctly configured. serverUrl is missing, serviceName "abc.def" contains invalid characters! (allowed: a-z, A-Z, 0-9, _, -, <space>)`
    )

    logErrorSpy.calls.reset()
    apmBase.config({
      serviceName: 'abc.def'
    })
    expect(loggingService.error).toHaveBeenCalledWith(
      `RUM agent isn't correctly configured. serviceName "abc.def" contains invalid characters! (allowed: a-z, A-Z, 0-9, _, -, <space>)`
    )
  })

  it('should instrument sync xhr', function(done) {
    apmBase.init({ serviceName, serverUrl })
    var tr = apmBase.startTransaction('test-transaction', 'test-type', {
      managed: true
    })
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', false)
    req.addEventListener('load', function() {
      done()
    })

    req.send()

    expect(tr.spans.length).toBe(1)
    expect(tr.spans[0].name).toBe('GET /')
  })

  it('should allow setting labels before calling init', () => {
    const labels = {
      foo: '1',
      bar: 2
    }
    apmBase.addLabels(labels)
    apmBase.init({
      serviceName,
      serverUrl,
      disableInstrumentations: [PAGE_LOAD]
    })
    const configService = serviceFactory.getService('ConfigService')
    expect(configService.get('context.tags')).toEqual(labels)
  })

  it('should fetch central config', done => {
    const apmServer = serviceFactory.getService('ApmServer')
    const configService = serviceFactory.getService('ConfigService')

    spyOn(configService, 'setLocalConfig')
    spyOn(configService, 'getLocalConfig')

    const apmBase = new ApmBase(serviceFactory, !enabled)
    apmBase.init({
      serviceName: 'test-service',
      disableInstrumentations: [PAGE_LOAD]
    })

    expect(configService.get('transactionSampleRate')).toBe(1.0)

    function createPayloadCallback(rate) {
      return () => {
        const responseText = `{
          "transaction_sample_rate": "${rate}"
        }
        `
        return Promise.resolve({
          responseText,
          getResponseHeader(headerName) {
            if (headerName == 'etag') {
              return '"test"'
            }
          },
          status: 200
        })
      }
    }

    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'warn')
    apmServer._makeHttpRequest = createPayloadCallback('test')
    apmBase
      .fetchCentralConfig()
      .then(() => {
        expect(loggingService.warn).toHaveBeenCalledWith(
          'invalid value "NaN" for transactionSampleRate. Allowed: Number between 0 and 1.'
        )
        expect(configService.get('transactionSampleRate')).toBe(1)

        apmServer._makeHttpRequest = createPayloadCallback('0.5')
        apmBase
          .fetchCentralConfig()
          .then(() => {
            expect(configService.get('transactionSampleRate')).toBe(0.5)
            done()
          })
          .catch(fail)
      })
      .catch(fail)
  })

  it('should wait for remote config before sending the page load', done => {
    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(apmBase, 'fetchCentralConfig').and.callThrough()
    spyOn(apmBase, '_sendPageLoadMetrics').and.callFake(() => {
      done()
    })

    apmBase.init({
      serviceName,
      centralConfig: true,
      serverUrl
    })
    /**
     * avoid logging config fetch failure warning message in console
     */
    spyOn(loggingService, 'warn')
    expect(apmBase._sendPageLoadMetrics).not.toHaveBeenCalled()
    expect(apmBase.fetchCentralConfig).toHaveBeenCalled()
  })
})
