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

import * as utils from '../../../../src/common/utils'
import {
  inpState,
  observeUserInteractions,
  processUserInteractions,
  interactionCount,
  restoreINPState,
  calculateInp
} from '../../../../src/performance-monitoring/metrics/inp/process'
import { PerfEntryRecorder } from '../../../../src/performance-monitoring/metrics/metrics'
import { spyOnFunction } from '../../../../../../dev-utils/jasmine'
import { EVENT } from '../../../../src/common/constants'

if (utils.isPerfTypeSupported(EVENT)) {
  describe('INP', () => {
    function setInteractionCount(count) {
      inpState.interactionCount = count
    }

    function inpCandidates() {
      return inpState.longestInteractions
    }

    let interactionCountSpy
    const list = {
      getEntries: jasmine.createSpy()
    }

    beforeEach(() => {
      interactionCountSpy = spyOnFunction(
        utils,
        'isPerfInteractionCountSupported'
      )
      restoreINPState()
    })

    describe('observeUserInteractions', () => {
      describe('when performance.interactionCount is available', () => {
        beforeEach(() => {
          interactionCountSpy.and.returnValue(true)
        })

        it('should observe events with durationThreshold 40', () => {
          const recorder = new PerfEntryRecorder(utils.noop)
          spyOn(recorder, 'start')

          observeUserInteractions(recorder)

          expect(recorder.start).toHaveBeenCalledTimes(1)
          expect(recorder.start).toHaveBeenCalledWith('event', {
            buffered: true,
            durationThreshold: 40
          })
        })

        it('should not observe first-input event', () => {
          const recorder = new PerfEntryRecorder(utils.noop)
          spyOn(recorder, 'start')

          observeUserInteractions(recorder)

          expect(recorder.start).toHaveBeenCalledTimes(1)
          expect(recorder.start).not.toHaveBeenCalledWith('first-input', {})
        })
      })

      describe('when performance.interactionCount is NOT available', () => {
        beforeEach(() => {
          interactionCountSpy.and.returnValue(false)
        })

        it('should observe events with durationThreshold 16', () => {
          const recorder = new PerfEntryRecorder(utils.noop)
          spyOn(recorder, 'start')

          observeUserInteractions(recorder)

          expect(recorder.start).toHaveBeenCalledTimes(2)
          expect(recorder.start).toHaveBeenCalledWith('event', {
            buffered: true,
            durationThreshold: 16
          })
        })

        it('should observe first-input event', () => {
          const recorder = new PerfEntryRecorder(utils.noop)
          spyOn(recorder, 'start')

          observeUserInteractions(recorder)

          expect(recorder.start).toHaveBeenCalledTimes(2)
          expect(recorder.start).toHaveBeenCalledWith('first-input')
        })
      })
    })

    describe('processUserInteractions', () => {
      it('should not consider entries with interactionId set to 0', () => {
        list.getEntries.and.callFake(() => {
          return [{ interactionId: 0 }, { interactionId: 4007 }]
        })

        processUserInteractions(list)

        expect(interactionCount()).toBe(1)
      })

      it('should not consider INP candidate interactions with a duration of less than 40ms', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3007, duration: 39 },
            { interactionId: 3014, duration: 40 },
            { interactionId: 3021, duration: 41 }
          ]
        })

        processUserInteractions(list)

        const candidates = inpCandidates()
        expect(candidates.length).toBe(2)
      })

      it('should store INP candidates sorted descendingly by duration', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3007, duration: 40 },
            { interactionId: 3014, duration: 75 },
            { interactionId: 3021, duration: 100 }
          ]
        })

        processUserInteractions(list)

        const [first, second, third] = inpCandidates()
        expect(first.duration).toBe(100)
        expect(second.duration).toBe(75)
        expect(third.duration).toBe(40)
      })

      it('should only consider the 10 slowest interactions as INP candidates', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3007, duration: 40 },
            { interactionId: 3014, duration: 45 },
            { interactionId: 3021, duration: 50 },
            { interactionId: 3028, duration: 55 },
            { interactionId: 3035, duration: 60 },
            { interactionId: 3042, duration: 65 },
            { interactionId: 3049, duration: 70 },
            { interactionId: 3056, duration: 75 },
            { interactionId: 3063, duration: 80 },
            { interactionId: 3070, duration: 85 },
            { interactionId: 3077, duration: 90 }
          ]
        })

        processUserInteractions(list)

        const candidates = inpCandidates()
        const slowestOne = candidates[0]
        const leastSlowOne = candidates[candidates.length - 1]
        expect(candidates.length).toBe(10)
        expect(slowestOne.duration).toBe(90)
        expect(leastSlowOne.duration).toBe(45)
      })

      it('should pick the slowest interaction from those entries with the same interactionId', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3007, duration: 75 },
            { interactionId: 3007, duration: 60 }
          ]
        })

        processUserInteractions(list)

        const candidates = inpCandidates()
        expect(candidates.length).toBe(1)
        expect(candidates[0].duration).toBe(75)
      })

      it('should not store duplicated values', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3007, duration: 100 },
            { interactionId: 3014, duration: 100 }
          ]
        })

        processUserInteractions(list)

        const candidates = inpCandidates()
        expect(candidates.length).toBe(1)
      })

      it('should not store interactions that are faster than the current INP candidates', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3007, duration: 150 },
            { interactionId: 3014, duration: 250 }
          ]
        })

        processUserInteractions(list)
        let candidates = inpCandidates()
        expect(candidates.length).toBe(2)

        // Report a faster interaction
        list.getEntries.and.callFake(() => {
          return [{ interactionId: 3021, duration: 135 }]
        })
        processUserInteractions(list)

        // The number of inp candidates should still be the same
        candidates = inpCandidates()
        expect(candidates.length).toBe(2)
      })

      describe('when performance.interactionCount is NOT available', () => {
        it('should estimate interactionCount from the entries reported by PerformanceObserver', () => {
          interactionCountSpy.and.returnValue(false)

          // As already documented in the code, the way (Google approach) to estimate the number is interactions
          // is to make sure we increase the id by 7
          // so in thi case we should expect 2
          list.getEntries.and.callFake(() => {
            return [
              { interactionId: 3007, duration: 30 },
              { interactionId: 3014, duration: 35 }
            ]
          })

          processUserInteractions(list)

          expect(interactionCount()).toBe(2)
        })
      })

      describe('when performance.interactionCount is available', () => {
        let originalInteractionCount
        beforeEach(() => {
          originalInteractionCount = performance.interactionCount
        })

        afterEach(() => {
          Object.defineProperty(performance, 'interactionCount', {
            value: originalInteractionCount
          })
        })

        it('should determine interactionCount through performance.interactionCount', () => {
          interactionCountSpy.and.returnValue(true)

          list.getEntries.and.callFake(() => {
            return [
              { interactionId: 3007, duration: 30 },
              { interactionId: 3008, duration: 35 }
            ]
          })

          processUserInteractions(list)

          // the entries reported by PerformanceObserver should not be in charge of calculating the count anymore
          expect(interactionCount()).toBe(0)

          Object.defineProperty(performance, 'interactionCount', {
            value: 5
          })

          // now, we should get the value from the browser api
          expect(interactionCount()).toBe(5)
        })
      })
    })

    describe('calculateInp', () => {
      it('should choose the slowest interaction for INP if there are less than 50', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3014, duration: 550 },
            { interactionId: 3021, duration: 600 }
          ]
        })

        processUserInteractions(list)

        setInteractionCount(49)
        const inpMetric = calculateInp()

        expect(inpMetric).toBe(600)
      })

      it('should calculate the percentile 98 for INP if there are 50 or more interactions', () => {
        list.getEntries.and.callFake(() => {
          return [
            { interactionId: 3014, duration: 500 },
            { interactionId: 3021, duration: 550 },
            { interactionId: 3028, duration: 600 }
          ]
        })

        processUserInteractions(list)

        setInteractionCount(50)
        let inpMetric = calculateInp()
        expect(inpMetric).toBe(550)

        // P98 calculation will be different the more interactions there are
        setInteractionCount(100)
        inpMetric = calculateInp()
        expect(inpMetric).toBe(500)
      })

      it('should not calculate INP if there is no activity at all', () => {
        list.getEntries.and.callFake(() => {
          return []
        })

        processUserInteractions(list)

        let inpMetric = calculateInp()
        expect(inpMetric).toBeUndefined()
      })

      it('should generate 0 for INP if the only processed interaction duration is less than 40ms', () => {
        list.getEntries.and.callFake(() => {
          return [{ interactionId: 3014, duration: 39 }]
        })

        processUserInteractions(list)

        // The interaction above is not considered for INP
        expect(inpCandidates().length).toBe(0)

        // But we should increase the interaction counter
        expect(interactionCount()).toBe(1)

        // Then, the INP calculated is 0
        let inpMetric = calculateInp()
        expect(inpMetric).toBe(0)
      })
    })
  })
}
