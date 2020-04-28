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

import { NAVIGATION_TIMING_MARKS } from '../performance-monitoring/capture-navigation'

const COMPRESSED_NAV_TIMING_MARKS = [
  'fs',
  'ls',
  'le',
  'cs',
  'ce',
  'qs',
  'rs',
  're',
  'dl',
  'di',
  'ds',
  'de',
  'dc',
  'es',
  'ee'
]

function compressStackFrames(frames) {
  return frames.map(frame => ({
    ap: frame.abs_path,
    f: frame.filename,
    fn: frame.function,
    li: frame.lineno,
    co: frame.colno
  }))
}

function compressResponse(response) {
  return {
    ts: response.transfer_size,
    ebs: response.encoded_body_size,
    dbs: response.decoded_body_size
  }
}

function compressHTTP(http) {
  const compressed = {}
  for (const key of Object.keys(http)) {
    const value = http[key]
    switch (key) {
      case 'method':
        compressed.mt = value
        break
      case 'status_code':
        compressed.sc = value
        break
      case 'url':
        compressed.url = value
        break
      case 'response':
        compressed.r = compressResponse(value)
        break
    }
  }
  return compressed
}

function compressContext(context) {
  const compressed = {}
  for (const key of Object.keys(context)) {
    const value = context[key]
    switch (key) {
      case 'page':
        compressed.p = {
          rf: value.referer,
          url: value.url
        }
        break
      case 'http':
        compressed.h = compressHTTP(value)
        break
      case 'response':
        compressed.r = compressResponse(value)
        break
      case 'user':
        compressed.u = {
          id: value.id,
          un: value.username,
          em: value.email
        }
        break
      case 'destination':
        const { service } = value
        compressed.dt = {
          se: {
            n: service.name,
            t: service.type,
            rc: service.resource
          },
          ad: value.address,
          po: value.port
        }
        break
      case 'custom':
        compressed.cu = value
        break
    }
  }
  return compressed
}

function compressMarks(marks) {
  const { navigationTiming, agent } = marks
  const compressed = { nt: {}, a: {} }

  COMPRESSED_NAV_TIMING_MARKS.forEach((mark, index) => {
    const mapping = NAVIGATION_TIMING_MARKS[index]
    compressed.nt[mark] = navigationTiming[mapping]
  })

  compressed.a = {
    fb: compressed.nt.rs,
    di: compressed.nt.di,
    dc: compressed.nt.dc
  }
  const fp = agent.firstContentfulPaint
  const lp = agent.largestContentfulPaint
  if (fp) {
    compressed.a.fp = fp
  }
  if (lp) {
    compressed.a.lp = lp
  }

  return compressed
}

export function compressMetadata(metadata) {
  const { service, labels } = metadata
  const { agent, language } = service
  return {
    se: {
      n: service.name,
      ve: service.version,
      a: {
        n: agent.name,
        ve: agent.version
      },
      la: {
        n: language.name
      },
      en: service.environment
    },
    l: labels
  }
}

export function compressTransaction(transaction) {
  const spans = transaction.spans.map(span => {
    const spanData = {
      id: span.id,
      n: span.name,
      t: span.type,
      s: span.start,
      d: span.duration
    }
    if (span.context) {
      spanData.c = compressContext(span.context)
    }
    /**
     * Set parentId only for spans that are child of other spans
     * and not transaction as it will be inferred
     */
    if (span.parent_id !== transaction.id) {
      spanData.pid = span.parent_id
    }
    /**
     * Set the below fields only when they are truthy or exists
     */
    if (span.sync === true) {
      spanData.sy = true
    }
    if (span.subtype) {
      spanData.su = span.subtype
    }
    if (span.action) {
      spanData.ac = span.action
    }
    return spanData
  })

  return {
    id: transaction.id,
    tid: transaction.trace_id,
    n: transaction.name,
    t: transaction.type,
    d: transaction.duration,
    c: compressContext(transaction.context),
    m: compressMarks(transaction.marks),
    b: compressMetricsets(transaction.breakdown),
    y: spans,
    yc: {
      sd: spans.length
    },
    sm: transaction.sampled
  }
}

export function compressError(error) {
  const { exception } = error
  const compressed = {
    id: error.id,
    cl: error.culprit,
    ex: {
      mg: exception.message,
      st: compressStackFrames(exception.stacktrace),
      t: error.type
    },
    c: compressContext(error.context)
  }

  const { transaction } = error
  if (transaction) {
    compressed.tid = error.trace_id
    compressed.pid = error.parent_id
    compressed.xid = error.transaction_id
    compressed.x = {
      t: transaction.type,
      sm: transaction.sampled
    }
  }

  return compressed
}

export function compressMetricsets(breakdowns) {
  return breakdowns.map(({ span, samples }) => {
    const isSpan = span != null
    if (isSpan) {
      return {
        y: { t: span.type },
        sa: {
          ysc: {
            v: samples['span.self_time.count'].value
          },
          yss: {
            v: samples['span.self_time.sum.us'].value
          }
        }
      }
    }
    return {
      sa: {
        xdc: {
          v: samples['transaction.duration.count'].value
        },
        xds: {
          v: samples['transaction.duration.sum.us'].value
        },
        xbc: {
          v: samples['transaction.breakdown.count'].value
        }
      }
    }
  })
}
