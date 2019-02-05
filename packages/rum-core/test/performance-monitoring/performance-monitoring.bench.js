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

var createServiceFactory = require('..').createServiceFactory
var Transaction = require('../../src/performance-monitoring/transaction')

function generateTransaction () {
  var tr = new Transaction('transaction1', 'transaction1type')
  var span = tr.startSpan('span1', 'span1type')
  span.end()
  tr.detectFinish()

  if (tr._end === tr._start) {
    tr._end = tr._end + 100
  }
  return tr
}

suite('PerformanceMonitoring', function () {
  var serviceFactory = createServiceFactory()
  var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  var apmServer = serviceFactory.getService('ApmServer')
  var _postJson = apmServer._postJson
  var configService = serviceFactory.getService('ConfigService')
  configService.setConfig({ serviceName: 'benchmark-send-transactions' })
  var apmTestConfig = require('../apm-test-config')()
  configService.setConfig(apmTestConfig)

  benchmark('createTransactionPayload', function () {
    var tr = generateTransaction()
    performanceMonitoring.createTransactionPayload(tr)
  })

  function ResolvedPromise () {
    return Promise.resolve()
  }

  benchmark('sendTransactions-no-json', function () {
    apmServer._postJson = ResolvedPromise
    var tr = generateTransaction()
    performanceMonitoring.sendTransactions([tr])
  })

  benchmark(
    'sendTransactions',
    function () {
      apmServer._postJson = _postJson
      var tr = generateTransaction()
      performanceMonitoring.sendTransactions([tr])
    },
    { delay: 1 }
  )
})

suite.skip('PerformanceMonitoring - Defered', function () {
  var serviceFactory = createServiceFactory()
  var performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
  var configService = serviceFactory.getService('ConfigService')
  configService.setConfig({ serviceName: 'benchmark-send-transactions-defered' })
  benchmark(
    'sendTransactions - Defered',
    function (deferred) {
      var tr = generateTransaction()

      performanceMonitoring.sendTransactions([tr]).then(() => {
        deferred.resolve()
      })
    },
    { defer: true }
  )
})
