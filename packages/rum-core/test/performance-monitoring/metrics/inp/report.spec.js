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

import * as inpProcessor from '../../../../src/performance-monitoring/metrics/inp/process'
import { reportInp } from '../../../../src/performance-monitoring/metrics/inp/report'
import { createServiceFactory } from '../../../../src'
import { TRANSACTION_SERVICE, EVENT } from '../../../../src/common/constants'
import * as utils from '../../../../src/common/utils'

import { spyOnFunction } from '../../../../../../dev-utils/jasmine'
import Transaction from '../../../../src/performance-monitoring/transaction'

if (utils.isPerfTypeSupported(EVENT)) {
  describe('reportInp', () => {
    let serviceFactory
    let transactionService
    let calculateInpSpy

    beforeEach(() => {
      serviceFactory = createServiceFactory()
      transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
      calculateInpSpy = spyOnFunction(inpProcessor, 'calculateInp')
    })

    it('should not report if metric is < 0', () => {
      calculateInpSpy.and.returnValue(-1)

      const tr = reportInp(transactionService)
      expect(tr).toBeUndefined()
    })

    describe('when metric is >= 0', () => {
      beforeEach(() => {
        calculateInpSpy.and.returnValue(0)
      })

      it('should create page-exit transaction', () => {
        const hardNavigatedPage = performance.getEntriesByType('navigation')[0]
        const restoreINPSpy = spyOnFunction(inpProcessor, 'restoreINPState')
        const endSpy = spyOnFunction(Transaction.prototype, 'end')
        endSpy.and.callThrough() // To make sure we can calculate the transaction duration

        const tr = reportInp(transactionService)
        const duration = tr._end - tr._start

        expect(tr.type).toBe('page-exit')
        expect(tr.context.tags.inp_value).toBe(0)
        expect(tr.context.page.url).toBe(hardNavigatedPage.name)
        expect(duration).toBeGreaterThanOrEqual(1)
        expect(endSpy).toHaveBeenCalledTimes(1)
        expect(restoreINPSpy).toHaveBeenCalledTimes(1)
      })
    })
  })
}
