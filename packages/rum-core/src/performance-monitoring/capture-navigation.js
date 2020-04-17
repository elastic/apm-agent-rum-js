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

import Span from './span'
import {
  RESOURCE_INITIATOR_TYPES,
  MAX_SPAN_DURATION,
  USER_TIMING_THRESHOLD,
  PAGE_LOAD,
  RESOURCE,
  MEASURE
} from '../common/constants'
import {
  stripQueryStringFromUrl,
  PERF,
  isPerfTimelineSupported
} from '../common/utils'

/**
 * Navigation Timing Spans
 *
 * eventPairs[0] -> start time of span
 * eventPairs[1] -> end time of span
 * eventPairs[2] -> name of the span
 */
const eventPairs = [
  ['domainLookupStart', 'domainLookupEnd', 'Domain lookup'],
  ['connectStart', 'connectEnd', 'Making a connection to the server'],
  ['requestStart', 'responseEnd', 'Requesting and receiving the document'],
  [
    'domLoading',
    'domInteractive',
    'Parsing the document, executing sync. scripts'
  ],
  [
    'domContentLoadedEventStart',
    'domContentLoadedEventEnd',
    'Fire "DOMContentLoaded" event'
  ],
  ['loadEventStart', 'loadEventEnd', 'Fire "load" event']
]

/**
 * start, end, baseTime - unsigned long long(PerformanceTiming)
 * representing the moment, in milliseconds since the UNIX epoch
 *
 * trStart & trEnd - DOMHighResTimeStamp, measured in milliseconds.
 *
 * We have to convert the long values in milliseconds before doing the comparision
 * eg: end - baseTime <= transactionEnd
 */
function shouldCreateSpan(start, end, trStart, trEnd, baseTime = 0) {
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    start >= baseTime &&
    end > start &&
    start - baseTime >= trStart &&
    end - baseTime <= trEnd &&
    end - start < MAX_SPAN_DURATION &&
    start - baseTime < MAX_SPAN_DURATION &&
    end - baseTime < MAX_SPAN_DURATION
  )
}

function createNavigationTimingSpans(timings, baseTime, trStart, trEnd) {
  const spans = []
  for (let i = 0; i < eventPairs.length; i++) {
    const start = timings[eventPairs[i][0]]
    const end = timings[eventPairs[i][1]]

    if (!shouldCreateSpan(start, end, trStart, trEnd, baseTime)) {
      continue
    }
    const span = new Span(eventPairs[i][2], 'hard-navigation.browser-timing')
    if (eventPairs[i][0] === 'requestStart') {
      span.pageResponse = true
    }
    span._start = start - baseTime
    span.end(end - baseTime)
    spans.push(span)
  }
  return spans
}

function createResourceTimingSpan(resourceTimingEntry) {
  const { name, initiatorType, startTime, responseEnd } = resourceTimingEntry
  let kind = 'resource'
  if (initiatorType) {
    kind += '.' + initiatorType
  }
  const spanName = stripQueryStringFromUrl(name)
  const span = new Span(spanName, kind)

  span._start = startTime
  span.end(responseEnd, { url: name, entry: resourceTimingEntry })
  return span
}

