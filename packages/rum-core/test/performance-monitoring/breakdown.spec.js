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

import { captureBreakdown } from '../../src/performance-monitoring/breakdown'
import Transaction from '../../src/performance-monitoring/transaction'
import { PAGE_LOAD } from '../../src/common/constants'
import { TIMING_LEVEL1_ENTRY } from '../fixtures/navigation-entries'

describe('Breakdown metrics', () => {
  function createTransaction(type, { start = 0 } = {}) {
    const tr = new Transaction('trname', type, {
      startTime: start
    })
    tr.sampled = true
    return tr
  }

  /**
   * Dissect breakdown to make it easier for testing
   */
  function getBreakdownObj(breakdowns) {
    let spanBreakdown = {}
    if (breakdowns.length > 2) {
      for (let i = 2; i < breakdowns.length; i++) {
        const { span, samples } = breakdowns[i]
        let key = span.type
        if (typeof span.subtype !== 'undefined') {
          key += '.' + span.subtype
        }
        spanBreakdown[key] = samples
      }
    }
    return {
      details: breakdowns[0].transaction,
      transaction: breakdowns[0].samples,
      app: breakdowns[1].samples,
      ...spanBreakdown
    }
  }

  it('capture breakdown for page-load transaction', () => {
    const pageLoadTransaction = createTransaction(PAGE_LOAD)
    pageLoadTransaction.end()
    const breakdown = captureBreakdown(pageLoadTransaction, TIMING_LEVEL1_ENTRY)
    const spanTypes = [
      'DNS',
      'TCP',
      'Request',
      'Response',
      'Processing',
      'Load'
    ]

    const spans = breakdown.slice(1)

    spanTypes.forEach((type, index) => {
      const breakdownSpan = spans[index]
      expect(breakdownSpan.span.type).toBe(type)
      expect(breakdownSpan.samples['span.self_time.count'].value).toBe(1)
      expect(
        breakdownSpan.samples['span.self_time.sum.us'].value
      ).toBeGreaterThan(0)
    })
  })

  it('set transaction breakdown count based on sampled flag', () => {
    const tr = createTransaction('sampled')
    const sampledBreakdown = captureBreakdown(tr)
    expect(sampledBreakdown[0].samples['transaction.breakdown.count']).toEqual({
      value: 1
    })

    tr.sampled = false
    const unsampledBreakdown = captureBreakdown(tr)
    expect(
      unsampledBreakdown[0].samples['transaction.breakdown.count']
    ).toEqual({
      value: 0
    })
  })

  it('breakdown with only transaction', () => {
    const tr = createTransaction('custom')
    tr.end(20)
    const breakdown = getBreakdownObj(captureBreakdown(tr))

    expect(breakdown.details).toEqual({
      name: 'trname',
      type: 'custom'
    })
    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 20 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': {
        value: 1
      },
      'span.self_time.sum.us': {
        value: 20
      }
    })
  })

  it('transaction with single span', () => {
    const tr = createTransaction('custom')
    const span = tr.startSpan('foo', 'bar.baz', { startTime: 20 })
    span.end(40)
    tr.end(40)
    const breakdown = getBreakdownObj(captureBreakdown(tr))

    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 40 },
      'transaction.breakdown.count': { value: 1 }
    })

    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 20 }
    })

    expect(breakdown['bar.baz']).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 20 }
    })
  })

  it('transaction with single app sub span', () => {
    const tr = createTransaction('custom')
    const span = tr.startSpan('foo', 'app', { startTime: 15 })
    span.end(20)
    tr.end(30)
    const breakdown = getBreakdownObj(captureBreakdown(tr))

    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 30 },
      'transaction.breakdown.count': { value: 1 }
    })

    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 2 },
      'span.self_time.sum.us': { value: 30 }
    })
  })

  it('transaction with parallel sub spans', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 20 })
    const sp2 = tr.startSpan('bar', 'ext.http', { startTime: 20 })
    sp1.end(40)
    sp2.end(40)
    tr.end(50)
    const breakdown = getBreakdownObj(captureBreakdown(tr))
    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 50 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 30 }
    })
    expect(breakdown['ext.http']).toEqual({
      'span.self_time.count': { value: 2 },
      'span.self_time.sum.us': { value: 40 }
    })
  })

  it('transaction with overlapping sub spans', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 10 })
    const sp2 = tr.startSpan('bar', 'ext.http', { startTime: 15 })
    sp1.end(20)
    sp2.end(25)
    tr.end(30)
    const breakdown = getBreakdownObj(captureBreakdown(tr))
    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 30 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 15 }
    })
    expect(breakdown['ext.http']).toEqual({
      'span.self_time.count': { value: 2 },
      'span.self_time.sum.us': { value: 20 }
    })
  })

  it('transaction with sequential sub spans', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 10 })
    sp1.end(20)
    const sp2 = tr.startSpan('bar', 'ext.http', { startTime: 20 })
    sp2.end(30)
    const sp3 = tr.startSpan('baz', 'ext.http', { startTime: 30 })
    sp3.end(40)
    tr.end(40)
    const breakdown = getBreakdownObj(captureBreakdown(tr))

    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 40 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 10 }
    })
    expect(breakdown['ext.http']).toEqual({
      'span.self_time.count': { value: 3 },
      'span.self_time.sum.us': { value: 30 }
    })
  })

  it('transaction with spans covering app time', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 0 })
    sp1.end(15)
    const sp2 = tr.startSpan('bar', 'ext.http', { startTime: 15 })
    sp2.end(30)
    tr.end(30)
    const breakdown = getBreakdownObj(captureBreakdown(tr))

    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 30 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 0 }
    })
    expect(breakdown['ext.http']).toEqual({
      'span.self_time.count': { value: 2 },
      'span.self_time.sum.us': { value: 30 }
    })
  })

  it('transaction with different span types', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'foo', { startTime: 5 })
    const sp2 = tr.startSpan('bar', 'bar', { startTime: 15 })
    sp1.end(20)
    sp2.end(25)
    tr.end(30)
    const breakdown = getBreakdownObj(captureBreakdown(tr))
    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 30 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 10 }
    })
    expect(breakdown['foo']).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 15 }
    })
    expect(breakdown['bar']).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 10 }
    })
  })

  it('transaction with spans extending beyond end', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 20 })
    tr.end(30)
    sp1.end(40)
    const breakdown = getBreakdownObj(captureBreakdown(tr))
    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 30 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 20 }
    })
    expect(breakdown['ext.truncated']).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 10 }
    })
  })

  it('transaction with spans in different order', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 25 })
    const sp2 = tr.startSpan('foo', 'ext.http', { startTime: 20 })
    sp1.end(40)
    sp2.end(30)
    tr.end(50)
    const breakdown = getBreakdownObj(captureBreakdown(tr))
    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 50 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 30 }
    })
    expect(breakdown['ext.http']).toEqual({
      'span.self_time.count': { value: 2 },
      'span.self_time.sum.us': { value: 25 }
    })
  })

  it('do not include spans with 0 duration', () => {
    const tr = createTransaction('custom')
    const sp1 = tr.startSpan('foo', 'ext.http', { startTime: 20 })
    sp1.end(20)
    tr.end(30)
    const breakdown = getBreakdownObj(captureBreakdown(tr))

    expect(breakdown.transaction).toEqual({
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: 30 },
      'transaction.breakdown.count': { value: 1 }
    })
    expect(breakdown.app).toEqual({
      'span.self_time.count': { value: 1 },
      'span.self_time.sum.us': { value: 30 }
    })

    expect(breakdown['ext.http']).toBeUndefined()
  })

  it('do not capture span breakdown for unsampled transaction', () => {
    const tr = createTransaction('unsampled')
    tr.sampled = false
    tr.startSpan('foo', 'ext.http', { startTime: 10 }).end(20)
    tr.end()

    const breakdown = captureBreakdown(tr)
    expect(breakdown.length).toBe(1)
    expect(breakdown[0].samples['transaction.breakdown.count'].value).toBe(0)
  })
})
