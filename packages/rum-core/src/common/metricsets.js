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

function microtime() {
  return Date.now() * 1000
}

export function createMetricForTransactions(transactions) {
  const metricSets = []
  const timestamp = microtime()

  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i]
    const { name, type } = transaction
    metricSets.push({
      timestamp,
      transaction: { name, type },
      samples: {
        'transaction.duration.count': {
          value: 1
        },
        'transaction.duration.sum.us': {
          value: transaction.duration
        },
        'transaction.breakdown.count': {
          value: 1
        }
      }
    })
    transaction.breakdown.forEach(timing => {
      metricSets.push({
        timestamp,
        transaction: { name, type },
        span: { type: timing.type, subType: timing.subType },
        samples: {
          'span.self_time.count': {
            value: timing.count
          },
          'span.self_time.sum.us': {
            value: timing.duration
          }
        }
      })
    })
  }

  return metricSets
}
