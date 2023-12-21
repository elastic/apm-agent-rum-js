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

import { calculateInp, restoreINPState } from './process'
import { now } from '../../../common/utils'
import { PAGE_EXIT } from '../../../common/constants'

export function reportInp(transactionService) {
  const inp = calculateInp()
  if (inp >= 0) {
    const startTime = now()
    const inpTr = transactionService.startTransaction(PAGE_EXIT, PAGE_EXIT, {
      startTime
    })

    // INP should be anchored to the page that the user "hard navigated to"
    // the main reason for this is that the UX dasboard page only allows to filter those urls
    // with a page-load transaction associated.
    // we will revisit this logic once soft navigations start reporting Web vitals metrics
    const navigations = performance.getEntriesByType('navigation')
    // We should always be expecting to receive one entry.
    if (navigations.length > 0) {
      const hardNavigationUrl = navigations[0].name
      inpTr.addContext({
        page: {
          url: hardNavigationUrl
        }
      })
    }

    inpTr.addLabels({
      inp_value: inp
    })

    // make sure that transaction's duration is > 0
    // we do the +1 because INP can be also reported as 0
    const endTime = startTime + inp + 1
    inpTr.end(endTime)

    // restart INP tracking information
    // since users can enter and leave the page multiple times
    restoreINPState()

    return inpTr
  }
}
