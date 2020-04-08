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

export function generateTestTransaction(noOfSpans, sampled) {
  const tr = new Transaction(
    `transaction with ${noOfSpans} spans`,
    'transaction1type',
    { startTime: 0, transactionSampleRate: sampled ? 1 : 0 }
  )
  let lastSpanEnd = 0
  for (let i = 0; i < noOfSpans; i++) {
    const span = tr.startSpan(`span ${i}`, `span${i}type`, { startTime: i })
    lastSpanEnd = 10 + i
    span.end(lastSpanEnd)
  }

  tr.end(lastSpanEnd + 100)
  return tr
}

export function generateTransactionWithGroupedSpans(noOfSpans) {
  const tr = new Transaction('tr', 'custom', { startTime: 0 })
  const mid = Math.floor(noOfSpans / 2)
  /**
   * Can be grouped only when name and type are same
   * and the spans occur continuosly with some delta
   */
  let delta = 0,
    lastSpanEnd = 0
  for (let i = 0; i < noOfSpans; i++) {
    let name = 'name'
    let type = 'type'
    if (i >= mid) {
      name += i
      type += i
    }
    const span = tr.startSpan(name, type, { startTime: i + delta })
    lastSpanEnd = i + delta + 1
    span.end(lastSpanEnd)
    delta += 2
  }

  tr.end(lastSpanEnd + 10)
  return tr
}
