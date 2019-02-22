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

const Span = require('./span')
const {
  RESOURCE_INITIATOR_TYPES,
  SPAN_THRESHOLD
} = require('../common/constants')
const { stripQueryStringFromUrl } = require('../common/utils')

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

function isValidSpan(transaction, span) {
  const duration = span.duration()
  return (
    duration < SPAN_THRESHOLD &&
    duration > 0 &&
    span._start <= transaction._end &&
    span._end <= transaction._end
  )
}

function isValidPerformanceTiming(start, end, baseTime = 0) {
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    start >= baseTime &&
    end > start &&
    end - start < SPAN_THRESHOLD &&
    start - baseTime < SPAN_THRESHOLD &&
    end - baseTime < SPAN_THRESHOLD
  )
}

function createNavigationTimingSpans(timings, baseTime) {
  const spans = []
  for (let i = 0; i < eventPairs.length; i++) {
    const start = timings[eventPairs[i][0]]
    const end = timings[eventPairs[i][1]]

    if (!isValidPerformanceTiming(start, end, baseTime)) {
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

function createResourceTimingSpan(name, initiatorType, start, end) {
  let kind = 'resource'
  if (initiatorType) {
    kind += '.' + initiatorType
  }
  const spanName = stripQueryStringFromUrl(name)
  const span = new Span(spanName, kind)
  span.addContext({ http: { url: name } })
  span._start = start
  span.ended = true
  span._end = end
  return span
}

function createResourceTimingSpans(entries, filterUrls) {
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
    } else if (!isValidPerformanceTiming(startTime, responseEnd)) {
      continue
    }

    /**
     * Create spans for all known resource initiator types
     */
    if (RESOURCE_INITIATOR_TYPES.indexOf(initiatorType) !== -1) {
      spans.push(
        createResourceTimingSpan(name, initiatorType, startTime, responseEnd)
      )
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
      if (!foundAjaxReq) {
        spans.push(
          createResourceTimingSpan(name, initiatorType, startTime, responseEnd)
        )
      }
    }
  }
  return spans
}

function captureHardNavigation(transaction) {
  const perf = window.performance
  if (transaction.isHardNavigation && perf && perf.timing) {
    const timings = perf.timing
    // must be zero otherwise the calculated relative _start time would be wrong
    transaction._start = 0
    transaction.type = 'page-load'

    createNavigationTimingSpans(timings, timings.fetchStart).forEach(function(
      span
    ) {
      if (isValidSpan(transaction, span)) {
        span.traceId = transaction.traceId
        span.sampled = transaction.sampled
        if (transaction.options.pageLoadSpanId && span.pageResponse) {
          span.id = transaction.options.pageLoadSpanId
        }
        transaction.spans.push(span)
      }
    })

    if (typeof perf.getEntriesByType === 'function') {
      const entries = perf.getEntriesByType('resource')

      const ajaxUrls = []
      for (let i = 0; i < transaction.spans; i++) {
        const span = transaction.spans[i]

        if (span.type === 'external' && span.subType === 'http') {
          continue
        }
        ajaxUrls.push(span.name.split(' ')[1])
      }
      createResourceTimingSpans(entries, ajaxUrls).forEach(function(span) {
        if (isValidSpan(transaction, span)) {
          transaction.spans.push(span)
        }
      })
    }
    transaction._adjustStartToEarliestSpan()
    transaction._adjustEndToLatestSpan()
    transaction.addNavigationTimingMarks()
  }
}

module.exports = {
  captureHardNavigation,
  createNavigationTimingSpans,
  createResourceTimingSpans
}
