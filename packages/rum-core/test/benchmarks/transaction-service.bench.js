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

suite('TransactionService', () => {
  const serviceFactory = createServiceFactory()
  const transactionService = serviceFactory.getService('TransactionService')
  const configService = serviceFactory.getService('ConfigService')
  // To avoid timeouts interfering with benchmark results
  configService.setConfig({
    checkBrowserResponsiveness: false
  })

  benchmark('page-load transaction overhead', () => {
    const tr = transactionService.startTransaction('/index', 'page-load')
    setImmediate(() => tr.end())
  })

  benchmark('custom transaction overhead', () => {
    const tr = transactionService.startTransaction('custom', 'custom')
    setImmediate(() => tr.end())
  })

  benchmark(
    'span creation overhead',
    () => {
      const span = transactionService.startSpan('test-span', 'custom')
      setImmediate(() => span.end())
    },
    {
      onSetup() {
        /**
         * Ensures we have  currentTranaction in place when span creation is done
         */
        transactionService.createTransaction('test-tr', 'custom')
      }
    }
  )
})
