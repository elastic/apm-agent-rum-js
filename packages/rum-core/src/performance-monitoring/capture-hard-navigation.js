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
const Url = require('../common/url')

const eventPairs = [
  ['domainLookupStart', 'domainLookupEnd', 'Domain lookup'],
  ['connectStart', 'connectEnd', 'Making a connection to the server'],
  ['requestStart', 'responseEnd', 'Requesting and receiving the document'],
  ['domLoading', 'domInteractive', 'Parsing the document, executing sync. scripts'],
  ['domContentLoadedEventStart', 'domContentLoadedEventEnd', 'Fire "DOMContentLoaded" event'],
  ['loadEventStart', 'loadEventEnd', 'Fire "load" event']
]
const spanThreshold = 5 * 60 * 1000

function isValidSpan (transaction, span) {
  var d = span.duration()
  return (
    d < spanThreshold && d > 0 && span._start <= transaction._end && span._end <= transaction._end
  )
}

function createNavigationTimingSpans (timings, baseTime) {
  var spans = []
  for (var i = 0; i < eventPairs.length; i++) {
    var start = timings[eventPairs[i][0]]
    var end = timings[eventPairs[i][1]]
    if (
      baseTime &&
      start &&
      end &&
      end > start &&
      start >= baseTime &&
      end - start < spanThreshold &&
      start - baseTime < spanThreshold &&
      end - baseTime < spanThreshold
    ) {
      var span = new Span(eventPairs[i][2], 'hard-navigation.browser-timing')
      if (eventPairs[i][0] === 'requestStart') {
        span.pageResponse = true
      }
      span._start = start - baseTime
      span.ended = true
      span._end = end - baseTime
      spans.push(span)
    }
  }
  return spans
}

function createResourceTimingSpans (entries, filterUrls) {
  var spans = []
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i]
    var { initiatorType, name, startTime, responseEnd } = entry
    /**
     * Skipping the timing information of API calls because of auto patching XHR and Fetch
     */
    if (initiatorType === 'xmlhttprequest' || initiatorType === 'fetch' || !entry.name) {
      continue
    } else if (
      initiatorType !== 'css' &&
      initiatorType !== 'img' &&
      initiatorType !== 'script' &&
      initiatorType !== 'link'
    ) {
      // is ajax request? test for css/img before the expensive operation
      var foundAjaxReq = false
      for (var j = 0; j < filterUrls.length; j++) {
        var idx = name.lastIndexOf(filterUrls[j])
        if (idx > -1 && idx === name.length - filterUrls[j].length) {
          foundAjaxReq = true
          break
        }
      }
      if (foundAjaxReq) {
        continue
      }
    } else {
      var kind = 'resource'
      if (initiatorType) {
        kind += '.' + initiatorType
      }
      var start = startTime
      var end = responseEnd
      if (
        typeof start === 'number' &&
        typeof end === 'number' &&
        start >= 0 &&
        end > start &&
        end - start < spanThreshold &&
        start < spanThreshold &&
        end < spanThreshold
      ) {
        var parsedUrl = new Url(name)
        var spanName = parsedUrl.origin + parsedUrl.path
        var span = new Span(spanName || name, kind)
        span.addContext({
          http: {
            url: name
          }
        })
        span._start = start
        span.ended = true
        span._end = end
        spans.push(span)
      }
    }
  }
  return spans
}

function captureHardNavigation (transaction) {
  if (transaction.isHardNavigation && window.performance && window.performance.timing) {
    var timings = window.performance.timing
    var baseTime = timings.fetchStart
    // must be zero otherwise the calculated relative _start time would be wrong
    transaction._start = 0
    transaction.type = 'page-load'

    createNavigationTimingSpans(timings, baseTime).forEach(function (span) {
      if (isValidSpan(transaction, span)) {
        span.traceId = transaction.traceId
        span.sampled = transaction.sampled
        if (transaction.options.pageLoadSpanId && span.pageResponse) {
          span.id = transaction.options.pageLoadSpanId
        }
        transaction.spans.push(span)
      }
    })

    if (window.performance.getEntriesByType) {
      var entries = window.performance.getEntriesByType('resource')

      var ajaxUrls = transaction.spans
        .filter(function (span) {
          return span.type === 'external' && span.subType === 'http'
        })
        .map(function (span) {
          return span.name.split(' ')[1]
        })

      createResourceTimingSpans(entries, ajaxUrls).forEach(function (span) {
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
