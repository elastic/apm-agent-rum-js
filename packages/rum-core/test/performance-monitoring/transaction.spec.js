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

import Transaction from '../../src/performance-monitoring/transaction'
import Span from '../../src/performance-monitoring/span'

describe('transaction.Transaction', function() {
  it('should contain correct number of spans in the end', function(done) {
    var firstSpan = new Span('first-span-name', 'first-span')
    firstSpan.end()

    var transaction = new Transaction('/', 'transaction', {})

    firstSpan.transaction = transaction
    transaction.spans.push(firstSpan)

    var lastSpan = transaction.startSpan('last-span-name', 'last-span')
    lastSpan.end()
    transaction.end()

    expect(transaction.spans.length).toBe(2)
    done()
  })

  xit('should not start any spans after transaction has been added to queue', function() {
    var transaction = new Transaction('/', 'transaction', {})
    transaction.end()
    var firstSpan = transaction.startSpan('first-span-name', 'first-span')
    firstSpan.end()
    setTimeout(function() {
      // todo: transaction has already been added to the queue, shouldn't accept more spans

      var lastSpan = transaction.startSpan('last-span-name', 'last-span')
      fail(
        'done transaction should not accept more spans, now we simply ignore the newly stared span.'
      )
      lastSpan.end()
    })
  })

  it('should not generate stacktrace if the option is not passed', function(done) {
    var tr = new Transaction('/', 'transaction')
    tr.onEnd = function() {
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

  it('should redefine transaction', function() {
    var tr = new Transaction('/', 'transaction')
    tr.redefine('name', 'type', { test: 'test' })
    expect(tr.name).toBe('name')
    expect(tr.type).toBe('type')
    expect(tr.options).toEqual({ test: 'test' })
  })

  it('should add and remove tasks', function() {
    var tr = new Transaction('/', 'transaction')
    expect(tr._scheduledTasks).toEqual([])
    tr.addTask()
    expect(tr._scheduledTasks).toEqual(['task1'])
    tr.addTask('task2')
    expect(tr._scheduledTasks).toEqual(['task1', 'task2'])
    tr.removeTask('task1')
    tr.addTask('my-task')
    expect(tr._scheduledTasks).toEqual(['task2', 'my-task'])
    tr.removeTask('task2')
    tr.addTask('my-task')
    expect(tr._scheduledTasks).toEqual(['my-task'])
    tr.removeTask('my-task')
    expect(tr._scheduledTasks).toEqual([])
  })

  it('should mark events', function() {
    var transaction = new Transaction('transaction', 'transaction')
    transaction.mark('new.mark')
    transaction.mark('mark')
    expect(typeof transaction.marks.custom.new_mark).toBe('number')
    expect(typeof transaction.marks.custom.mark).toBe('number')
  })

  it('should not start spans after end', function() {
    var transaction = new Transaction('transaction', 'transaction')
    transaction.end()
    var span = transaction.startSpan('test', 'test')
    expect(span).toBe(undefined)
  })

  it('should always set span parentId', function() {
    var transaction = new Transaction('transaction', 'transaction')

    var span = transaction.startSpan('name', 'type')
    expect(span.parentId).toBe(transaction.id)
    span = transaction.startSpan('name', 'type', { parentId: 'test-parent-id' })
    expect(span.parentId).toBe('test-parent-id')
  })

  it('should calculate reusability', function() {
    var transaction = new Transaction('transaction', 'transaction')
    expect(transaction.canReuse()).toBe(false)

    transaction = new Transaction('transaction', 'transaction', {
      canReuse: true
    })
    expect(transaction.canReuse()).toBe(true)

    transaction.end()
    expect(transaction.canReuse()).toBe(false)

    transaction = new Transaction('transaction', 'transaction', {
      canReuse: true
    })
    expect(transaction.canReuse()).toBe(true)

    transaction._start = transaction._start - 10000
    expect(transaction.canReuse()).toBe(false)

    transaction = new Transaction('transaction', 'transaction', {
      canReuse: true,
      reuseThreshold: 100
    })
    expect(transaction.canReuse()).toBe(true)
    transaction._start = transaction._start - 101
    expect(transaction.canReuse()).toBe(false)
  })
})
