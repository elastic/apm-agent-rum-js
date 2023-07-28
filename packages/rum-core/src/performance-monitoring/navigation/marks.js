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

import { isRedirectInfoAvailable } from '../../common/utils'

/**
 * Navigation timing marks are reported only for page-load transactions
 *
 * Do not change the order of both NAVIGATION_TIMING_MARKS and
 * COMPRESSED_NAV_TIMING_MARKS since compression of the fields are based on the
 * order they are placed in the array
 */
const NAVIGATION_TIMING_MARKS = [
  'fetchStart',
  'domainLookupStart',
  'domainLookupEnd',
  'connectStart',
  'connectEnd',
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

const COMPRESSED_NAV_TIMING_MARKS = [
  'fs',
  'ls',
  'le',
  'cs',
  'ce',
  'qs',
  'rs',
  're',
  'dl',
  'di',
  'ds',
  'de',
  'dc',
  'es',
  'ee'
]

function getPageLoadMarks(timing) {
  const marks = getNavigationTimingMarks(timing)
  if (marks == null) {
    return null
  }
  return {
    navigationTiming: marks,
    agent: {
      timeToFirstByte: marks.responseStart,
      domInteractive: marks.domInteractive,
      domComplete: marks.domComplete
    }
  }
}

function getNavigationTimingMarks(timing) {
  const {
    redirectStart,
    fetchStart,
    navigationStart,
    responseStart,
    responseEnd
  } = timing
  /**
   * Detect if NavigationTiming data is buggy and discard
   * capturing navigation marks for the transaction
   *
   * https://bugs.webkit.org/show_bug.cgi?id=168057
   * https://bugs.webkit.org/show_bug.cgi?id=186919
   */
  if (
    fetchStart >= navigationStart &&
    responseStart >= fetchStart &&
    responseEnd >= responseStart
  ) {
    const marks = {}
    NAVIGATION_TIMING_MARKS.forEach(function (timingKey) {
      const m = timing[timingKey]
      if (m && m >= fetchStart) {
        if (isRedirectInfoAvailable(timing)) {
          // make sure navigation marks will show up after the Redirect span
          marks[timingKey] = parseInt(m - redirectStart)
        } else {
          marks[timingKey] = parseInt(m - fetchStart)
        }
      }
    })
    return marks
  }
  return null
}

export {
  getPageLoadMarks,
  NAVIGATION_TIMING_MARKS,
  COMPRESSED_NAV_TIMING_MARKS
}
