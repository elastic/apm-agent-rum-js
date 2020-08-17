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

import Span from './span'
import SpanBase from './span-base'
import {
  generateRandomId,
  merge,
  now,
  getTime,
  extend,
  removeInvalidChars
} from '../common/utils'
import { REUSABILITY_THRESHOLD, TRUNCATED_TYPE } from '../common/constants'
import { captureBreakdown } from './breakdown'

class Transaction extends SpanBase {
  constructor(name, type, options) {
    super(name, type, options)
    this.traceId = generateRandomId()
    this.marks = undefined

    this.spans = []
    this._activeSpans = {}

    this._activeTasks = new Set()
    this.blocked = false

    this.captureTimings = false

    this.breakdownTimings = []

    this.sampled = Math.random() <= this.options.transactionSampleRate
  }

  addMarks(obj) {
    this.marks = merge(this.marks || {}, obj)
  }

  mark(key) {
    const skey = removeInvalidChars(key)
    const markTime = now() - this._start
    const custom = {}
    custom[skey] = markTime
    this.addMarks({ custom })
  }

  canReuse() {
    let threshold = this.options.reuseThreshold || REUSABILITY_THRESHOLD
    return (
      !!this.options.canReuse && !this.ended && now() - this._start < threshold
    ) // To avoid a stale transaction capture everything
  }

  redefine(name, type, options) {
    if (name) {
      this.name = name
    }
    if (type) {
      this.type = type
    }

    if (options) {
      extend(this.options, options)
    }
  }

  startSpan(name, type, options) {
    if (this.ended) {
      return
    }
    const opts = extend({}, options)

    opts.onEnd = trc => {
      this._onSpanEnd(trc)
    }
    opts.traceId = this.traceId
    opts.sampled = this.sampled

    if (!opts.parentId) {
      opts.parentId = this.id
    }

    const span = new Span(name, type, opts)
    this._activeSpans[span.id] = span
    /**
     * Blocked spans adds internal tasks and blocks
     * the underlying transaction from getting closed
     */
    if (opts.blocking) {
      this.addTask(span.id)
    }

    return span
  }

  isFinished() {
    return !this.blocked && this._activeTasks.size === 0
  }

  detectFinish() {
    /**
     * Ends the transaction when there are no pending tasks
     * and transaction state is not blocked
     */
    if (this.isFinished()) this.end()
  }

  end(endTime) {
    if (this.ended) {
      return
    }
    this.ended = true
    this._end = getTime(endTime)

    // truncate active spans
    for (let sid in this._activeSpans) {
      const span = this._activeSpans[sid]
      span.type = span.type + TRUNCATED_TYPE
      span.end(endTime)
    }
    this.callOnEnd()
  }

  captureBreakdown() {
    this.breakdownTimings = captureBreakdown(this)
  }

  block(flag) {
    this.blocked = flag
    /**
     * If transaction is unblocked, we check if
     * transaction can be closed
     */
    if (!this.blocked) {
      this.detectFinish()
    }
  }

  addTask(taskId) {
    if (!taskId) {
      taskId = 'task-' + generateRandomId(16)
    }
    this._activeTasks.add(taskId)
    return taskId
  }

  removeTask(taskId) {
    const deleted = this._activeTasks.delete(taskId)
    deleted && this.detectFinish()
  }

  resetSpans() {
    this.spans = []
  }

  _onSpanEnd(span) {
    this.spans.push(span)
    /**
     * Remove span from _activeSpans and the
     * task associated with the span if its blocked
     */
    delete this._activeSpans[span.id]
    this.removeTask(span.id)
  }

  isManaged() {
    return !!this.options.managed
  }
}

export default Transaction
