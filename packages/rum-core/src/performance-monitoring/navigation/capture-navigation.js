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
  PERF,
  isPerfTimelineSupported,
  isRedirectInfoAvailable
} from '../../common/utils'
import { PAGE_LOAD, RESOURCE, MEASURE } from '../../common/constants'
import { state } from '../../state'
import { createNavigationTimingSpans } from './navigation-timing'
import { createUserTimingSpans } from './user-timing'
import { createResourceTimingSpans } from './resource-timing'
import { getPageLoadMarks } from './marks'

function captureNavigation(transaction) {
  /**
   * Do not capture timing related information when the
   * flag is set to false, By default both page-load and route-change
   * transactions set this flag to true
   */
  if (!transaction.captureTimings) {
    /**
     * Make sure page load transactions always starts at 0 irrespective if we capture navigation metrics or not
     * otherwise we would be reporting different page load durations for sampled and unsampled transactions
     */
    if (transaction.type === PAGE_LOAD) {
      transaction._start = 0
    }

    return
  }

  /**
   * Both start and end threshold decides if a span must be
   * captured as part of the transaction
   */
  const trEnd = transaction._end
  /**
   * Page load is considered as hard navigation and we account
   * for few extra spans than soft navigations which
   * happens on single page applications
   */
  if (transaction.type === PAGE_LOAD) {
    /**
     * Adjust custom marks properly to fit in the transaction timeframe
     */
    if (transaction.marks && transaction.marks.custom) {
      const customMarks = transaction.marks.custom
      Object.keys(customMarks).forEach(key => {
        customMarks[key] += transaction._start
      })
    }
    /**
     * must be zero otherwise the calculated relative _start time would be wrong
     */
    const trStart = 0
    transaction._start = trStart

    const timings = PERF.timing
    const baseTime = isRedirectInfoAvailable(timings)
      ? timings.redirectStart // make sure navigation spans will show up after the Redirect span
      : timings.fetchStart

    createNavigationTimingSpans(timings, baseTime, trStart, trEnd).forEach(
      span => {
        span.traceId = transaction.traceId
        span.sampled = transaction.sampled
        if (span.pageResponse && transaction.options.pageLoadSpanId) {
          span.id = transaction.options.pageLoadSpanId
        }
        transaction.spans.push(span)
      }
    )

    /**
     * Page load marks that are gathered from NavigationTiming API
     */
    transaction.addMarks(getPageLoadMarks(timings))
  }

  if (isPerfTimelineSupported()) {
    const trStart = transaction._start
    /**
     * Capture resource timing information as spans
     */
    const resourceEntries = PERF.getEntriesByType(RESOURCE)
    createResourceTimingSpans(
      resourceEntries,
      state.bootstrapTime,
      trStart,
      trEnd
    ).forEach(span => transaction.spans.push(span))

    /**
     * Capture user timing measures as spans
     */
    const userEntries = PERF.getEntriesByType(MEASURE)
    createUserTimingSpans(userEntries, trStart, trEnd).forEach(span =>
      transaction.spans.push(span)
    )
  }
}

export {
  captureNavigation,
  createNavigationTimingSpans,
  createResourceTimingSpans,
  createUserTimingSpans,
  getPageLoadMarks
}
