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

describe('Span', () => {
  function createTransaction(duration, sampled = true, type) {
    const name = `tr${duration}`
    const tr = new Transaction(name, type || `${name}-type`)
    tr.sampled = sampled
    tr.end()
    tr._start = 0
    tr._end = duration
    return tr
  }

  function createTransactionWithSpan(sampled) {
    const tr = new Transaction('tr1', `tr1-type`)
    tr.sampled = sampled
    for (let i = 1; i < 3; i++) {
      const name = `span${i}`
      const span = tr.startSpan(name, `${name}type.${name}`)
      span.end()
      span._start = 0
      span._end = 100
    }
    tr.end()
    return tr
  }

  it('should capture breakdown for transaction', () => {
    const breakdown = captureBreakdown(createTransaction(200))
    expect(breakdown[0]).toEqual({
      transaction: {
        name: 'tr200',
        type: 'tr200-type'
      },
      samples: {
        'transaction.duration.count': {
          value: 1
        },
        'transaction.duration.sum.us': {
          value: 200
        },
        'transaction.breakdown.count': {
          value: 1
        }
      }
    })
  })

  it('should capture breakdown for page-load transaction', () => {
    const breakdown = captureBreakdown(
      createTransaction(200, true, PAGE_LOAD),
      TIMING_LEVEL1_ENTRY
    )
    const spanTypes = ['Network', 'TTFB', 'DOM Processing', 'Page Render']

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

  it('should set transaction breakdown count based on sampled flag', () => {
    const sampledBreakdown = captureBreakdown(createTransaction(100))
    expect(sampledBreakdown[0].samples['transaction.breakdown.count']).toEqual({
      value: 1
    })

    const unsampledBreakdown = captureBreakdown(createTransaction(100, false))
    expect(
      unsampledBreakdown[0].samples['transaction.breakdown.count']
    ).toEqual({
      value: 0
    })
  })

  it('should capture span breakdown as part of transaction', () => {
    const tr = createTransactionWithSpan(true)
    const breakdown = captureBreakdown(tr)

    expect(breakdown[1]).toEqual({
      transaction: {
        name: 'tr1',
        type: 'tr1-type'
      },
      span: {
        type: 'span1type',
        subtype: 'span1'
      },
      samples: {
        'span.self_time.count': {
          value: 1
        },
        'span.self_time.sum.us': {
          value: 100
        }
      }
    })

    expect(breakdown[2]).toEqual({
      transaction: {
        name: 'tr1',
        type: 'tr1-type'
      },
      span: {
        type: 'span2type',
        subtype: 'span2'
      },
      samples: {
        'span.self_time.count': {
          value: 1
        },
        'span.self_time.sum.us': {
          value: 100
        }
      }
    })
  })

  it('should not capture span breakdown for unsampled transaction', () => {
    const tr = createTransactionWithSpan(false)
    const breakdown = captureBreakdown(tr)

    expect(breakdown[1]).not.toBeDefined()
  })
})
