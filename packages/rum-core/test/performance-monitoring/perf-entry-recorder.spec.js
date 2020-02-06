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
  PerfEntryRecorder
} from '../../src/performance-monitoring/perf-entry-recorder'
import { LARGEST_CONTENTFUL_PAINT, LONG_TASK } from '../../src/common/constants'
import { mockObserverEntryTypes } from '../utils/globals-mock'

describe('PerfEntryRecorder', () => {
  const mockEntryList = {
    getEntriesByType: mockObserverEntryTypes
  }

  it('should create long tasks spans', () => {
    const { spans } = captureObserverEntries(mockEntryList, {
      capturePaint: false
    })
    expect(spans.length).toEqual(3)
  })

  it('should return largest contentful paint if capturePaint is true', () => {
    const { marks: paintFalse } = captureObserverEntries(mockEntryList, {
      capturePaint: false
    })
    expect(paintFalse).toEqual({})

    const { marks: paintTrue } = captureObserverEntries(mockEntryList, {
      capturePaint: true
    })

    expect(paintTrue).toEqual({
      largestContentfulPaint: 1040.0399999925867
    })
  })

  it('should create long tasks attribution data in span context', () => {
    const { spans } = captureObserverEntries(mockEntryList, {
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
})
