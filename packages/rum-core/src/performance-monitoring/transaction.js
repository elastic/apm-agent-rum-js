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

const Span = require('./span')
const SpanBase = require('./span-base')
const {
  generateRandomId,
  getNavigationTimingMarks,
  getPaintTimingMarks,
  merge,
  extend,
  getPageMetadata,
  removeInvalidChars
} = require('../common/utils')

class Transaction extends SpanBase {
  constructor(name, type, options) {
    super(name, type, options)
    this.traceId = generateRandomId()
    this.marks = undefined

    this.spans = []
    this._activeSpans = {}

    this.nextAutoTaskId = 1
    this._scheduledTasks = []

    this.isHardNavigation = false

    this.sampled = Math.random() <= this.options.transactionSampleRate
  }

  addNavigationTimingMarks() {
    const marks = getNavigationTimingMarks()
    const paintMarks = getPaintTimingMarks()
    if (marks) {
      const agent = {
        timeToFirstByte: marks.responseStart,
        domInteractive: marks.domInteractive,
        domComplete: marks.domComplete
      }
      if (paintMarks['first-contentful-paint']) {
        agent.firstContentfulPaint = paintMarks['first-contentful-paint']
      }
      this.addMarks({ navigationTiming: marks, agent })
    }
  }

  addMarks(obj) {
    this.marks = merge(this.marks || {}, obj)
  }

  mark(key) {
    const skey = removeInvalidChars(key)
    const now = window.performance.now() - this._start
    const custom = {}
    custom[skey] = now
    this.addMarks({ custom })
  }

  redefine(name, type, options) {
    this.name = name
    this.type = type
    this.options = options
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

    return span
  }

  isFinished() {
    return this._scheduledTasks.length === 0
  }

  detectFinish() {
    if (this.isFinished()) this.end()
  }

  end() {
    if (this.ended) {
      return
    }
    this.ended = true
    this._end = window.performance.now()
    // truncate active spans
    for (let sid in this._activeSpans) {
      const span = this._activeSpans[sid]
      span.type = span.type + '.truncated'
      span.end()
    }

    const metadata = getPageMetadata()
    this.addContext(metadata)

    this._adjustStartToEarliestSpan()
    this._adjustEndToLatestSpan()
    this.callOnEnd()
  }

  addTask(taskId) {
    if (typeof taskId === 'undefined') {
      taskId = 'task' + this.nextAutoTaskId++
    }
    if (this._scheduledTasks.indexOf(taskId) == -1) {
      this._scheduledTasks.push(taskId)
      return taskId
    }
  }

  removeTask(taskId) {
    let index = this._scheduledTasks.indexOf(taskId)
    if (index > -1) {
      this._scheduledTasks.splice(index, 1)
    }
    this.detectFinish()
  }

  addEndedSpans(existingSpans) {
    this.spans = this.spans.concat(existingSpans)
  }

  resetSpans() {
    this.spans = []
  }

  _onSpanEnd(span) {
    this.spans.push(span)
    // Remove span from _activeSpans
    delete this._activeSpans[span.id]
  }

  _adjustEndToLatestSpan() {
    const latestSpan = findLatestNonXHRSpan(this.spans)

    if (latestSpan) {
      this._end = latestSpan._end

      // set all spans that now are longer than the transaction to
      // be truncated spans
      for (let i = 0; i < this.spans.length; i++) {
        const span = this.spans[i]
        if (span._end > this._end) {
          span._end = this._end
          span.type = span.type + '.truncated'
        }
        if (span._start > this._end) {
          span._start = this._end
        }
      }
    }
  }

  _adjustStartToEarliestSpan() {
    const span = getEarliestSpan(this.spans)

    if (span && span._start < this._start) {
      this._start = span._start
    }
  }
}

function findLatestNonXHRSpan(spans) {
  let latestSpan = null
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    if (
      span.type &&
      span.type.indexOf('ext') === -1 &&
      span.type !== 'transaction' &&
      (!latestSpan || latestSpan._end < span._end)
    ) {
      latestSpan = span
    }
  }
  return latestSpan
}

function getEarliestSpan(spans) {
  let earliestSpan = null

  spans.forEach(function(span) {
    if (!earliestSpan) {
      earliestSpan = span
    }
    if (earliestSpan && earliestSpan._start > span._start) {
      earliestSpan = span
    }
  })

  return earliestSpan
}

module.exports = Transaction
