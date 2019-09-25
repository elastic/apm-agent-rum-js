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

import { getDuration } from '../common/utils'
import { PAGE_LOAD } from '../common/constants'

/**
 * Page load transaction breakdown timings
 *
 * Interested events from the Navigation timing API
 */
const pageLoadBreakdowns = [
  ['fetchStart', 'responseEnd', 'Network'],
  ['domLoading', 'domInteractive', 'DOM Processing'],
  ['domInteractive', 'loadEventEnd', 'Page Render']
]

function getValue(value) {
  return { value }
}

/**
 * Group spans based on type and subtype to capture the breakdown
 */
function groupSpans(transaction) {
  const spanMap = {}
  const transactionSelfTime = transaction.selfTime
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
    const { type, subType } = span
    const duration = span.duration()
    if (duration === 0 || duration == null) {
      continue
    }
    let key = type
    if (subType) {
      key += '.' + subType
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
export function captureBreakdown(
  transaction,
  timings = window.performance.timing
) {
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
