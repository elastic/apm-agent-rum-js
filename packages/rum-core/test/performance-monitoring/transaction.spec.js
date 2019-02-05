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

var Transaction = require('../../src/performance-monitoring/transaction')
var Span = require('../../src/performance-monitoring/span')

describe('transaction.Transaction', function () {
  beforeEach(function () {})

  it('should contain correct number of spans in the end', function (done) {
    var firstSpan = new Span('first-span-name', 'first-span')
    firstSpan.end()

    var transaction = new Transaction('/', 'transaction', {})

    firstSpan.transaction = transaction
    transaction.addEndedSpans([firstSpan])

    var lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()
    transaction.end()

    expect(transaction.spans.length).toBe(2)
    done()
  })

  it('should adjust rootSpan to earliest span', function (done) {
    var firstSpan = new Span('first-span-name', 'first-span')
    firstSpan.end()

    var transaction = new Transaction('/', 'transaction', {})
    transaction.onEnd = function () {
      expect(transaction._start).toBe(firstSpan._start)
      expect(transaction._end >= lastSpan._end).toBeTruthy()
      done()
    }
    firstSpan.transaction = transaction
    transaction.addEndedSpans([firstSpan])

    var lastSpan = transaction.startSpan('last-span-name', 'last-span')

    lastSpan.end()
    transaction.detectFinish()
  })

  it('should adjust rootSpan to latest span', function (done) {
    var transaction = new Transaction('/', 'transaction', {})
    var rootSpanStart = transaction._start

    var firstSpan = transaction.startSpan('first-span-name', 'first-span')
    firstSpan.end()

    var longSpan = transaction.startSpan('long-span-name', 'long-span')

    var lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()

    setTimeout(function () {
      longSpan.end()
      transaction.detectFinish()

      setTimeout(function () {
        expect(transaction._start).toBe(rootSpanStart)
        expect(transaction._end).toEqual(longSpan._end)
        done()
      })
    }, 500)
  })

  xit('should not start any spans after transaction has been added to queue', function () {
    var transaction = new Transaction('/', 'transaction', {})
    transaction.end()
    var firstSpan = transaction.startSpan('first-span-name', 'first-span')
    firstSpan.end()
    setTimeout(function () {
      // todo: transaction has already been added to the queue, shouldn't accept more spans

      var lastSpan = transaction.startSpan('last-span-name', 'last-span')
      fail(
        'done transaction should not accept more spans, now we simply ignore the newly stared span.'
      )
      lastSpan.end()
    })
  })

  it('should not generate stacktrace if the option is not passed', function (done) {
    var tr = new Transaction('/', 'transaction')
    tr.onEnd = function () {
      expect(firstSpan.frames).toBeUndefined()
      expect(secondSpan.frames).toBeUndefined()
      done()
    }
    var firstSpan = tr.startSpan('first-span-name', 'first-span')
    firstSpan.end()

    var secondSpan = tr.startSpan('second-span', 'second-span')
    secondSpan.end()

    tr.end()
  })

  it('should store context.page.url', function () {
    var tr = new Transaction('/', 'transaction')
    tr.detectFinish()
    var location = tr.context.page.url
    expect(location).toBe(window.location.href)
  })

  it('should redefine transaction', function () {
    var tr = new Transaction('/', 'transaction')
    tr.redefine('name', 'type', { test: 'test' })
    expect(tr.name).toBe('name')
    expect(tr.type).toBe('type')
    expect(tr.options).toEqual({ test: 'test' })
  })

  it('should add and remove tasks', function () {
    var tr = new Transaction('/', 'transaction')
    expect(tr._scheduledTasks).toEqual({})
    tr.addTask('task1')
    expect(tr._scheduledTasks).toEqual({ task1: 'task1' })
    tr.removeTask('task1')
    expect(tr._scheduledTasks).toEqual({})
  })

  it('should mark events', function () {
    var transaction = new Transaction('transaction', 'transaction')
    transaction.mark('new.mark')
    transaction.mark('mark')
    expect(typeof transaction.marks.custom.new_mark).toBe('number')
    expect(typeof transaction.marks.custom.mark).toBe('number')
  })

  it('should not start spans after end', function () {
    var transaction = new Transaction('transaction', 'transaction')
    transaction.end()
    var span = transaction.startSpan('test', 'test')
    expect(span).toBe(undefined)
  })

  it('should not produce negative durations while adjusting to the spans', function () {
    var transaction = new Transaction('transaction', 'transaction')
    var span = transaction.startSpan('test', 'test')
    span.end()
    span._end += 100
    span = transaction.startSpan('test', 'external.http')

    span.end()
    span._start = 10000000
    span._end = 11000000
    transaction.end()
    expect(span.duration()).toBe(0)
  })

  it('should truncate active spans', function () {
    var transaction = new Transaction('transaction', 'transaction')
    var span = transaction.startSpan('test', 'test')
    expect(transaction.spans.length).toBe(0)
    expect(Object.keys(transaction._activeSpans).length).toBe(1)
    transaction.end()
    expect(transaction.spans.length).toBe(1)
    expect(Object.keys(transaction._activeSpans).length).toBe(0)
    expect(span.type).toContain('.truncated')
  })

  it('should always set span parentId', function () {
    var transaction = new Transaction('transaction', 'transaction')

    var span = transaction.startSpan('name', 'type')
    expect(span.parentId).toBe(transaction.id)
    span = transaction.startSpan('name', 'type', { parentId: 'test-parent-id' })
    expect(span.parentId).toBe('test-parent-id')
  })
})
