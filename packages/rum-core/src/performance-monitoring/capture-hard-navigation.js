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
  USER_TIMING_THRESHOLD
} from '../common/constants'
import { stripQueryStringFromUrl, getServerTimingInfo } from '../common/utils'

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
 * transactionEnd - DOMHighResTimeStamp, measured in milliseconds.
 *
 * We have to convert the long values in milliseconds before doing the comparision
 * eg: end - baseTime <= transactionEnd
 */
function shouldCreateSpan(start, end, baseTime, transactionEnd) {
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    start >= baseTime &&
    end > start &&
    end - baseTime <= transactionEnd &&
    end - start < MAX_SPAN_DURATION &&
    start - baseTime < MAX_SPAN_DURATION &&
    end - baseTime < MAX_SPAN_DURATION
  )
}

/**
 * Both Navigation and Resource timing level 2 exposes these below information
 *
 * for CORS requests without Timing-Allow-Origin header, transferSize & encodedBodySize will be 0
 */
function getResponseContext(perfTimingEntry) {
  const {
    transferSize,
    encodedBodySize,
    decodedBodySize,
    serverTiming
  } = perfTimingEntry

  const respContext = {
    transfer_size: transferSize,
    encoded_body_size: encodedBodySize,
    decoded_body_size: decodedBodySize
  }
  const serverTimingStr = getServerTimingInfo(serverTiming)
  if (serverTimingStr) {
    respContext.headers = {
      'server-timing': serverTimingStr
    }
  }
  return respContext
}

function createNavigationTimingSpans(timings, baseTime, transactionEnd) {
  const spans = []
  for (let i = 0; i < eventPairs.length; i++) {
    const start = timings[eventPairs[i][0]]
    const end = timings[eventPairs[i][1]]

    if (!shouldCreateSpan(start, end, baseTime, transactionEnd)) {
      continue
    }
    const span = new Span(eventPairs[i][2], 'hard-navigation.browser-timing')
    if (eventPairs[i][0] === 'requestStart') {
      span.pageResponse = true
    }
    span._start = start - baseTime
    span.ended = true
    span._end = end - baseTime
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
  /**
   * Add context information for spans
   */
  span.addContext({
    http: {
      url: name,
      response: getResponseContext(resourceTimingEntry)
    }
  })
  span._start = startTime
  span.end()
  span._end = responseEnd
  return span
}

function createResourceTimingSpans(entries, filterUrls, transactionEnd) {
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
      if (!shouldCreateSpan(startTime, responseEnd, 0, transactionEnd)) {
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
        shouldCreateSpan(startTime, responseEnd, 0, transactionEnd)
      ) {
        spans.push(createResourceTimingSpan(entries[i]))
      }
    }
  }
  return spans
}

function createUserTimingSpans(entries, transactionEnd) {
  const userTimingSpans = []
  for (let i = 0; i < entries.length; i++) {
    const { name, startTime, duration } = entries[i]
    const end = startTime + duration

    if (
      duration <= USER_TIMING_THRESHOLD ||
      !shouldCreateSpan(startTime, end, 0, transactionEnd)
    ) {
      continue
    }
    const kind = 'app'
    const span = new Span(name, kind)
    span._start = startTime
    span.end()
    span._end = end

    userTimingSpans.push(span)
  }
  return userTimingSpans
}

function captureHardNavigation(transaction) {
  const perf = window.performance
  if (transaction.isHardNavigation && perf && perf.timing) {
    const timings = perf.timing
    if (transaction.marks && transaction.marks.custom) {
      var customMarks = transaction.marks.custom
      Object.keys(customMarks).forEach(key => {
        customMarks[key] += transaction._start
      })
    }

    // must be zero otherwise the calculated relative _start time would be wrong
    transaction._start = 0

    /**
     * Threshold that decides if the span must be
     * captured as part of the page load transaction
     *
     * Denotes the time when the onload event fires
     */
    const transactionEnd = transaction._end

    createNavigationTimingSpans(
      timings,
      timings.fetchStart,
      transactionEnd
    ).forEach(span => {
      span.traceId = transaction.traceId
      span.sampled = transaction.sampled
      if (span.pageResponse && transaction.options.pageLoadSpanId) {
        span.id = transaction.options.pageLoadSpanId
      }
      transaction.spans.push(span)
    })

    /**
     * capture resource timing information as Spans during page load transaction
     */
    if (typeof perf.getEntriesByType === 'function') {
      const resourceEntries = perf.getEntriesByType('resource')

      const ajaxUrls = []
      for (let i = 0; i < transaction.spans; i++) {
        const span = transaction.spans[i]

        if (span.type === 'external' && span.subType === 'http') {
          continue
        }
        ajaxUrls.push(span.name.split(' ')[1])
      }
      createResourceTimingSpans(
        resourceEntries,
        ajaxUrls,
        transactionEnd
      ).forEach(span => transaction.spans.push(span))

      const userEntries = perf.getEntriesByType('measure')
      createUserTimingSpans(userEntries, transactionEnd).forEach(span =>
        transaction.spans.push(span)
      )

      /**
       * Add transaction context information from performance navigation timing entry level 2 API
       */
      let navigationEntry = perf.getEntriesByType('navigation')
      if (navigationEntry && navigationEntry.length > 0) {
        navigationEntry = navigationEntry[0]
        transaction.addContext({
          response: getResponseContext(navigationEntry)
        })
      }
    }
  }
}

export {
  captureHardNavigation,
  createNavigationTimingSpans,
  createResourceTimingSpans,
  createUserTimingSpans
}
