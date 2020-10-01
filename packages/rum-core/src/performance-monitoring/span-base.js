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

import {
  generateRandomId,
  setLabel,
  merge,
  getDuration,
  getTime
} from '../common/utils'
import { NAME_UNKNOWN, TYPE_CUSTOM } from '../common/constants'

class SpanBase {
  constructor(name, type, options = {}) {
    /**
     * Check for undefined and empty string
     */
    if (!name) {
      name = NAME_UNKNOWN
    }
    if (!type) {
      type = TYPE_CUSTOM
    }
    this.name = name
    this.type = type
    this.options = options
    this.id = options.id || generateRandomId(16)
    this.traceId = options.traceId
    this.sampled = options.sampled
    this.timestamp = options.timestamp
    this._start = getTime(options.startTime)
    this._end = undefined
    this.ended = false
    this.outcome = undefined
    this.onEnd = options.onEnd
  }

  ensureContext() {
    if (!this.context) {
      this.context = {}
    }
  }

  addLabels(tags) {
    this.ensureContext()
    var ctx = this.context
    if (!ctx.tags) {
      ctx.tags = {}
    }
    var keys = Object.keys(tags)
    keys.forEach(k => setLabel(k, tags[k], ctx.tags))
  }

  addContext(...context) {
    if (context.length === 0) return
    this.ensureContext()
    merge(this.context, ...context)
  }

  end(endTime) {
    if (this.ended) {
      return
    }
    this.ended = true
    this._end = getTime(endTime)

    this.callOnEnd()
  }

  callOnEnd() {
    if (typeof this.onEnd === 'function') {
      this.onEnd(this)
    }
  }

  duration() {
    return getDuration(this._start, this._end)
  }
}

export default SpanBase
