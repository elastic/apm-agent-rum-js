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

import { generateTestTransaction } from './'
import { createServiceFactory } from '../../src'
import { TRANSACTIONS } from '../../src/common/constants'
import { getGlobalConfig } from '../../../../dev-utils/test-config'

const { agentConfig } = getGlobalConfig('rum-core')

function getSendEvents(performanceMonitoring, apmServer) {
  return function(transactions) {
    const payload = transactions.map(tr => {
      return {
        [TRANSACTIONS]: performanceMonitoring.createTransactionPayload(tr)
      }
    })
    return apmServer.sendEvents(payload)
  }
}

suite('PerformanceMonitoring', () => {
  const serviceFactory = createServiceFactory()
  const performanceMonitoring = serviceFactory.getService(
    'PerformanceMonitoring'
  )
  const apmServer = serviceFactory.getService('ApmServer')
  const _postJson = apmServer._postJson
  const configService = serviceFactory.getService('ConfigService')
  configService.setConfig({ serviceName: 'benchmark-performance-monitoring' })
  configService.setConfig(agentConfig)

  function ResolvedPromise() {
    return Promise.resolve()
  }
  const sampledTr = generateTestTransaction(10, true)
  const unsampledTr = generateTestTransaction(10, false)
  const sendEvents = getSendEvents(performanceMonitoring, apmServer)

  benchmark('createTransactionPayload Sampled', function() {
    performanceMonitoring.createTransactionPayload(sampledTr)
  })

  benchmark('createTransactionPayload Unsampled', function() {
    performanceMonitoring.createTransactionPayload(unsampledTr)
  })

  benchmark('sendEvents-no-json', function() {
    apmServer._postJson = ResolvedPromise
    sendEvents([sampledTr])
  })

  benchmark(
    'sendEvents',
    function() {
      apmServer._postJson = _postJson
      sendEvents([sampledTr])
    },
    { delay: 1 }
  )
})
