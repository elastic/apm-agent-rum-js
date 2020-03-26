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
  createNavigationTimingSpans,
  createResourceTimingSpans,
  createUserTimingSpans,
  captureNavigation
} from '../../src/performance-monitoring/capture-navigation'
import Transaction from '../../src/performance-monitoring/transaction'
import resourceEntries from '../fixtures/resource-entries'
import userTimingEntries from '../fixtures/user-timing-entries'
import navTimingSpans from '../fixtures/navigation-timing-span-snapshot'
import { TIMING_LEVEL1_ENTRY as timings } from '../fixtures/navigation-entries'
import {
  mockGetEntriesByType,
  mockPaintEntryWithMissingFCP
} from '../utils/globals-mock'
import { PAGE_LOAD, ROUTE_CHANGE } from '../../src/common/constants'

const spanSnapshot = navTimingSpans.map(mapSpan)

function mapSpan(s) {
  return { name: s.name, _end: s._end, _start: s._start }
}

describe('Capture hard navigation', function() {
  /**
   * Arbitrary value considering the transcation end would be called
   * after load event has finished
   */
  const transactionEnd = timings.loadEventEnd + 100
  const transactionStart = 0
  it('should createNavigationTimingSpans', function() {
    let spans = createNavigationTimingSpans(
      timings,
      timings.fetchStart,
      transactionStart,
      transactionEnd
    )

    expect(spans.map(mapSpan)).toEqual([
      { name: 'Domain lookup', _end: 20, _start: 1 },
      { name: 'Making a connection to the server', _end: 88, _start: 20 },
      { name: 'Requesting and receiving the document', _end: 209, _start: 89 },
      {
        name: 'Parsing the document, executing sync. scripts',
        _end: 542,
        _start: 165
      },
      { name: 'Fire "DOMContentLoaded" event', _end: 654, _start: 634 },
      { name: 'Fire "load" event', _end: 964, _start: 962 }
    ])

    const fetchStartValues = [undefined, null, Number(new Date()), 0, 1]
    for (let i = 0; i < fetchStartValues.length; i++) {
      const value = fetchStartValues[i]
      const timingObj = { ...timings, fetchStart: value }
      const spans = createNavigationTimingSpans(
        timingObj,
        timingObj.fetchStart,
        transactionStart,
        transactionEnd
      )
      expect(spans).toEqual([])
    }

    const requestStartValues = [undefined, null, 0, 1, Number(new Date())]
    for (let i = 0; i < requestStartValues.length; i++) {
      const value = requestStartValues[i]
      const timingObj = { ...timings, requestStart: value }
      const spans = createNavigationTimingSpans(
        timingObj,
        timingObj.fetchStart,
        transactionStart,
        transactionEnd
      )
      expect(spans.map(mapSpan)).toEqual([
        { name: 'Domain lookup', _end: 20, _start: 1 },
        { name: 'Making a connection to the server', _end: 88, _start: 20 },
        {
          name: 'Parsing the document, executing sync. scripts',
          _end: 542,
          _start: 165
        },
        { name: 'Fire "DOMContentLoaded" event', _end: 654, _start: 634 },
        { name: 'Fire "load" event', _end: 964, _start: 962 }
      ])
    }

    const domInteractiveValues = [undefined, null, 0, 1, Number(new Date())]
    for (let i = 0; i < domInteractiveValues.length; i++) {
      const value = domInteractiveValues[i]
      const timingObj = {
        ...timings,
        domInteractive: value,
        requestStart: Number(new Date())
      }
      const spans = createNavigationTimingSpans(
        timingObj,
        timingObj.fetchStart,
        transactionStart,
        transactionEnd
      )
      expect(spans.map(mapSpan)).toEqual([
        { name: 'Domain lookup', _end: 20, _start: 1 },
        { name: 'Making a connection to the server', _end: 88, _start: 20 },
        { name: 'Fire "DOMContentLoaded" event', _end: 654, _start: 634 },
        { name: 'Fire "load" event', _end: 964, _start: 962 }
      ])
    }

    const timingObj = {
      ...timings,
      domInteractive: 0,
      requestStart: 0,
      domContentLoadedEventStart: 'a',
      domContentLoadedEventEnd: 'testing'
    }
    spans = createNavigationTimingSpans(
      timingObj,
      timingObj.fetchStart,
      transactionStart,
      transactionEnd
    )
    expect(spans.map(mapSpan)).toEqual([
      { name: 'Domain lookup', _end: 20, _start: 1 },
      { name: 'Making a connection to the server', _end: 88, _start: 20 },
      { name: 'Fire "load" event', _end: 964, _start: 962 }
    ])
  })

  it('should createResourceTimingSpans', function() {
    const spans = createResourceTimingSpans(
      resourceEntries,
      ['http://ajax-filter.test'],
      transactionStart,
      transactionEnd
    )
    const lastSpanContext = spans[spans.length - 1].context
    expect(lastSpanContext).toEqual(
      jasmine.objectContaining({
        http: {
          url: jasmine.any(String),
          response: {
            transfer_size: 420580,
            encoded_body_size: 420379,
            decoded_body_size: 420379
          }
        }
      })
    )

    expect(spans.map(mapSpan)).toEqual(spanSnapshot)
  })

  it('should createUserTimingSpans', function() {
    const spans = createUserTimingSpans(
      userTimingEntries,
      transactionStart,
      transactionEnd
    )
    expect(spans.length).toEqual(3)
    expect(spans).toEqual([
      jasmine.objectContaining({
        name: 'measure_1',
        type: 'app',
        _start: 0,
        _end: 1052.5299999972049,
        ended: true
      }),
      jasmine.objectContaining({
        name: 'measure_2',
        type: 'app',
        _start: 0,
        _end: 2119.7900000006484,
        ended: true
      }),
      jasmine.objectContaining({
        name: 'measure_5',
        type: 'app',
        _start: 0,
        _end: 100.7900000006484,
        ended: true
      })
    ])
  })

  it('should capture spans for hard navigation', function() {
    const tr = new Transaction('test', PAGE_LOAD)
    tr.captureTimings = true
    tr.end()
    captureNavigation(tr)
    expect(tr.spans.length).toBeGreaterThan(1)
  })

  it('should capture resource/user timing spans for soft navigation', function() {
    const unmock = mockGetEntriesByType()
    const tr = new Transaction('test', ROUTE_CHANGE)
    tr.captureTimings = true
    const xhrSpan = tr.startSpan('GET http://example.com', 'external.http')
    xhrSpan.end()
    tr._start = transactionStart
    tr.end()
    captureNavigation(tr)
    expect(tr.spans.length).toBeGreaterThan(1)
    const foundSpans = tr.spans.filter(
      span =>
        span.name === xhrSpan.name ||
        span.type === 'resource' ||
        span.type === 'app'
    )
    expect(foundSpans.length).toBeGreaterThanOrEqual(3)
    unmock()
  })

  it('should capture resource/user timings when captureTimings flag is set', function() {
    const unmock = mockGetEntriesByType()
    const tr = new Transaction('test', 'test')
    tr.captureTimings = true
    tr._start = transactionStart
    tr.end()
    captureNavigation(tr)
    expect(tr.spans.length).toBeGreaterThan(1)
    const foundSpans = tr.spans.filter(
      span => span.type === 'resource' || span.type === 'app'
    )
    expect(foundSpans.length).toBeGreaterThanOrEqual(2)
    unmock()
  })

  it('should capture agent marks in page load transaction', function() {
    const unMock = mockGetEntriesByType()
    const tr = new Transaction('test', PAGE_LOAD)
    tr.captureTimings = true
    captureNavigation(tr)
    tr.end()
    const agentMarks = [
      'timeToFirstByte',
      'domInteractive',
      'domComplete',
      'firstContentfulPaint'
    ]

    expect(Object.keys(tr.marks.agent)).toEqual(agentMarks)
    agentMarks.forEach(mark => {
      expect(tr.marks.agent[mark]).toBeGreaterThanOrEqual(0)
    })
    unMock()
  })

  it('should not capture agent marks for route-change transaction', function() {
    const unMock = mockGetEntriesByType()
    const tr = new Transaction('test', ROUTE_CHANGE)
    tr.captureTimings = true
    captureNavigation(tr)
    tr.end()

    expect(tr.marks).toBeUndefined()
    unMock()
  })

  it('should fix custom marks when changing transaction._start', function() {
    const tr = new Transaction('test', PAGE_LOAD)
    tr.captureTimings = true
    tr.mark('testMark')
    const markValue = tr.marks.custom.testMark
    const start = tr._start
    expect(markValue).toBeGreaterThanOrEqual(0)
    expect(start).toBeGreaterThan(0)
    tr.end()
    captureNavigation(tr)
    expect(tr.marks.custom.testMark).toEqual(start + markValue)
  })

  it('should set firstContentfulPaint', function() {
    const unMock = mockGetEntriesByType()
    const tr = new Transaction('test', PAGE_LOAD)
    tr.captureTimings = true
    captureNavigation(tr)
    tr.end()

    expect(tr.marks.agent.firstContentfulPaint).toBeGreaterThan(0)
    unMock()
  })

  it('should handle missing first-contentful-paint on page load', function() {
    const unMock = mockPaintEntryWithMissingFCP()
    const tr = new Transaction('test', PAGE_LOAD)
    tr.captureTimings = true
    captureNavigation(tr)
    tr.end()

    expect(tr.marks.agent.firstContentfulPaint).toBeUndefined()
    unMock()
  })

  it('should not add API calls as resource timing spans', function() {
    const unMock = mockGetEntriesByType()
    const tr = new Transaction('test', PAGE_LOAD, {
      startTime: transactionStart
    })
    const apiSpan = tr.startSpan('GET http://ajax-filter.test', 'external.http')
    apiSpan.end()
    tr.captureTimings = true
    tr.end(transactionEnd)
    captureNavigation(tr)

    const filteredRTSpan = tr.spans.filter(({ name, type }) => {
      return name.indexOf('http://ajax-filter.test') >= 0 && type === 'resource'
    })
    expect(filteredRTSpan).toEqual([])
    expect(tr.spans.length, 23)

    unMock()
  })
})
