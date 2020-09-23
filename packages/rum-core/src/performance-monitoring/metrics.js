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
  FIRST_CONTENTFUL_PAINT,
  FIRST_INPUT,
  LAYOUT_SHIFT
} from '../common/constants'
import { noop, PERF } from '../common/utils'
import Span from './span'

export const metrics = {
  fid: 0,
  fcp: 0,
  tbt: {
    start: Infinity,
    duration: 0
  },
  cls: 0,
  longtask: {
    count: 0,
    duration: 0,
    max: 0
  }
}

const LONG_TASK_THRESHOLD = 50
/**
 * Create Spans for the long task entries
 * Spec - https://w3c.github.io/longtasks/
 */
export function createLongTaskSpans(longtasks, agg) {
  const spans = []

  for (let i = 0; i < longtasks.length; i++) {
    /**
     * name of the long task can be any one of the type listed here
     * depeding on the origin of the longtask
     * https://w3c.github.io/longtasks/#sec-PerformanceLongTaskTiming
     */
    const { name, startTime, duration, attribution } = longtasks[i]
    const end = startTime + duration
    const span = new Span(`Longtask(${name})`, LONG_TASK, { startTime })
    agg.count++
    agg.duration += duration
    if (duration > agg.max) {
      agg.max = duration
    }

    /**
     * use attribution data to figure out the culprits of the longtask
     * https://w3c.github.io/longtasks/#sec-TaskAttributionTiming
     *
     * Based on the same-origin policy, we can figure out the culprit from
     * the attribution data
     */
    if (attribution.length > 0) {
      const { name, containerType, containerName, containerId } = attribution[0]

      /**
       * name - identifies the type of work responsible for the long task
       * such as `unknown`, `script`, `layout`
       *
       * containerType - type of the culprit browsing context container such as
       * 'iframe', 'embed', 'object' or 'window'
       *
       * Based on the container type, the name, id and src would be populated in
       * the respective fields when available or empty string (ex: If iframe
       * type caused the longtask, id and name of the Iframe would be populated)
       *
       * `containerSrc` is not used as it could be large url/blob and it would
       * increase the payload size, showing id/name would be enough to asosicate the origin
       */
      const customContext = {
        attribution: name,
        type: containerType
      }
      if (containerName) {
        customContext.name = containerName
      }
      if (containerId) {
        customContext.id = containerId
      }
      span.addContext({
        custom: customContext
      })
    }
    span.end(end)
    spans.push(span)
  }
  return spans
}

export function createFirstInputDelaySpan(fidEntries) {
  let firstInput = fidEntries[0]

  if (firstInput) {
    const { startTime, processingStart } = firstInput

    const span = new Span('First Input Delay', FIRST_INPUT, { startTime })
    span.end(processingStart)
    return span
  }
}

export function createTotalBlockingTimeSpan(tbtObject) {
  const { start, duration } = tbtObject
  const tbtSpan = new Span('Total Blocking Time', LONG_TASK, {
    startTime: start
  })
  tbtSpan.end(start + duration)
  return tbtSpan
}

/**
 * Calculate Total Blocking Time (TBT) from long tasks
 */
export function calculateTotalBlockingTime(longtaskEntries) {
  longtaskEntries.forEach(entry => {
    const { name, startTime, duration } = entry
    /**
     * FCP is picked as the lower bound because there is little risk of user input happening
     * before FCP and it will not harm user experience.
     */
    if (startTime < metrics.fcp) {
      return
    }
    /**
     * Account for long task originated only from the current browsing context
     * or from the same origin.
     * https://w3c.github.io/longtasks/#performancelongtasktiming
     */
    if (name !== 'self' && name.indexOf('same-origin') === -1) {
      return
    }
    /**
     * Calcualte the start time of the first long task so we can add it
     * as span start
     */
    metrics.tbt.start = Math.min(metrics.tbt.start, startTime)

    /**
     * Theoretically blocking time would always be greater than 0 as Long tasks are
     * tasks that exceeds 50ms, but this would be configurable in the future so
     * the > 0 check acts as an extra guard
     */
    const blockingTime = duration - LONG_TASK_THRESHOLD
    if (blockingTime > 0) {
      metrics.tbt.duration += blockingTime
    }
  })
}

