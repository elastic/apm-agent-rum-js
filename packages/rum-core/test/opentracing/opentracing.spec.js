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

const apiCompatibilityChecks = require('./api_compatibility').default
const { createServiceFactory } = require('..')
const ElasticTracer = require('../../src/opentracing/tracer')
const Transaction = require('../../src/performance-monitoring/transaction')
const Span = require('../../src/performance-monitoring/span')
const { Reference, REFERENCE_CHILD_OF } = require('opentracing')

function createTracer (config) {
  var serviceFactory = createServiceFactory()
  var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  var transactionService = serviceFactory.getService('TransactionService')
  var errorLogging = serviceFactory.getService('ErrorLogging')
  var loggingService = serviceFactory.getService('LoggingService')
  var configService = serviceFactory.getService('ConfigService')
  configService.setConfig(config)
  return new ElasticTracer(performanceMonitoring, transactionService, loggingService, errorLogging)
}

apiCompatibilityChecks(
  () => {
    return createTracer({
      active: true
    })
  },
  { skipBaggageChecks: true }
)

apiCompatibilityChecks(
  () => {
    return createTracer({
      active: false
    })
  },
  { skipBaggageChecks: true }
)

describe('OpenTracing API', function () {
  it('should create spans', function () {
    var tracer = createTracer({
      active: true
    })
    var span = tracer.startSpan('test-name', { tags: { type: 'test-type' }, startTime: Date.now() })

    expect(span.span instanceof Transaction).toBe(true)
    expect(span.span.name).toBe('test-name')
    expect(span.span.type).toBe('test-type')
    expect(span.tracer()).toBe(tracer)
    span.setOperationName('new-name')
    expect(span.span.name).toBe('new-name')

    span.addTags({
      'user.id': 'test-id',
      'user.username': 'test-username',
      'user.email': 'test-email',
      'another.tag': 'test-tag',
      type: 'new-type'
    })

    expect(span.span.type).toBe('new-type')
    expect(span.span.context).toEqual({
      user: {
        id: 'test-id',
        username: 'test-username',
        email: 'test-email'
      },
      tags: { another_tag: 'test-tag' }
    })

    var testError = new Error('OpenTracing test error')
    spyOn(tracer.errorLogging, 'logError')
    span.log({ event: 'error', 'error.object': testError })
    expect(tracer.errorLogging.logError).toHaveBeenCalledWith(testError)

    tracer.errorLogging.logError.calls.reset()
    span.log({ event: 'error', message: 'OpenTracing error test message' })
    expect(tracer.errorLogging.logError).toHaveBeenCalledWith('OpenTracing error test message')

    var childSpan = tracer.startSpan('span-name', {
      tags: { type: 'span-type' },
      childOf: span.context()
    })

    expect(childSpan.span instanceof Span).toBe(true)
    childSpan.addTags({
      'user.id': 'test-id',
      'user.username': 'test-username',
      'user.email': 'test-email',
      'another.tag': 'test-tag',
      type: 'new-type'
    })

    expect(childSpan.span.type).toBe('new-type')
    expect(childSpan.span.context).toEqual({
      tags: {
        another_tag: 'test-tag',
        user_id: 'test-id',
        user_username: 'test-username',
        user_email: 'test-email'
      }
    })

    var SecondChildSpan = tracer.startSpan('span-name', {
      tags: { type: 'span-type' },
      references: [new Reference(REFERENCE_CHILD_OF, childSpan)]
    })

    expect(SecondChildSpan.span.parentId).toBe(childSpan.span.id)
  })
})
