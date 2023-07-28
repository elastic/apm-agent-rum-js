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

import { shouldCreateSpan } from './utils'
import Span from '../span'

/**
 * Navigation Timing Spans
 *
 * eventPairs[0] -> start time of span
 * eventPairs[1] -> end time of span
 * eventPairs[2] -> name of the span
 */
const eventPairs = [
  ['redirectStart', 'redirectEnd', 'Redirect'],
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

function createNavigationTimingSpans(timings, baseTime, trStart, trEnd) {
  const spans = []
  for (let i = 0; i < eventPairs.length; i++) {
    const start = timings[eventPairs[i][0]]
    const end = timings[eventPairs[i][1]]

    if (!shouldCreateSpan(start, end, trStart, trEnd, baseTime)) {
      continue
    }
    const span = new Span(eventPairs[i][2], 'hard-navigation.browser-timing')
    let data = null
    /**
     * - pageResponse flag is used to set the id of the span to
     *  `pageLoadSpanId` if set in config to make the distributed tracing work
     *   when HTML is genrated dynamically from backend agents
     *
     * - Populate the context.destination fields only for the Request Span
     */
    if (eventPairs[i][0] === 'requestStart') {
      span.pageResponse = true
      data = { url: location.origin }
    }
    span._start = start - baseTime
    span.end(end - baseTime, data)
    spans.push(span)
  }
  return spans
}

export { createNavigationTimingSpans }