/**
 * Calculates Cumulative Layout Shift using
 * 'layout-shift' entries captured through PerformanceObserver.
 * https://developer.mozilla.org/en-US/docs/Web/API/LayoutShift
 * https://web.dev/cls/
 */
export function calculateCumulativeLayoutShift(clsEntries) {
  clsEntries.forEach(entry => {
    if (!entry.hadRecentInput) {
      metrics.cls += entry.value
    }
  })
}

/**
 * Captures all the observed entries as Spans and Marks depending on the
 * observed entry types and returns in the format
 * {
 *   spans: [],
 *   marks: {}
 * }
 */
export function captureObserverEntries(list, { capturePaint }) {
  const longtaskEntries = list.getEntriesByType(LONG_TASK)
  const longTaskSpans = createLongTaskSpans(longtaskEntries, metrics.longtask)

  const result = {
    spans: longTaskSpans,
    marks: {}
  }
  /**
   * Paint timings like FCP and LCP are available only for page-load navigation
   */
  if (!capturePaint) {
    return result
  }
  /**
   * Largest Contentful Paint is a draft spec and its not W3C standard yet
   * Spec - https://wicg.github.io/largest-contentful-paint/
   */
  const lcpEntries = list.getEntriesByType(LARGEST_CONTENTFUL_PAINT)
  /**
   * There can be multiple LCP present on a single page load,
   * We need to always use the last one which takes all the lazy loaded
   * elements in to account
   */
  const lastLcpEntry = lcpEntries[lcpEntries.length - 1]

  if (lastLcpEntry) {
    /**
     * `startTime` -  equals to renderTime if it's nonzero, otherwise equal to loadTime.
     * `renderTime` will not be available for Image element and for the element
     * that is loaded cross-origin without the `Timing-Allow-Origin` header.
     */
    const lcp = parseInt(lastLcpEntry.startTime)
    metrics.lcp = lcp
    result.marks.largestContentfulPaint = lcp
  }

  /**
   * Paint Timing API
   * First Contentful Paint is available only during Page load
   * SPEC - https://www.w3.org/TR/paint-timing/
   */
  const timing = PERF.timing
  /**
   * To avoid capturing the unload event handler effect
   * as part of the page-load transaction duration
   */
  const unloadDiff = timing.fetchStart - timing.navigationStart
  const fcpEntry = list.getEntriesByName(FIRST_CONTENTFUL_PAINT)[0]
  if (fcpEntry) {
    const fcp = parseInt(
      unloadDiff >= 0 ? fcpEntry.startTime - unloadDiff : fcpEntry.startTime
    )
    metrics.fcp = fcp
    result.marks.firstContentfulPaint = fcp
  }

  /**
   * Capture First Input Delay (FID) as span
   */
  const fidEntries = list.getEntriesByType(FIRST_INPUT)
  const fidSpan = createFirstInputDelaySpan(fidEntries)
  if (fidSpan) {
    metrics.fid = fidSpan.duration()
    result.spans.push(fidSpan)
  }

  calculateTotalBlockingTime(longtaskEntries)
  const clsEntries = list.getEntriesByType(LAYOUT_SHIFT)
  calculateCumulativeLayoutShift(clsEntries)

  return result
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
     * observed for unknown entry types as longtasks and lcp is
     * not supported at the moment
     */
    try {
      /**
       * Start observing for different entry types depending on the transaction type
       * - Except longtasks other entries support buffered flag for performance entries
       * - `buffered`: true means we would be able to retrive all the events that happened
       * before calling the observe method
       * - We are using type instead of entryTypes in the options since
       *   browsers would throw error when using entryTypes options along with
       *   buffered flag (https://w3c.github.io/performance-timeline/#observe-method)
       */
      let buffered = true
      if (type === LONG_TASK) {
        buffered = false
      }
      this.po.observe({ type, buffered })
    } catch (_) {}
  }

  stop() {
    this.po.disconnect()
  }
}
