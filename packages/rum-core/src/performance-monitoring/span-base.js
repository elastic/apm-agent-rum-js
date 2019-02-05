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

const { isUndefined, generateRandomId, setTag, merge } = require('../common/utils')
class SpanBase {
  // context

  constructor (name, type, options) {
    this.options = options || {}
    this.name = name || this.options.name || 'Unknown'
    this.type = type || this.options.type || 'custom'
    this.id = this.options.id || generateRandomId(16)
    this.traceId = this.options.traceId
    this.sampled = this.options.sampled
    this.timestamp = this.options.timestamp || Date.now()
    this.ended = false
    this._start = window.performance.now()
    this._end = undefined
    this.onEnd = this.options.onEnd
  }

  ensureContext () {
    if (!this.context) {
      this.context = {}
    }
  }

  addTags (tags) {
    this.ensureContext()
    var ctx = this.context
    if (!ctx.tags) {
      ctx.tags = {}
    }
    var keys = Object.keys(tags)
    keys.forEach(function (k) {
      setTag(k, tags[k], ctx.tags)
    })
  }

  addContext (context) {
    if (!context) return
    this.ensureContext()
    merge(this.context, context)
  }

  end () {
    if (this.ended) {
      return
    }
    this.ended = true
    this._end = window.performance.now()

    this.callOnEnd()
  }

  callOnEnd () {
    if (typeof this.onEnd === 'function') {
      this.onEnd(this)
    }
  }

  duration () {
    if (isUndefined(this._end) || isUndefined(this._start)) {
      return null
    }

    var diff = this._end - this._start

    return parseFloat(diff)
  }
}

module.exports = SpanBase
