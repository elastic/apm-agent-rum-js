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

import { createServiceFactory, createCustomEvent } from '../'
import {
  ERRORS,
  TRANSACTION_SERVICE,
  CONFIG_SERVICE,
  APM_SERVER,
  ERROR_LOGGING
} from '../../src/common/constants'
import { getGlobalConfig } from '../../../../dev-utils/test-config'

const { agentConfig } = getGlobalConfig('rum-core')

describe('ErrorLogging', function () {
  var testErrorMessage = 'errorevent_test_error_message'
  var configService
  var apmServer
  var errorLogging
  var transactionService

  beforeEach(function () {
    var serviceFactory = createServiceFactory()
    configService = serviceFactory.getService(CONFIG_SERVICE)
    configService.setConfig(agentConfig)
    apmServer = serviceFactory.getService(APM_SERVER)
    errorLogging = serviceFactory.getService(ERROR_LOGGING)
    transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
  })

  const getEvents = () => apmServer.queue.items
  const clearQueue = () => apmServer.queue._clear()

  it('should send error', function (done) {
    var errorObject
    try {
      throw new Error('test error')
    } catch (error) {
      errorObject = errorLogging.createErrorDataModel({ error })
    }
    apmServer
      .sendEvents([{ [ERRORS]: errorObject }])
      .then(done)
      .catch(reason => fail(reason))
  })

  it('should process errors', done => {
    apmServer.init()
    // in IE 10, Errors are given a stack once they're thrown.
    try {
      throw new Error('unittest error')
    } catch (error) {
      error.test = 'hamid'
      error.aDate = new Date('2017-01-12T00:00:00.000Z')
      var obj = { test: 'test' }
      obj.obj = obj
      error.anObject = obj
      error.aFunction = function noop() {}
      error.null = null
      errorLogging.logErrorEvent({ error })
      const events = getEvents()
      expect(events.length).toBe(1)
      const errorData = events[0][ERRORS]
      expect(errorData.context.custom.test).toBe('hamid')
      expect(errorData.context.custom.aDate).toBe('2017-01-12T00:00:00.000Z') // toISOString()
      expect(errorData.context.custom.anObject).toBeUndefined()
      expect(errorData.context.custom.aFunction).toBeUndefined()
      expect(errorData.context.custom.null).toBeUndefined()

      clearQueue()
      apmServer
        .sendEvents(events)
        .then(done)
        .catch(reason => fail(reason))
    }
  })

  it('should include transaction details on error', done => {
    apmServer.init()
    const transaction = transactionService.startTransaction('test', 'dummy', {
      managed: true
    })
    try {
      throw new Error('Test Error')
    } catch (error) {
      errorLogging.logErrorEvent({ error })
      const events = getEvents()
      expect(events.length).toBe(1)
      const errorData = events[0][ERRORS]
      expect(errorData.transaction_id).toEqual(transaction.id)
      expect(errorData.trace_id).toEqual(transaction.traceId)
      expect(errorData.parent_id).toEqual(transaction.id)
      expect(errorData.transaction).toEqual({
        type: transaction.type,
        sampled: transaction.sampled
      })
      transaction.end()

      clearQueue()
      apmServer
        .sendEvents(events)
        .then(done)
        .catch(reason => fail(reason))
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

  it('should include context info on error', () => {
    const transaction = transactionService.startTransaction('test', 'dummy', {
      managed: true
    })
    transaction.addContext({
      managed: true,
      dummy: {
        foo: 'bar',
        bar: 20
      }
    })
    configService.setUserContext({
      id: 12,
      username: 'test'
    })
    const errorEvent = {
      error: new Error(testErrorMessage)
    }
    const errorData = errorLogging.createErrorDataModel(errorEvent)
    expect(errorData.context).toEqual(
      jasmine.objectContaining({
        page: {
          referer: jasmine.any(String),
          url: jasmine.any(String)
        },
        managed: true,
        dummy: {
          foo: 'bar',
          bar: 20
        },
        user: { id: 12, username: 'test' }
      })
    )
    transaction.end()
  })

  it('should support ErrorEvent', function (done) {
    apmServer.init()
    var errorEvent = createErrorEvent(testErrorMessage)
    errorLogging.logErrorEvent(errorEvent)
    const events = getEvents()
    expect(events.length).toBe(1)
    const errorData = events[0][ERRORS]

    // the message is different in IE 10 since error type is not available
    expect(errorData.exception.message).toContain(testErrorMessage)
    // the number of frames is different in different platforms
    expect(errorData.exception.stacktrace.length).toBeGreaterThan(0)

    clearQueue()
    apmServer
      .sendEvents(events)
      .then(done)
      .catch(reason => fail(reason))
  })

  it('should use message over error.message for error event', done => {
    apmServer.init()
    const errorEvent = createErrorEvent(testErrorMessage)

    /**
     * Override error message
     */
    if (errorEvent.error) {
      errorEvent.error.message = 'Constructor Error'
    }

    errorLogging.logErrorEvent(errorEvent)
    const events = getEvents()
    expect(events.length).toBe(1)
    const errorData = events[0][ERRORS]
    expect(errorData.exception.message).toContain(testErrorMessage)

    clearQueue()
    apmServer
      .sendEvents(events)
      .then(done)
      .catch(reason => fail(reason))
  })

  it('should install global listener for error and accept ErrorEvents', function (done) {
    apmServer.init()
    const numberOfErrors = 4
    const original = window.addEventListener
    spyOn(apmServer, 'sendEvents').and.callFake(function (errors) {
      expect(errors.length).toBe(numberOfErrors)
      var errorData = errors[0][ERRORS]
      expect(errorData.exception.message).toContain(testErrorMessage)
      window.addEventListener = original
      done()
    })

    const addedListenerTypes = []
    let listener = (window.addEventListener = function (type, event) {
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

  it('should handle edge cases', function (done) {
    var resultPromises = []
    resultPromises.push(errorLogging.logErrorEvent(), true)
    resultPromises.push(errorLogging.logErrorEvent({}), true)
    resultPromises.push(errorLogging.logErrorEvent(undefined), true)

    Promise.all(resultPromises)
      .then(done)
      .catch(reason => fail(reason))
  })

  it('should add error to queue', function () {
    apmServer.init()
    configService.setConfig({
      serviceName: 'serviceName'
    })
    spyOn(apmServer, 'sendEvents')
    try {
      throw new Error('unittest error')
    } catch (error) {
      errorLogging.logErrorEvent({ error })
      errorLogging.logErrorEvent({ error })
      errorLogging.logError(error)
      errorLogging.logError('test error')
      expect(apmServer.sendEvents).not.toHaveBeenCalled()
      expect(apmServer.queue.items.length).toBe(4)
    }
  })

  it('should capture unhandled rejection events', done => {
    apmServer.init()
    configService.setConfig({
      flushInterval: 1
    })
    errorLogging.registerListeners()

    spyOn(apmServer, 'sendEvents').and.callFake(events => {
      const errorData = events[0][ERRORS]
      expect(errorData.exception.message).toMatch(reason.message)
      done()
    })
    /**
     * simulate window.PromiseRejectionEvent event since its not supported by
     * all browsers
     */
    const reason = new Error(testErrorMessage)
    const event = createCustomEvent('unhandledrejection')
    event.reason = reason
    window.dispatchEvent(event)
  })

  it('should handle different type of reasons for promise rejections', done => {
    apmServer.init()

    errorLogging.logPromiseEvent({})
    expect(getEvents().length).toBe(1)
    expect(getEvents()[0][ERRORS].exception.message).toMatch(
      /no reason specified/
    )

    const error = new Error(testErrorMessage)
    errorLogging.logPromiseEvent({
      reason: error
    })
    expect(getEvents()[1][ERRORS].exception.message).toMatch(error.message)

    errorLogging.logPromiseEvent({
      reason: testErrorMessage
    })
    expect(getEvents()[2][ERRORS].exception.message).toMatch(testErrorMessage)

    const errorObj = {
      message: testErrorMessage,
      stack: 'ReferenceError: At example.js:23'
    }
    errorLogging.logPromiseEvent({
      reason: errorObj
    })
    expect(getEvents()[3][ERRORS].exception.message).toMatch(testErrorMessage)
    expect(getEvents()[3][ERRORS].exception.stacktrace.length).toBeGreaterThan(
      0
    )

    const errorLikeObj = {
      name: 'CustomError',
      message: testErrorMessage,
      foo: 'bar'
    }
    errorLogging.logPromiseEvent({
      reason: errorLikeObj
    })
    expect(getEvents()[4][ERRORS].exception.type).toBe('CustomError')
    expect(getEvents()[4][ERRORS].exception.message).toMatch(testErrorMessage)
    expect(getEvents()[4][ERRORS].exception.stacktrace.length).toBe(0)

    errorLogging.logPromiseEvent({
      reason: 200
    })
    expect(getEvents()[5][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: 200'
    )

    errorLogging.logPromiseEvent({
      reason: true
    })
    expect(getEvents()[6][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: true'
    )

    errorLogging.logPromiseEvent({
      reason: ['array-value']
    })
    expect(getEvents()[7][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: <object>'
    )

    errorLogging.logPromiseEvent({
      reason: { a: '1' }
    })
    expect(getEvents()[8][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: {"a":"1"}'
    )

    // Make sure that the object fallback case works
    // Circular objects causes JSON.stringify to fail
    const circularObj = {
      foo: 'bar'
    }
    circularObj.self = circularObj
    errorLogging.logPromiseEvent({
      reason: circularObj
    })
    expect(getEvents()[9][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: <object>'
    )

    const noop = function () {}
    errorLogging.logPromiseEvent({
      reason: noop
    })
    expect(getEvents()[10][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: <function>'
    )

    errorLogging.logPromiseEvent({
      reason: null
    })
    expect(getEvents()[11][ERRORS].exception.message).toBe(
      'Unhandled promise rejection: <no reason specified>'
    )

    const events = getEvents()

    clearQueue()
    apmServer
      .sendEvents(events)
      .then(done)
      .catch(reason => {
        fail(reason)
      })
  })

  it('should ignore keys and add other error fields to custom context', done => {
    configService.setConfig({
      context: { tags: { tag1: 'tag1' }, other: 'other' }
    })
    const errorLikeObject = {
      message: 'Custom Error',
      stack: 'ReferenceError: At example.js:23',
      foo: 'bar',
      bar: 'baz',
      boo: undefined
    }
    const error = errorLogging.createErrorDataModel({ error: errorLikeObject })

    expect(error.context).toEqual({
      page: jasmine.any(Object),
      custom: {
        foo: 'bar',
        bar: 'baz'
      },
      other: 'other'
    })

    const error2 = errorLogging.createErrorDataModel({
      error: {
        message: 'Custom Error',
        stack: 'ReferenceError: At example.js:23',
        foo: undefined,
        bar: null,
        baz: () => {}
      }
    })

    expect(error2.context).toEqual({
      page: jasmine.any(Object),
      other: 'other'
    })

    apmServer
      .sendEvents([
        {
          [ERRORS]: error
        }
      ])
      .then(done)
      .catch(reason => fail(reason))
  })
})
