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

import { Span as otSpan } from 'opentracing/lib/span'
import { extend, getTimeOrigin } from '../common/utils'
import Transaction from '../performance-monitoring/transaction'

class Span extends otSpan {
  constructor(tracer, span) {
    super()
    this.__tracer = tracer
    this.span = span
    this.isTransaction = span instanceof Transaction
    this.spanContext = {
      id: span.id,
      traceId: span.traceId,
      sampled: span.sampled
    }
  }

  _context() {
    return this.spanContext
  }

  _tracer() {
    return this.__tracer
  }

  _setOperationName(name) {
    this.span.name = name
  }

  _addTags(keyValuePairs) {
    var tags = extend({}, keyValuePairs)
    if (tags.type) {
      this.span.type = tags.type
      delete tags.type
    }

    if (this.isTransaction) {
      const userId = tags['user.id']
      const username = tags['user.username']
      const email = tags['user.email']
      if (userId || username || email) {
        this.span.addContext({
          user: {
            id: userId,
            username,
            email
          }
        })
        delete tags['user.id']
        delete tags['user.username']
        delete tags['user.email']
      }
    }

    this.span.addLabels(tags)
  }
  // eslint-disable-next-line
  _log(log, timestamp) {
    if (log.event === 'error') {
      if (log['error.object']) {
        this.__tracer.errorLogging.logError(log['error.object'])
      } else if (log.message) {
        this.__tracer.errorLogging.logError(log.message)
      }
    }
  }

  _finish(finishTime) {
    this.span.end()
    if (finishTime) {
      this.span._end = finishTime - getTimeOrigin()
    }
  }
}

export default Span
