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
  calculateTotalBlockingTime,
  createFirstInputDelaySpan,
  createTotalBlockingTimeSpan,
  PerfEntryRecorder,
  metrics,
  calculateCumulativeLayoutShift,
  createLongTaskSpans
} from '../../../src/performance-monitoring/metrics/metrics'
import {
  LARGEST_CONTENTFUL_PAINT,
  LONG_TASK
} from '../../../src/common/constants'
import { isPerfTypeSupported } from '../../../src/common/utils'
import {
  mockObserverEntryTypes,
  mockObserverEntryNames,
  mockPerformanceTimingEntries
} from '../../utils/globals-mock'
import longtaskEntries from '../../fixtures/longtask-entries'
import fidEntries from '../../fixtures/fid-entries'
import { fcpEntries } from '../../fixtures/paint-entries'
import { canMockPerfTimingApi } from '../..'

describe('Metrics', () => {
  describe('PerfEntryRecorder', () => {
    const list = {
      getEntriesByType: jasmine.createSpy(),
      getEntriesByName: jasmine.createSpy()
    }

    beforeEach(() => {
      list.getEntriesByType.and.returnValue([])
      list.getEntriesByName.and.returnValue([])
      metrics.tbt = { start: Infinity, duration: 0 }
      metrics.cls = {
        score: 0,
        firstEntryTime: Number.NEGATIVE_INFINITY,
        prevEntryTime: Number.NEGATIVE_INFINITY,
        currentSessionScore: 0
      }
      metrics.fid = 0
      metrics.longtask = {
        count: 0,
        duration: 0,
        max: 0
      }
    })

    it('should not create long tasks spans if entries are not present', () => {
      const { spans } = captureObserverEntries(list, {
        isHardNavigation: false
      })
      expect(spans).toEqual([])
    })

    it('should not mark LCP & FCP if entries are not preset ', () => {
      const { marks } = captureObserverEntries(list, {
        isHardNavigation: true
      })
      expect(marks).toEqual({})
    })

    it('should return largest contentful paint if isHardNavigation is true', () => {
      list.getEntriesByType.and.callFake(mockObserverEntryTypes)
      const { marks: notHardNavigation } = captureObserverEntries(list, {
        isHardNavigation: false
      })
      expect(notHardNavigation).toEqual({})

      const { marks: hardNavigation } = captureObserverEntries(list, {
        isHardNavigation: true
      })

      expect(hardNavigation).toEqual({
        largestContentfulPaint: 1040
      })
    })

    describe('firstContentfulPaint', () => {
      it('should set FCP if isHardNavigation is true ', () => {
        list.getEntriesByName.and.callFake(mockObserverEntryNames)
        const { marks: notHardNavigation } = captureObserverEntries(list, {
          isHardNavigation: false
        })
        expect(notHardNavigation).toEqual({})

        const { marks: hardNavigation } = captureObserverEntries(list, {
          isHardNavigation: true
        })
        expect(hardNavigation).toEqual({
          firstContentfulPaint: jasmine.any(Number)
        })
      })

      if (canMockPerfTimingApi()) {
        ;[
          {
            name:
              'should subtract the unload event duration from FCP when there is no redirection',
            navigationEntries: {
              navigationStart: 0,
              fetchStart: 30
            },
            originalFcp: 200,
            expectedFcp: 170
          },
          {
            name: 'should keep the FCP as it is when there is a redirection',
            navigationEntries: {
              navigationStart: 0,
              redirectStart: 20,
              fetchStart: 30
            },
            originalFcp: 200,
            expectedFcp: 200
          }
        ].forEach(({ name, navigationEntries, originalFcp, expectedFcp }) => {
          it(name, () => {
            const originalFcpEntry = fcpEntries[0]
            // fcp startTime
            fcpEntries[0].startTime = originalFcp

            // unload event duration (timing.fetchStart - timing.navigationStart)
            const unMock = mockPerformanceTimingEntries(navigationEntries)

            list.getEntriesByName.and.callFake(mockObserverEntryNames)
            const { marks } = captureObserverEntries(list, {
              isHardNavigation: true
            })
            expect(marks).toEqual({
              firstContentfulPaint: expectedFcp
            })

            fcpEntries[0] = originalFcpEntry
            unMock()
          })
        })
      }
    })

    it('should create long tasks attribution data in span context', () => {
      list.getEntriesByType.and.callFake(mockObserverEntryTypes)
      const { spans } = captureObserverEntries(list, {
        isHardNavigation: false,
        trStart: 0
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

    it('should consider transaction startTime while creating longtask spans', () => {
      list.getEntriesByType.and.callFake(mockObserverEntryTypes)
      const { spans } = captureObserverEntries(list, {
        isHardNavigation: false,
        trStart: 1200
      })
      expect(spans.length).toBe(1)
      expect(spans).toEqual([
        jasmine.objectContaining({
          name: 'Longtask(same-origin-ancestor)',
          _start: 1923.40999995591,
          context: {
            custom: {
              attribution: 'unknown',
              type: 'window'
            }
          }
        })
      ])
    })

    it('should start recorder only when the type is supported', () => {
      const recorder = new PerfEntryRecorder(() => {})
      const onStartSpy = jasmine.createSpy()
      recorder.po = {
        observe: onStartSpy
      }
      recorder.start(LONG_TASK)
      if (isPerfTypeSupported(LONG_TASK)) {
        expect(onStartSpy).toHaveBeenCalledWith({
          type: LONG_TASK,
          buffered: true
        })
      } else {
        expect(onStartSpy).not.toHaveBeenCalled()
      }
      onStartSpy.calls.reset()

      recorder.start(LARGEST_CONTENTFUL_PAINT)
      if (isPerfTypeSupported(LARGEST_CONTENTFUL_PAINT)) {
        expect(onStartSpy).toHaveBeenCalledWith({
          type: LARGEST_CONTENTFUL_PAINT,
          buffered: true
        })
      } else {
        expect(onStartSpy).not.toHaveBeenCalled()
      }
    })

    describe('Total Blocking Time', () => {
      it('should create total blocking time as span', () => {
        calculateTotalBlockingTime(longtaskEntries)
        const tbtSpan = createTotalBlockingTimeSpan(metrics.tbt)
        expect(tbtSpan).toEqual(
          jasmine.objectContaining({
            name: 'Total Blocking Time',
            type: LONG_TASK,
            _start: 745.4100000031758,
            _end: 995.3399999591056
          })
        )
      })

      it('should calculate total blocking time from long tasks', () => {
        calculateTotalBlockingTime(longtaskEntries)
        expect(metrics.tbt).toEqual({
          start: 745.4100000031758,
          duration: 249.92999995592982
        })
      })

      it('should update tbt when longtasks are dispatched at different times', () => {
        list.getEntriesByType.and.callFake(mockObserverEntryTypes)
        captureObserverEntries(list, {
          isHardNavigation: true,
          trStart: 0
        })
        expect(metrics.tbt).toEqual({
          start: 745.4100000031758,
          duration: 249.92999995592982
        })

        // simulating second longtask entry list
        captureObserverEntries(list, {
          isHardNavigation: true,
          trStart: 0
        })
        expect(metrics.tbt).toEqual({
          start: 745.4100000031758,
          duration: 499.85999991185963
        })
      })

      it('should consider transaction startTime while updating TBT', () => {
        list.getEntriesByType.and.callFake(mockObserverEntryTypes)
        captureObserverEntries(list, {
          isHardNavigation: true,
          trStart: 800
        })
        expect(metrics.tbt).toEqual({
          start: 1023.40999995591,
          duration: 245.35999997751787
        })
      })

      it('should calculate total blocking time based on FCP', () => {
        metrics.fcp = 1000
        calculateTotalBlockingTime(longtaskEntries)
        expect(metrics.tbt).toEqual({
          start: 1023.40999995591,
          duration: 245.35999997751787
        })
      })

      it('should return tbt as 0 when entries are not self/same-origin', () => {
        calculateTotalBlockingTime([
          {
            name: 'unknown',
            startTime: 10
          },
          {
            name: 'cross-origin',
            startTime: 20
          }
        ])
        expect(metrics.tbt).toEqual({
          start: Infinity,
          duration: 0
        })
      })
    })

    describe('First Input Delay', () => {
      it('should capture fid experience metric on input entries', () => {
        list.getEntriesByType.and.callFake(mockObserverEntryTypes)
        captureObserverEntries(list, {
          isHardNavigation: true
        })
        expect(metrics.fid).toBe(6)
      })

      it('should create first input delay span', () => {
        let span = createFirstInputDelaySpan(fidEntries)
        expect(span).toEqual(
          jasmine.objectContaining({
            name: 'First Input Delay',
            type: 'first-input',
            ended: true,
            _end: 5489.029999997001,
            _start: 5482.669999997597
          })
        )
      })
    })

    describe('Cumulative Layout Shift', () => {
      it('should calculate cls of one session window', () => {
        calculateCumulativeLayoutShift([
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 1500.589999982156,
            value: 0.01
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 2300.589999982156,
            value: 0.03
          }
        ])

        expect(metrics.cls.score.toFixed(3)).toEqual('0.040')
      })

      it('should calculate cls considering the extra session window created because of the one second gap between events', () => {
        calculateCumulativeLayoutShift([
          // First session start here
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 1000.589999982156,
            value: 0.04
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 1500.589999982156,
            value: 0.01
          },
          // Second session starts here given there is a gap of more than 1 second between layout shift events
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 3005.589999982156,
            value: 0.01
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 3900.589999982156,
            value: 0.02
          }
        ])

        expect(metrics.cls.score.toFixed(3)).toEqual('0.050')
      })

      it('should calculate cls considering the extra session window created since the first one lasted more than 5 seconds', () => {
        calculateCumulativeLayoutShift([
          // First session start here
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 800.589999982156,
            value: 0.04
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 1750.589999982156,
            value: 0.01
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 2600.589999982156,
            value: 0.04
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 3550.589999982156,
            value: 0.02
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 4500.589999982156,
            value: 0.02
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 5300.589999982156,
            value: 0.01
          },
          // Second session starts because more than 5 seconds have passed since the beginning of the first session
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 5900.589999982156,
            value: 0.34
          }
        ])

        expect(metrics.cls.score.toFixed(3)).toEqual('0.340')
      })

      it('should calculate cls without considering layout shift events with recent user input', () => {
        calculateCumulativeLayoutShift([
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: true,
            lastInputTime: 0,
            name: '',
            startTime: 1500.589999982156,
            value: 0.12
          },
          {
            duration: 0,
            entryType: 'layout-shift',
            hadRecentInput: false,
            lastInputTime: 0,
            name: '',
            startTime: 2300.589999982156,
            value: 0.14
          }
        ])

        expect(metrics.cls.score.toFixed(3)).toEqual('0.140')
      })
    })

    it('should aggregate longtasks in metrics', () => {
      const agg = { count: 0, duration: 0, max: 0 }
      createLongTaskSpans(longtaskEntries, agg)
      expect(agg).toEqual({
        count: 3,
        duration: 399.9299999559298,
        max: 187.19000002602115
      })
    })
  })
})
