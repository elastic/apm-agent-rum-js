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

import createApmBase from '../'
import { renderTestElement } from '../utils'

const apm = createApmBase({
  serviceName: 'manual-timing',
  sendPageLoadTransaction: false,
  operationMode: 'manual'
})

const transaction = apm.startTransaction('transaction-name', 'transaction-type')
transaction.addTask('load-event')
window.addEventListener('load', function() {
  transaction.mark('load-event')
  setTimeout(() => {
    transaction.removeTask('load-event')
  })
})

const span = transaction.startSpan('span-name', 'span-type')

renderTestElement()

span.end()

function generateError() {
  throw new Error('timeout test error with a secret')
}

setTimeout(function() {
  try {
    generateError()
  } catch (e) {
    apm.captureError(e)
  }
}, 100)

var url = '/test/e2e/common/data.json?test=hamid'
var httpSpan = transaction.startSpan('FETCH ' + url, 'http')

var isFetchSupported = 'fetch' in window

if (isFetchSupported) {
  fetch(url).then(resp => {
    if (!resp.ok) {
      apm.captureError(
        new Error(`fetch failed with status ${resp.status} ${resp.statusText}`)
      )
    }
    httpSpan.end()
  })
}

var tid = transaction.addTask()
var req = new window.XMLHttpRequest()
req.open('GET', url)
req.addEventListener('load', function() {
  console.log('got data!')
  transaction.removeTask(tid)
  !isFetchSupported && httpSpan.end()
})

req.send()
