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
  LONG_TASK,
  LARGEST_CONTENTFUL_PAINT,
  PAGE_LOAD
} from '../common/constants'
import { noop } from '../common/utils'
import Span from './span'

/**
 * Create Spans for the long task entries
 *
 * TODO: Make use of the long task attribution data
 */
function createLongTaskSpans(longtasks) {
  if (longtasks.length === 0) {
    return
  }

  const longTaskSpans = []
  for (let i = 0; i < longtasks.length; i++) {
    const { name, startTime, duration } = longtasks[i]
    const end = startTime + duration
    const kind = LONG_TASK
    const span = new Span(`Longtask(${name})`, kind, { startTime })
    span.end(end)

    longTaskSpans.push(span)
  }
  return longTaskSpans
}

export function onPerformanceEntry(list, transaction) {
  const longtaskEntries = list.getEntriesByType(LONG_TASK)

  transaction.spans.push(...createLongTaskSpans(longtaskEntries))
  /**
   * Paint timings like FCP and LCP are available only for page-load navigation
   */
  if (transaction.type !== PAGE_LOAD) {
    return
  }

  const lcpEntries = list.getEntriesByType(LARGEST_CONTENTFUL_PAINT)
  /**
   * There can be multiple LCP present on a single page load,
   * We need to always use the last one which takes all the lazy loaded
   * elements in to account
   */
  const lastLcpEntry = lcpEntries[lcpEntries.length - 1]
  if (!lastLcpEntry) {
    return
  }
  /**
   * `renderTime` will not be available for Image element and for the element
   * that is loaded cross-origin without the `Timing-Allow-Origin` header.
   */
  transaction.addMarks({
    agent: {
      largestContentfulPaint: lastLcpEntry.renderTime || lastLcpEntry.loadTime
    }
  })
}

/**
 * Records all performance entry events available via Performance Observer
 * and fallbacks to Performance Timeline if not supported
 *
 * Entry types such as `resource`, `paint` and `measure` are recorded via
 * Performance Timeline instead of the Observer since the buffering for
 * certian events are not supported and we would end up in using both
 * in certian browsers which adds performance cost.
 *
 * So we stick to PerformanceObserver only for new entry types like `longtask` and
 * `largest-contentful-paint`
 */
export class PerfEntryRecorder {
  constructor(callback) {
    this.po = {
      observe: noop,
      disconnect: noop
    }
    if (window.PerformanceObserver) {
      this.po = new PerformanceObserver(callback)
    }
  }

  start(type) {
    /**
     * Safari throws an error when PerformanceObserver is
     * observed for unknown entry types
     */
    try {
      /**
       * Except longtasks other entries support buffered
       * performance entries
       */
      if (type === PAGE_LOAD) {
        this.po.observe({ type: LARGEST_CONTENTFUL_PAINT, buffered: true })
      }
      this.po.observe({ type: LONG_TASK })
    } catch (_) {}
  }

  stop() {
    this.po.disconnect()
  }
}
