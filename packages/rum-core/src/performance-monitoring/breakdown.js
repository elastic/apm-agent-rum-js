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
  ['navigationStart', 'fetchStart', 'Request Stalled'],
  ['fetchStart', 'requestStart', 'Network'],
  ['requestStart', 'responseStart', 'TTFB'],
  ['domLoading', 'domInteractive', 'DOM Processing'],
  ['domInteractive', 'loadEventEnd', 'Page Render']
]

function getValue(value) {
  return { value }
}

function transactionBreakdownDetails({ name, type }) {
  return { name, type }
}

function spanBreakdownDetails({ type, subType = undefined }) {
  return { type, subtype: subType }
}

function getSpanBreakdown(span, transactionDetails) {
  const duration = span.duration()
  return {
    transaction: transactionDetails,
    span: spanBreakdownDetails(span),
    samples: {
      'span.self_time.count': getValue(1),
      'span.self_time.sum.us': getValue(duration)
    }
  }
}

/**
 * Capture breakdown metrics for the transaction based on the
 * transaction type
 */
export function captureBreakdown(transcation) {
  const breakdowns = []
  const trDuration = transcation.duration()
  const { type, sampled } = transcation
  const transactionBreakDownDetails = transactionBreakdownDetails(transcation)

  breakdowns.push({
    transaction: transactionBreakDownDetails,
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

  const timings = window.performance.timing
  if (type === PAGE_LOAD && timings) {
    for (let i = 0; i < pageLoadBreakdowns.length; i++) {
      const current = pageLoadBreakdowns[i]
      const start = timings[current[0]]
      const end = timings[current[1]]
      const duration = getDuration(start, end)
      if (duration == null) {
        continue
      }
      breakdowns.push(
        getSpanBreakdown(
          {
            type: current[2],
            duration: () => duration
          },
          transactionBreakDownDetails
        )
      )
    }
  } else {
    /**
     * Construct the breakdown timings based on span types
     */
    const spans = transcation.spans
    let childTimings = 0
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i]
      const duration = span.duration()
      childTimings += duration
      breakdowns.push(getSpanBreakdown(span, transactionBreakDownDetails))
    }
    /**
     * Associate rest of the breakdown time in `app`
     */
    if (childTimings < trDuration) {
      const duration = getDuration(childTimings, trDuration)
      breakdowns.push(
        getSpanBreakdown(
          {
            type: 'app',
            duration: () => duration
          },
          transactionBreakDownDetails
        )
      )
    }
  }
  return breakdowns
}
