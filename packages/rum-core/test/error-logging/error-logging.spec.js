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

var createServiceFactory = require('..').createServiceFactory
var apmTestConfig = require('../apm-test-config')()

describe('ErrorLogging', function () {
  var testErrorMessage = 'errorevent_test_error_message'
  var configService
  var apmServer
  var errorLogging
  var transactionService
  beforeEach(function () {
    var serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    configService.setConfig(apmTestConfig)
    apmServer = serviceFactory.getService('ApmServer')
    errorLogging = serviceFactory.getService('ErrorLogging')
    transactionService = serviceFactory.getService('TransactionService')
  })

  it('should send error', function (done) {
    var errorObject
    try {
      throw new Error('test error')
    } catch (error) {
      errorObject = errorLogging.createErrorDataModel({ error })
    }
    apmServer.sendErrors([errorObject]).then(
      function () {
        done()
      },
      function (reason) {
        fail('Failed to send errors to the server, reason: ' + reason)
      }
    )
  })

  it('should process errors', function (done) {
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
      error.aFunction = function noop () {}
      error.null = null
      errorLogging.logErrorEvent({ error }, true).then(
        function () {
          expect(apmServer.sendErrors).toHaveBeenCalled()
          var errors = apmServer.sendErrors.calls.argsFor(0)[0]
          expect(errors.length).toBe(1)
          var errorData = errors[0]
          expect(errorData.context.test).toBe('hamid')
          expect(errorData.context.aDate).toBe('2017-01-12T00:00:00.000Z') // toISOString()
          expect(errorData.context.anObject).toBeUndefined()
          expect(errorData.context.aFunction).toBeUndefined()
          expect(errorData.context.null).toBeUndefined()
          done()
        },
        function (reason) {
          fail(reason)
        }
      )
    }
  })

  it('should include transaction details on error', done => {
    spyOn(apmServer, 'sendErrors').and.callThrough()
    var transaction = transactionService.startTransaction('test', 'dummy')
    try {
      throw new Error('Test Error')
    } catch (error) {
      errorLogging.logErrorEvent({ error }, true).then(
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
          done()
        },
        reason => fail(reason)
      )
    }
  })

  function createErrorEvent (message) {
    var errorEvent
    var errorEventData = {
      type: 'error',
      message: 'Uncaught Error: ' + message,
      lineno: 1,
      filename: 'test.js'
    }

    try {
      throw new Error(message)
    } catch (e) {
      errorEventData.error = e
    }

    try {
      errorEvent = new ErrorEvent('error', errorEventData)
    } catch (e) {
      console.log("Doesn't support creating ErrorEvent, using pure object instead.")
      errorEvent = errorEventData
    }
    return errorEvent
  }

  it('should support ErrorEvent', function (done) {
    spyOn(apmServer, 'sendErrors').and.callThrough()

    var errorEvent = createErrorEvent(testErrorMessage)

    errorLogging.logErrorEvent(errorEvent, true).then(
      function () {
        expect(apmServer.sendErrors).toHaveBeenCalled()
        var errors = apmServer.sendErrors.calls.argsFor(0)[0]
        expect(errors.length).toBe(1)
        var errorData = errors[0]
        // the message is different in IE 10 since error type is not available
        expect(errorData.exception.message).toContain(testErrorMessage)
        // the number of frames is different in different platforms
        expect(errorData.exception.stacktrace.length).toBeGreaterThan(0)
        done()
      },
      function (reason) {
        fail('Failed to send errors to the server, reason: ' + reason)
      }
    )
  })

  it('should install onerror and accept ErrorEvents', function (done) {
    var count = 0
    var numberOfErrors = 7
    spyOn(apmServer, 'sendErrors').and.callFake(function (errors) {
      expect(errors.length).toBe(numberOfErrors)
      var error = errors[0]
      expect(error.exception.message).toContain(testErrorMessage)

      count = count + errors.length
      if (count === numberOfErrors) {
        done()
      }
    })

    window.onerror = null
    errorLogging.registerGlobalEventListener()

    expect(typeof window.onerror).toBe('function')
    var apmOnError = window.onerror

    try {
      throw new Error(testErrorMessage)
    } catch (error) {
      apmOnError(testErrorMessage, 'filename', 1, 2, error)
    }

    apmOnError(testErrorMessage, 'filename', 1, 2, undefined)
    apmOnError(testErrorMessage, 'filename', 1, 2, testErrorMessage) // throw "test";
    apmOnError(testErrorMessage, undefined, undefined, undefined, undefined)
    apmOnError('Test:' + testErrorMessage, 'filename', 1, 2, undefined)
    apmOnError('Script error.' + testErrorMessage, undefined, undefined, undefined, undefined)
    apmOnError(createErrorEvent(testErrorMessage))
  })

  it('should handle edge cases', function (done) {
    var resultPromises = []
    resultPromises.push(errorLogging.logErrorEvent(), true)
    resultPromises.push(errorLogging.logErrorEvent({}), true)
    resultPromises.push(errorLogging.logErrorEvent(undefined), true)

    Promise.all(resultPromises).then(
      function () {
        done()
      },
      reason => {
        fail('failed: ' + reason)
      }
    )
  })

  it('should add error to queue', function () {
    configService.setConfig({
      serviceName: 'serviceName'
    })
    expect(configService.isValid()).toBe(true)
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

  it('should check isActive', function () {
    configService.setConfig({
      active: false
    })
    expect(configService.isActive()).toBe(false)
    spyOn(apmServer, 'sendErrors')
    spyOn(apmServer, 'addError')
    try {
      throw new Error('unittest error')
    } catch (error) {
      errorLogging.logErrorEvent({ error })
      errorLogging.logErrorEvent({ error })
      errorLogging.logError(error)
      errorLogging.logError('test error')
      expect(apmServer.sendErrors).not.toHaveBeenCalled()
      expect(apmServer.addError).not.toHaveBeenCalled()
      expect(apmServer.errorQueue).toBe(undefined)
    }
  })
})
