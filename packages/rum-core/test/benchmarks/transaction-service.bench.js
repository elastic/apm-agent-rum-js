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

import { createServiceFactory } from '../../src/index'
import { PAGE_LOAD } from '../../src/common/constants'

suite('TransactionService', () => {
  const serviceFactory = createServiceFactory()
  const transactionService = serviceFactory.getService('TransactionService')

  benchmark('managed sampled transaction overhead', async () => {
    const tr = transactionService.startTransaction('/index', PAGE_LOAD, {
      managed: true,
      startTime: 0,
      transactionSampleRate: 1
    })
    await tr.end()
  })

  benchmark('managed unsampled overhead', async () => {
    const tr = transactionService.startTransaction('/index', PAGE_LOAD, {
      managed: true,
      startTime: 0,
      transactionSampleRate: 0
    })
    await tr.end()
  })

  benchmark('custom transaction overhead', async () => {
    const tr = transactionService.startTransaction('custom', 'custom')
    await tr.end()
  })

  benchmark(
    'span creation overhead',
    () => {
      const span = transactionService.startSpan('test-span', 'custom')
      span.end()
    },
    {
      onSetup() {
        /**
         * Ensures we have  currentTranaction in place when span creation is done
         */
        transactionService.ensureCurrentTransaction('test-tr', 'custom')
      }
    }
  )
})
