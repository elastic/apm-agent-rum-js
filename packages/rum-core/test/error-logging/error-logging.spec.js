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
import { getGlobalConfig } from '../../../../dev-utils/test-config'

const { agentConfig } = getGlobalConfig('rum-core')

describe('ErrorLogging', function() {
  var testErrorMessage = 'errorevent_test_error_message'
  var configService
  var apmServer
  var errorLogging
  var transactionService

  beforeEach(function() {
    var serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    configService.setConfig(agentConfig)
    apmServer = serviceFactory.getService('ApmServer')
    errorLogging = serviceFactory.getService('ErrorLogging')
    transactionService = serviceFactory.getService('TransactionService')
  })

  it('should send error', function(done) {
    var errorObject
    try {
      throw new Error('test error')
    } catch (error) {
      errorObject = errorLogging.createErrorDataModel({ error })
    }
    apmServer
      .sendErrors([errorObject])
      .catch(reason => {
        fail('Failed to send errors to the server, reason: ' + reason)
      })
      .then(() => done())
  })

  it('should process errors', function(done) {
    spyOn(apmServer, 'sendErrors').and.callThrough()

    // in IE 10, Errors are given a stack once they're thrown.
    try {
      throw new Error('unittest error')
    } catch (error) {
      // error['_elastic_extra_context'] = {test: 'hamid'}
      error.test = 'hamid'
      error.aDate = new Date('2017-01-12T00:00:00.000Z')
      var obj = { test: 'test' }
      obj.obj = obj
      error.anObject = obj
      error.aFunction = function noop() {}
      error.null = null
      errorLogging
        .logErrorEvent({ error }, true)
        .then(
          () => {
            expect(apmServer.sendErrors).toHaveBeenCalled()
            var errors = apmServer.sendErrors.calls.argsFor(0)[0]
            expect(errors.length).toBe(1)
            var errorData = errors[0]
            expect(errorData.context.test).toBe('hamid')
            expect(errorData.context.aDate).toBe('2017-01-12T00:00:00.000Z') // toISOString()
            expect(errorData.context.anObject).toBeUndefined()
            expect(errorData.context.aFunction).toBeUndefined()
            expect(errorData.context.null).toBeUndefined()
          },
          reason => {
            fail(reason)
          }
        )
        .then(() => done())
    }
  })

  it('should include transaction details on error', done => {
    spyOn(apmServer, 'sendErrors').and.callThrough()
    var transaction = transactionService.startTransaction('test', 'dummy', {
      managed: true
    })
    try {
      throw new Error('Test Error')
    } catch (error) {
      errorLogging
        .logErrorEvent({ error }, true)
        .then(
          () => {
            expect(apmServer.sendErrors).toHaveBeenCalled()
            var errors = apmServer.sendErrors.calls.argsFor(0)[0]
            expect(errors.length).toBe(1)
            var errorData = errors[0]
            expect(errorData.transaction_id).toEqual(transaction.id)
            expect(errorData.trace_id).toEqual(transaction.traceId)
            expect(errorData.parent_id).toEqual(transaction.id)
            expect(errorData.transaction).toEqual({
              type: transaction.type,
              sampled: transaction.sampled
            })
          },
          reason => fail(reason)
        )
        .then(() => done())
    }
  })

  function createErrorEvent(message) {
    var errorEvent
    var errorEventData = {
      type: 'error',
      message: 'Uncaught Error: ' + message,
      lineno: 1,
      filename: 'test.js',
      error: null
    }

    try {
      throw new Error(message)
    } catch (e) {
      errorEventData.error = e
    }

    try {
      errorEvent = new ErrorEvent('error', errorEventData)
    } catch (e) {
      console.log(
        "Doesn't support creating ErrorEvent, using pure object instead."
      )
      errorEvent = errorEventData
    }
    return errorEvent
  }

  it('should support ErrorEvent', function(done) {
    spyOn(apmServer, 'sendErrors').and.callThrough()

    var errorEvent = createErrorEvent(testErrorMessage)

    errorLogging
      .logErrorEvent(errorEvent, true)
      .then(
        () => {
          expect(apmServer.sendErrors).toHaveBeenCalled()
          var errors = apmServer.sendErrors.calls.argsFor(0)[0]
          expect(errors.length).toBe(1)
          var errorData = errors[0]
          // the message is different in IE 10 since error type is not available
          expect(errorData.exception.message).toContain(testErrorMessage)
          // the number of frames is different in different platforms
          expect(errorData.exception.stacktrace.length).toBeGreaterThan(0)
        },
        reason => {
          fail('Failed to send errors to the server, reason: ' + reason)
        }
      )
      .then(() => done())
  })

  it('should use message over error.message for error event', done => {
    spyOn(apmServer, 'sendErrors').and.callThrough()

    const errorEvent = createErrorEvent(testErrorMessage)

    /**
     * Override error message
     */
    if (errorEvent.error) {
      errorEvent.error.message = 'Constructor Error'
    }

    errorLogging
      .logErrorEvent(errorEvent, true)
      .then(
        () => {
          expect(apmServer.sendErrors).toHaveBeenCalled()
          const errors = apmServer.sendErrors.calls.argsFor(0)[0]
          expect(errors[0].exception.message).toContain(testErrorMessage)
        },
        reason => fail(reason)
      )
      .then(() => done())
  })

  it('should install global listener for error and accept ErrorEvents', function(done) {
    var count = 0
    var numberOfErrors = 4
    const original = window.addEventListener
    spyOn(apmServer, 'sendErrors').and.callFake(function(errors) {
      expect(errors.length).toBe(numberOfErrors)
      var error = errors[0]
      expect(error.exception.message).toContain(testErrorMessage)

      count = count + errors.length
      if (count === numberOfErrors) {
        window.addEventListener = original
        done()
      }
    })

    const addedListenerTypes = []
    let listener = (window.addEventListener = function(type, event) {
      addedListenerTypes.push(type)
      errorLogging.logErrorEvent(event)
    })
    errorLogging.registerListeners()
    expect(addedListenerTypes).toContain('error')

    const filename = 'filename'
    const lineno = 1
    const colno = 2

    try {
      throw new Error(testErrorMessage)
    } catch (error) {
      listener('error', {
        message: testErrorMessage,
        filename,
        lineno,
        colno,
        error
      })
    }
    listener('error', {
      message: testErrorMessage,
      filename,
      lineno,
      colno,
      error: undefined
    })
    listener('error', {
      message: 'Script error.' + testErrorMessage,
      error: null
    })
    listener('error', createErrorEvent(testErrorMessage))
  })

  it('should handle edge cases', function(done) {
    var resultPromises = []
    resultPromises.push(errorLogging.logErrorEvent(), true)
    resultPromises.push(errorLogging.logErrorEvent({}), true)
    resultPromises.push(errorLogging.logErrorEvent(undefined), true)

    Promise.all(resultPromises).then(
      function() {
        done()
      },
      reason => {
        fail('failed: ' + reason)
      }
    )
  })

  it('should add error to queue', function() {
    configService.setConfig({
      serviceName: 'serviceName'
    })
    spyOn(apmServer, 'sendErrors')
    try {
      throw new Error('unittest error')
    } catch (error) {
      errorLogging.logErrorEvent({ error })
      errorLogging.logErrorEvent({ error })
      errorLogging.logError(error)
      errorLogging.logError('test error')
      expect(apmServer.sendErrors).not.toHaveBeenCalled()
      expect(apmServer.errorQueue.items.length).toBe(4)
    }
  })

  it('should capture unhandled rejection events', done => {
    /**
     * Polyfilling the CustomEvent since they are available as objects
     * in IE 9-11
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
     */
    function createCustomEevent(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: null }
      if (typeof window.CustomEvent === 'function') {
        return new CustomEvent(event, params)
      }

      const evt = document.createEvent('CustomEvent')
      evt.initCustomEvent(
        event,
        params.bubbles,
        params.cancelable,
        params.detail
      )
      return evt
    }

    configService.set('flushInterval', 1)
    errorLogging.registerListeners()

    spyOn(apmServer, 'sendErrors').and.callFake(errors => {
      expect(errors[0].exception.message).toMatch(reason.message)
      done()
    })
    /**
     * simulate window.PromiseRejectionEvent event since its not supported by
     * all browsers
     */
    const reason = new Error(testErrorMessage)
    const event = createCustomEevent('unhandledrejection')
    event.reason = reason
    window.dispatchEvent(event)
  })

  it('should handle different type of reasons for promise rejections', () => {
    const getErrors = () => apmServer.errorQueue.items

    errorLogging.logPromiseEvent({})
    expect(getErrors().length).toBe(1)
    expect(getErrors()[0].exception.message).toMatch(/no reason specified/)

    const error = new Error(testErrorMessage)
    errorLogging.logPromiseEvent({
      reason: error
    })
    expect(getErrors()[1].exception.message).toMatch(error.message)

    errorLogging.logPromiseEvent({
      reason: testErrorMessage
    })
    expect(getErrors()[2].exception.message).toMatch(testErrorMessage)

    const errorObj = {
      message: testErrorMessage,
      stack: 'ReferenceError: At example.js:23'
    }
    errorLogging.logPromiseEvent({
      reason: errorObj
    })
    expect(getErrors()[3].exception.message).toMatch(testErrorMessage)
    expect(getErrors()[3].exception.stacktrace.length).toBeGreaterThan(0)

    const errorLikeObj = {
      message: testErrorMessage,
      foo: 'bar'
    }
    errorLogging.logPromiseEvent({
      reason: errorLikeObj
    })
    expect(getErrors()[4].exception.message).toMatch(testErrorMessage)
    expect(getErrors()[4].exception.stacktrace.length).toBe(0)

    errorLogging.logPromiseEvent({
      reason: 200
    })
    expect(getErrors()[5].exception.message).toBe(
      'Unhandled promise rejection: 200'
    )

    errorLogging.logPromiseEvent({
      reason: true
    })
    expect(getErrors()[6].exception.message).toBe(
      'Unhandled promise rejection: true'
    )

    errorLogging.logPromiseEvent({
      reason: [{ a: '1' }]
    })
    expect(getErrors()[7]).toBeUndefined()
  })
})
