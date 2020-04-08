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
import { generateTestTransaction } from './'
import { TIMING_LEVEL1_ENTRY } from '../fixtures/navigation-entries'

suite('CaptureBreakdown', () => {
  benchmark('page-load transaction', () => {
    const pageLoadTr = new Transaction('/index', PAGE_LOAD, {
      startTime: 0,
      transactionSampleRate: 1
    })
    pageLoadTr.end(5000)
    captureBreakdown(pageLoadTr, TIMING_LEVEL1_ENTRY)
  })

  benchmark('other transaction', () => {
    const nonPageLoadTr = generateTestTransaction(10, true)
    captureBreakdown(nonPageLoadTr)
  })
})
