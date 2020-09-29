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

import { Promise } from './polyfills'
import {
  NAVIGATION_TIMING_MARKS,
  COMPRESSED_NAV_TIMING_MARKS
} from '../performance-monitoring/capture-navigation'

/**
 * Compression of all the below schema is based on the v3 RUM Specification
 * Mapping of existing fields can  be found here
 * https://github.com/elastic/apm-server/blob/master/model/modeldecoder/field/rum_v3_mapping.go
 */

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
  const { method, status_code, url, response } = http

  compressed.url = url
  if (method) {
    compressed.mt = method
  }
  if (status_code) {
    compressed.sc = status_code
  }
  if (response) {
    compressed.r = compressResponse(response)
  }

  return compressed
}

function compressContext(context) {
  if (!context) {
    return null
  }
  const compressed = {}
  const { page, http, response, destination, user, custom } = context

  if (page) {
    compressed.p = {
      rf: page.referer,
      url: page.url
    }
  }
  if (http) {
    compressed.h = compressHTTP(http)
  }
  if (response) {
    compressed.r = compressResponse(response)
  }
  if (destination) {
    const { service } = destination
    compressed.dt = {
      se: {
        n: service.name,
        t: service.type,
        rc: service.resource
      },
      ad: destination.address,
      po: destination.port
    }
  }
  if (user) {
    compressed.u = {
      id: user.id,
      un: user.username,
      em: user.email
    }
  }
  if (custom) {
    compressed.cu = custom
  }

  return compressed
}

function compressMarks(marks) {
  if (!marks) {
    return null
  }
  const { navigationTiming, agent } = marks
  const compressed = { nt: {} }

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
      d: span.duration,
      c: compressContext(span.context),
      o: span.outcome
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

  const tr = {
    id: transaction.id,
    tid: transaction.trace_id,
    n: transaction.name,
    t: transaction.type,
    d: transaction.duration,
    c: compressContext(transaction.context),
    m: compressMarks(transaction.marks),
    me: compressMetricsets(transaction.breakdown),
    y: spans,
    yc: {
      sd: spans.length
    },
    sm: transaction.sampled,
    o: transaction.outcome
  }

  if (transaction.experience) {
    let { cls, fid, tbt, longtask } = transaction.experience
    tr.exp = { cls, fid, tbt, lt: longtask }
  }

  return tr
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

/**
 * Compress the payload object using the draft
 * CompressionStream spec supported only in Chromium browsers
 * Spec : https://wicg.github.io/compression/
 */
export function compressPayload(payload, headers, type = 'gzip') {
  const isCompressionStreamSupported = typeof CompressionStream === 'function'
  return new Promise(resolve => {
    /**
     * Resolve with unmodified payload if the compression stream
     * is not supported in browser
     */
    if (!isCompressionStreamSupported) {
      return resolve({ payload, headers })
    }

    /**
     * create a blob with the original payload data and convert it
     * as readable stream
     */
    const payloadStream = new Blob([payload]).stream()
    /**
     * pipe the readable stream from blob through the compression stream which is a
     * transform stream that reads blobs contents to its destination (writable)
     */
    const compressedStream = payloadStream.pipeThrough(
      new CompressionStream(type)
    )
    /**
     * Response accepts a readable stream as input and reads its to completion
     * to generate the Blob content
     */
    return new Response(compressedStream).blob().then(payload => {
      headers['Content-Encoding'] = type
      return resolve({ payload, headers })
    })
  })
}
