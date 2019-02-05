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
  constructor (name, type, options) {
    super(name, type, options)
    this.traceId = generateRandomId()
    this.marks = undefined

    this.spans = []
    this._activeSpans = {}

    this._scheduledTasks = {}

    this.nextAutoTaskId = 0

    this.isHardNavigation = false

    this.sampled = Math.random() <= this.options.transactionSampleRate
  }

  addNavigationTimingMarks () {
    var marks = getNavigationTimingMarks()
    var paintMarks = getPaintTimingMarks()
    if (marks) {
      var agent = {
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

  addMarks (obj) {
    this.marks = merge(this.marks || {}, obj)
  }

  mark (key) {
    var skey = removeInvalidChars(key)
    var now = window.performance.now() - this._start
    var custom = {}
    custom[skey] = now
    this.addMarks({ custom })
  }

  redefine (name, type, options) {
    this.name = name
    this.type = type
    this.options = options
  }

  startSpan (name, type, options) {
    if (this.ended) {
      return
    }
    var transaction = this
    var opts = extend({}, options)

    opts.onEnd = function (trc) {
      transaction._onSpanEnd(trc)
    }
    opts.traceId = this.traceId
    opts.sampled = this.sampled

    if (!opts.parentId) {
      opts.parentId = this.id
    }

    var span = new Span(name, type, opts)
    this._activeSpans[span.id] = span

    return span
  }

  isFinished () {
    var scheduledTasks = Object.keys(this._scheduledTasks)
    return scheduledTasks.length === 0
  }

  detectFinish () {
    if (this.isFinished()) this.end()
  }

  end () {
    if (this.ended) {
      return
    }
    this.ended = true
    this._end = window.performance.now()
    // truncate active spans
    for (var sid in this._activeSpans) {
      var span = this._activeSpans[sid]
      span.type = span.type + '.truncated'
      span.end()
    }

    var metadata = getPageMetadata()
    this.addContext(metadata)

    this._adjustStartToEarliestSpan()
    this._adjustEndToLatestSpan()
    this.callOnEnd()
  }

  addTask (taskId) {
    // todo: should not accept more tasks if the transaction is alreadyFinished]
    if (typeof taskId === 'undefined') {
      taskId = 'autoId' + this.nextAutoTaskId++
    }
    this._scheduledTasks[taskId] = taskId
    return taskId
  }

  removeTask (taskId) {
    delete this._scheduledTasks[taskId]
    this.detectFinish()
  }

  addEndedSpans (existingSpans) {
    this.spans = this.spans.concat(existingSpans)
  }

  resetSpans () {
    this.spans = []
  }

  _onSpanEnd (span) {
    this.spans.push(span)
    // Remove span from _activeSpans
    delete this._activeSpans[span.id]
  }

  _adjustEndToLatestSpan () {
    var latestSpan = findLatestNonXHRSpan(this.spans)

    if (latestSpan) {
      this._end = latestSpan._end

      // set all spans that now are longer than the transaction to
      // be truncated spans
      for (var i = 0; i < this.spans.length; i++) {
        var span = this.spans[i]
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

  _adjustStartToEarliestSpan () {
    var span = getEarliestSpan(this.spans)

    if (span && span._start < this._start) {
      this._start = span._start
    }
  }
}

function findLatestNonXHRSpan (spans) {
  var latestSpan = null
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i]
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

function getEarliestSpan (spans) {
  var earliestSpan = null

  spans.forEach(function (span) {
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