function createResourceTimingSpans(entries, filterUrls, trStart, trEnd) {
  const spans = []
  for (let i = 0; i < entries.length; i++) {
    let { initiatorType, name, startTime, responseEnd } = entries[i]
    /**
     * Skipping the timing information of API calls because of auto patching XHR and Fetch
     */
    if (
      initiatorType === 'xmlhttprequest' ||
      initiatorType === 'fetch' ||
      !name
    ) {
      continue
    }
    /**
     * Create spans for all known resource initiator types
     */
    if (RESOURCE_INITIATOR_TYPES.indexOf(initiatorType) !== -1) {
      if (!shouldCreateSpan(startTime, responseEnd, trStart, trEnd)) {
        continue
      }
      spans.push(createResourceTimingSpan(entries[i]))
    } else {
      /**
       * Since IE does not support initiatorType in Resource timing entry,
       * We have to manually filter the API calls from creating duplicate Spans
       *
       * Skip span creation if initiatorType is other than known types specified as part of RESOURCE_INITIATOR_TYPES
       * The reason being, there are other types like embed, video, audio, navigation etc
       *
       * Check the below webplatform test to know more
       * https://github.com/web-platform-tests/wpt/blob/b0020d5df18998609b38786878f7a0b92cc680aa/resource-timing/resource_initiator_types.html#L93
       */
      if (initiatorType != null) {
        continue
      }

      let foundAjaxReq = false
      for (let j = 0; j < filterUrls.length; j++) {
        const idx = name.lastIndexOf(filterUrls[j])
        if (idx > -1 && idx === name.length - filterUrls[j].length) {
          foundAjaxReq = true
          break
        }
      }
      /**
       * Create span if its not an ajax request
       */
      if (
        !foundAjaxReq &&
        shouldCreateSpan(startTime, responseEnd, trStart, trEnd)
      ) {
        spans.push(createResourceTimingSpan(entries[i]))
      }
    }
  }
  return spans
}

function createUserTimingSpans(entries, trStart, trEnd) {
  const userTimingSpans = []
  for (let i = 0; i < entries.length; i++) {
    const { name, startTime, duration } = entries[i]
    const end = startTime + duration

    if (
      duration <= USER_TIMING_THRESHOLD ||
      !shouldCreateSpan(startTime, end, trStart, trEnd)
    ) {
      continue
    }
    const kind = 'app'
    const span = new Span(name, kind)
    span._start = startTime
    span.end(end)

    userTimingSpans.push(span)
  }
  return userTimingSpans
}

function getApiSpanNames({ spans }) {
  const apiCalls = []

  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    if (span.type === 'external' && span.subtype === 'http') {
      apiCalls.push(span.name.split(' ')[1])
    }
  }
  return apiCalls
}

const navigationTimingKeys = [
  'fetchStart',
  'domainLookupStart',
  'domainLookupEnd',
  'connectStart',
  'connectEnd',
  'secureConnectionStart',
  'requestStart',
  'responseStart',
  'responseEnd',
  'domLoading',
  'domInteractive',
  'domContentLoadedEventStart',
  'domContentLoadedEventEnd',
  'domComplete',
  'loadEventStart',
  'loadEventEnd'
]

function getNavigationTimingMarks() {
  const timing = PERF.timing
  const fetchStart = timing.fetchStart
  const marks = {}
  navigationTimingKeys.forEach(function(timingKey) {
    const m = timing[timingKey]
    if (m && m >= fetchStart) {
      marks[timingKey] = m - fetchStart
    }
  })
  return marks
}

function getPageLoadMarks() {
  const marks = getNavigationTimingMarks()
  const agent = {
    timeToFirstByte: marks.responseStart,
    domInteractive: marks.domInteractive,
    domComplete: marks.domComplete
  }
  return {
    navigationTiming: marks,
    agent
  }
}

function captureNavigation(transaction) {
  /**
   * Do not capture timing related information when the
   * flag is set to false, By default both page-load and route-change
   * transactions set this flag to true
   */
  if (!transaction.captureTimings) {
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
    createNavigationTimingSpans(
      timings,
      timings.fetchStart,
      trStart,
      trEnd
    ).forEach(span => {
      span.traceId = transaction.traceId
      span.sampled = transaction.sampled
      if (span.pageResponse && transaction.options.pageLoadSpanId) {
        span.id = transaction.options.pageLoadSpanId
      }
      transaction.spans.push(span)
    })

    /**
     * Page load marks that are gathered from navigation and paint timing API
     */
    transaction.addMarks(getPageLoadMarks())
  }

  if (isPerfTimelineSupported()) {
    const trStart = transaction._start
    /**
     * Capture resource timing information as spans
     */
    const resourceEntries = PERF.getEntriesByType(RESOURCE)
    const apiCalls = getApiSpanNames(transaction)

    createResourceTimingSpans(
      resourceEntries,
      apiCalls,
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
  createUserTimingSpans
}
