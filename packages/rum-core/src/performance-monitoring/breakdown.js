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

import { getDuration, PERF } from '../common/utils'
import { PAGE_LOAD, TRUNCATED_TYPE } from '../common/constants'

/**
 * Page load transaction breakdown timings
 *
 * Interested events from the Navigation timing API
 */
const pageLoadBreakdowns = [
  ['domainLookupStart', 'domainLookupEnd', 'DNS'],
  ['connectStart', 'connectEnd', 'TCP'],
  ['requestStart', 'responseStart', 'Request'],
  ['responseStart', 'responseEnd', 'Response'],
  ['domLoading', 'domComplete', 'Processing'],
  ['loadEventStart', 'loadEventEnd', 'Load']
]

function getValue(value) {
  return { value }
}

function calculateSelfTime(transaction) {
  const { spans, _start, _end } = transaction
  /**
   * When there are no spans transaction duration accounts for
   * the overall self time
   */
  if (spans.length === 0) {
    return transaction.duration()
  }
  /**
   * The below selfTime calculation logic assumes the spans are sorted
   * based on the start time
   */
  spans.sort((span1, span2) => span1._start - span2._start)

  let span = spans[0]
  let spanEnd = span._end
  let spanStart = span._start

  let lastContinuousEnd = spanEnd
  let selfTime = spanStart - _start

  for (let i = 1; i < spans.length; i++) {
    span = spans[i]
    spanStart = span._start
    spanEnd = span._end

    /**
     * Add the gaps between the spans to the self time
     */
    if (spanStart > lastContinuousEnd) {
      selfTime += spanStart - lastContinuousEnd
      lastContinuousEnd = spanEnd
    } else if (spanEnd > lastContinuousEnd) {
      lastContinuousEnd = spanEnd
    }
  }
  /**
   * Add the remaining gaps in transaction duration to
   * the self time of the transaction
   */
  if (lastContinuousEnd < _end) {
    selfTime += _end - lastContinuousEnd
  }
  return selfTime
}

/**
 * Group spans based on type and subtype to capture the breakdown
 */
function groupSpans(transaction) {
  const spanMap = {}
  const transactionSelfTime = calculateSelfTime(transaction)
  /**
   * Add transaction self time as `app` in the breakdown
   */
  spanMap['app'] = {
    count: 1,
    duration: transactionSelfTime
  }

  const spans = transaction.spans
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    const duration = span.duration()
    if (duration === 0 || duration == null) {
      continue
    }
    const { type, subtype } = span
    /**
     * Ignore calculating truncated spans as separate types in breakdown
     */
    let key = type.replace(TRUNCATED_TYPE, '')
    if (subtype) {
      key += '.' + subtype
    }
    if (!spanMap[key]) {
      spanMap[key] = {
        duration: 0,
        count: 0
      }
    }
    spanMap[key].count++
    spanMap[key].duration += duration
  }

  return spanMap
}

function getSpanBreakdown(
  transactionDetails,
  { details, count = 1, duration }
) {
  return {
    transaction: transactionDetails,
    span: details,
    samples: {
      'span.self_time.count': getValue(count),
      'span.self_time.sum.us': getValue(duration)
    }
  }
}

/**
 * Capture breakdown metrics for the transaction based on the
 * transaction type
 */
export function captureBreakdown(transaction, timings = PERF.timing) {
  const breakdowns = []
  const trDuration = transaction.duration()
  const { name, type, sampled } = transaction
  const transactionDetails = { name, type }

  breakdowns.push({
    transaction: transactionDetails,
    samples: {
      'transaction.duration.count': getValue(1),
      'transaction.duration.sum.us': getValue(trDuration),
      'transaction.breakdown.count': getValue(sampled ? 1 : 0)
    }
  })

  /**
   * Capture breakdown metrics only for sampled transactions
   */
  if (!sampled) {
    return breakdowns
  }

  if (type === PAGE_LOAD && timings) {
    for (let i = 0; i < pageLoadBreakdowns.length; i++) {
      const current = pageLoadBreakdowns[i]
      const start = timings[current[0]]
      const end = timings[current[1]]
      const duration = getDuration(start, end)
      if (duration === 0 || duration == null) {
        continue
      }
      breakdowns.push(
        getSpanBreakdown(transactionDetails, {
          details: { type: current[2] },
          duration
        })
      )
    }
  } else {
    /**
     * Construct the breakdown timings based on span types
     */
    const spanMap = groupSpans(transaction)
    Object.keys(spanMap).forEach(key => {
      const [type, subtype] = key.split('.')
      const { duration, count } = spanMap[key]
      breakdowns.push(
        getSpanBreakdown(transactionDetails, {
          details: { type, subtype },
          duration,
          count
        })
      )
    })
  }
  return breakdowns
}
