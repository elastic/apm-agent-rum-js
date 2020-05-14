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
  captureObserverEntries,
  PerfEntryRecorder,
  calculateTotalBlockingTime
} from '../../src/performance-monitoring/perf-entry-recorder'
import { LARGEST_CONTENTFUL_PAINT, LONG_TASK } from '../../src/common/constants'
import { metrics } from '../../src/common/metrics'
import {
  mockObserverEntryTypes,
  mockObserverEntryNames
} from '../utils/globals-mock'
import longtaskEntries from '../fixtures/longtask-entries'

describe('PerfEntryRecorder', () => {
  const list = {
    getEntriesByType: jasmine.createSpy(),
    getEntriesByName: jasmine.createSpy()
  }

  beforeEach(() => {
    list.getEntriesByType.and.returnValue([])
    list.getEntriesByName.and.returnValue([])
  })

  it('should not create long tasks spans if entries are not present', () => {
    const { spans } = captureObserverEntries(list, {
      capturePaint: false
    })
    expect(spans).toEqual([])
  })

  it('should not mark LCP & FCP if entries are not preset ', () => {
    const { marks } = captureObserverEntries(list, {
      capturePaint: true
    })
    expect(marks).toEqual({})
  })

  it('should return largest contentful paint if capturePaint is true', () => {
    list.getEntriesByType.and.callFake(mockObserverEntryTypes)
    const { marks: paintFalse } = captureObserverEntries(list, {
      capturePaint: false
    })
    expect(paintFalse).toEqual({})

    const { marks: paintTrue } = captureObserverEntries(list, {
      capturePaint: true
    })

    expect(paintTrue).toEqual({
      largestContentfulPaint: 1040
    })
  })

  it('should set firstContentfulPaint if capturePaint is true ', () => {
    list.getEntriesByName.and.callFake(mockObserverEntryNames)
    const { marks: paintFalse } = captureObserverEntries(list, {
      capturePaint: false
    })
    expect(paintFalse).toEqual({})

    const { marks: paintTrue } = captureObserverEntries(list, {
      capturePaint: true
    })
    expect(paintTrue).toEqual({
      firstContentfulPaint: jasmine.any(Number)
    })
  })

  it('should create long tasks attribution data in span context', () => {
    list.getEntriesByType.and.callFake(mockObserverEntryTypes)
    const { spans } = captureObserverEntries(list, {
      capturePaint: false
    })
    expect(spans.length).toBe(3)
    expect(spans).toEqual([
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

  it('should pass buffered flag based on observed type', () => {
    const recorder = new PerfEntryRecorder(() => {})
    const onStartSpy = jasmine.createSpy()
    recorder.po = {
      observe: onStartSpy
    }
    recorder.start(LONG_TASK)

    expect(onStartSpy).toHaveBeenCalledWith({
      type: LONG_TASK,
      buffered: false
    })
    onStartSpy.calls.reset()

    recorder.start(LARGEST_CONTENTFUL_PAINT)
    expect(onStartSpy).toHaveBeenCalledWith({
      type: LARGEST_CONTENTFUL_PAINT,
      buffered: true
    })
  })

  describe('Total Blocking Time', () => {
    it('should create total blocking time as span', () => {
      list.getEntriesByType.and.callFake(mockObserverEntryTypes)
      const { spans } = captureObserverEntries(list, {
        capturePaint: true
      })
      const tbtSpans = spans.filter(span => span.name === 'Total Blocking Time')
      expect(tbtSpans[0]).toEqual(
        jasmine.objectContaining({
          name: 'Total Blocking Time',
          type: LONG_TASK
        })
      )
    })

    it('should calculate total blocking time from long tasks', () => {
      const tbt = calculateTotalBlockingTime(longtaskEntries)
      expect(tbt).toEqual({
        start: 745.4100000031758,
        duration: 249.92999995592982
      })
    })

    it('should calculate total blocking time based on FCP', () => {
      metrics.fcp = 1000
      const tbt = calculateTotalBlockingTime(longtaskEntries)
      expect(tbt).toEqual({
        start: 1023.40999995591,
        duration: 245.35999997751787
      })
    })

    it('should return tbt as 0 when entries are not self/same-origin', () => {
      const tbt = calculateTotalBlockingTime([
        {
          name: 'unknown',
          startTime: 10
        },
        {
          name: 'cross-origin',
          startTime: 20
        }
      ])
      expect(tbt).toEqual({
        start: Infinity,
        duration: 0
      })
    })
  })
})
