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

import { LONG_TASK, LARGEST_CONTENTFUL_PAINT } from '../common/constants'
import { noop } from '../common/utils'
import Span from './span'

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

export function onPerformanceEntry(entryList, transactionService) {
  const longtaskEntries = entryList.getEntriesByType(LONG_TASK)
  const lcpEntries = entryList.getEntriesByType(LARGEST_CONTENTFUL_PAINT)

  const lastLcpEntry = lcpEntries[lcpEntries.length - 1]
  const tr = transactionService.getCurrentTransaction()

  if (!tr) {
    return
  }

  if (lastLcpEntry) {
    tr.addMarks({
      agent: {
        largestContentfulPaint: lastLcpEntry.renderTime || lastLcpEntry.loadTime
      }
    })
  }

  const longTaskSpans = createLongTaskSpans(longtaskEntries)
  tr.spans.push(...longTaskSpans)
}

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

  start(entryTypes) {
    /**
     * Safari throws an error when PerformanceObserver is
     * observed for unknown entry typess
     */
    try {
      this.po.observe({ entryTypes })
    } catch (_) {}
  }

  stop() {
    this.po.disconnect()
  }
}
