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

class BreakdownTiming {
  constructor(type, duration, subType) {
    this.type = type
    this.subType = subType
    this.duration = duration
    this.count = 1
  }
}

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

/**
 * TODO: Add transaction breakdown for other types
 * `route-change` and `custom`
 */
export function captureBreakdown(type) {
  const breakdowns = []

  if (type === PAGE_LOAD) {
    const timings = window.performance.timing
    for (let i = 0; i < pageLoadBreakdowns.length; i++) {
      const current = pageLoadBreakdowns[i]
      const start = timings[current[0]]
      const end = timings[current[1]]
      const duration = getDuration(start, end)
      if (duration == null) {
        continue
      }
      const timing = new BreakdownTiming(current[2], duration)
      breakdowns.push(timing)
    }
  }
  return breakdowns
}
