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
import Transaction from '../../src/performance-monitoring/transaction'
import { PAGE_LOAD, TYPE_CUSTOM, LONG_TASK } from '../../src/common/constants'
import {
  onPerformanceEntry,
  PerfEntryRecorder
} from '../../src/performance-monitoring/perf-entry-recorder'
import { mockObserverEntryTypes } from '../utils/globals-mock'

describe('PerfEntryRecorder', () => {
  const mockEntryList = {
    getEntriesByType: mockObserverEntryTypes
  }

  const getLtSpans = tr => tr.spans.filter(span => span.type === LONG_TASK)

  it('should create long tasks spans for all transaction types', () => {
    const pageLoadTransaction = new Transaction('/', PAGE_LOAD)
    onPerformanceEntry(mockEntryList, pageLoadTransaction)

    expect(getLtSpans(pageLoadTransaction).length).toEqual(3)

    const customTransaction = new Transaction('/', TYPE_CUSTOM)
    onPerformanceEntry(mockEntryList, customTransaction)

    expect(getLtSpans(customTransaction).length).toEqual(3)
  })

  it('should create long tasks attribution data in span context', () => {
    const tr = new Transaction('/', PAGE_LOAD)
    onPerformanceEntry(mockEntryList, tr)
    const ltSpans = getLtSpans(tr)

    expect(ltSpans.length).toBe(3)
    expect(ltSpans).toEqual([
      jasmine.objectContaining({
        name: 'Longtask(self)',
        context: {
          custom: {
            attribution: 'unknown',
            type: 'window'
          }
        }
      }),
      jasmine.objectContaining({
        name: 'Longtask(same-origin-descendant)',
        context: {
          custom: {
            attribution: 'unknown',
            type: 'iframe',
            name: 'childA'
          }
        }
      }),
      jasmine.objectContaining({
        name: 'Longtask(same-origin-ancestor)',
        context: {
          custom: {
            attribution: 'unknown',
            type: 'window'
          }
        }
      })
    ])
  })

  it('should mark largest contentful paint only for page-load transaction', () => {
    const pageLoadTransaction = new Transaction('/', PAGE_LOAD)
    onPerformanceEntry(mockEntryList, pageLoadTransaction)

    expect(pageLoadTransaction.marks.agent.largestContentfulPaint).toEqual(
      1040.0399999925867
    )

    const customTransaction = new Transaction('/', TYPE_CUSTOM)
    onPerformanceEntry(mockEntryList, customTransaction)

    expect(customTransaction.marks).toBeUndefined()
  })

  it('should start recording based on managed vs custom transaction', () => {
    const recorder = new PerfEntryRecorder(() => {})
    const onStartSpy = jasmine.createSpy()
    const onStopSpy = jasmine.createSpy()
    recorder.po = {
      observe: onStartSpy,
      disconnect: onStopSpy
    }

    const pageLoadTransaction = new Transaction('/', PAGE_LOAD)
    pageLoadTransaction.captureTimings = true
    recorder.start(pageLoadTransaction)
    recorder.stop(pageLoadTransaction)

    expect(onStartSpy).toHaveBeenCalled()
    expect(onStopSpy).toHaveBeenCalled()

    onStartSpy.calls.reset()
    onStopSpy.calls.reset()
    const customTransaction = new Transaction('/', TYPE_CUSTOM)
    customTransaction.captureTimings = false
    recorder.start(customTransaction)
    recorder.stop(customTransaction)
    expect(onStartSpy).not.toHaveBeenCalled()
    expect(onStopSpy).not.toHaveBeenCalled()
  })
})
