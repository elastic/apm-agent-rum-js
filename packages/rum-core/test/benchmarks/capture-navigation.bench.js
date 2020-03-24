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
import { captureNavigation } from '../../src/performance-monitoring/capture-navigation'
import Transaction from '../../src/performance-monitoring/transaction'
import { PAGE_LOAD } from '../../src/common/constants'

suite('CaptureNavigation', () => {
  const options = {
    managed: true,
    startTime: 0,
    transactionSampleRate: 1
  }

  benchmark('page-load transaction', () => {
    const pageLoadTr = new Transaction('/index', PAGE_LOAD, options)
    pageLoadTr.captureTimings = true
    pageLoadTr.end(5000)
    captureNavigation(pageLoadTr)
  })

  benchmark('other transaction', () => {
    /**
     * Does not include navigation timing spans and agent marks
     */
    const nonPageLoadTr = new Transaction('/index', 'custom', options)
    nonPageLoadTr.captureTimings = true
    nonPageLoadTr.end(5000)
    captureNavigation(nonPageLoadTr)
  })
})
