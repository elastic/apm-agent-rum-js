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

var createApmBase = require('../e2e')

var active = Math.random() < 1
var serverUrl = 'http://localhost:8003'

var elasticApm = createApmBase({
  active,
  debug: true,
  serviceName: 'apm-agent-js-base-test-e2e-general-usecase',
  serviceVersion: '0.0.1',
  distributedTracingOrigins: [serverUrl],
  pageLoadTraceId: '286ac3ad697892c406528f13c82e0ce1',
  pageLoadSpanId: 'bbd8bcc3be14d814',
  pageLoadSampled: true
})

const { createTracer } = require('../../../src/opentracing')
var tracer = createTracer(elasticApm)

var otSpan = tracer.startSpan('OpenTracing span')

otSpan.finish(Date.now() + 200)

elasticApm.setInitialPageLoadName('general-usecase-initial-page-load')

elasticApm.setUserContext({
  usertest: 'usertest',
  id: 'userId',
  username: 'username',
  email: 'email'
})
elasticApm.setCustomContext({ testContext: 'testContext' })
elasticApm.addTags({ testTagKey: 'testTagValue' })

elasticApm.addFilter(function(payload) {
  if (payload.errors) {
    payload.errors.forEach(function(error) {
      error.exception.message = error.exception.message.replace(
        'secret',
        '[REDACTED]'
      )
    })
  }
  if (payload.transactions) {
    payload.transactions.forEach(function(tr) {
      tr.spans.forEach(function(span) {
        if (span.context && span.context.http && span.context.http.url) {
          var url = new URL(span.context.http.url, window.location.origin)
          if (url.searchParams && url.searchParams.get('token')) {
            url.searchParams.set('token', 'REDACTED')
          }
          span.context.http.url = url.toString()
        }
      })
    })
  }
  // Make sure to return the payload
  return payload
})

function generateError() {
  throw new Error('timeout test error with a secret')
}

setTimeout(function() {
  generateError()
}, 100)

var url = '/test/e2e/common/data.json?test=hamid'
var req = new window.XMLHttpRequest()
req.open('GET', url, false)

req.addEventListener('load', function() {
  console.log('got data!')
})

req.send()

function checkDtInfo(payload) {
  console.log('distributed tracing data', payload)
  if (typeof payload.traceId !== 'string') {
    throw new Error('Wrong distributed tracing payload: ' + req.responseText)
  }
}

req = new window.XMLHttpRequest()
req.open('POST', serverUrl + '/data', false)
req.addEventListener('load', function() {
  var payload = JSON.parse(req.responseText)
  checkDtInfo(payload)
})
req.onerror = function(err) {
  console.log('XHR Error', err)
}
req.send()

if ('fetch' in window) {
  fetch(serverUrl + '/fetch', { method: 'POST' }).then(function(response) {
    response.json().then(function(payload) {
      checkDtInfo(payload)
    })
  })
}

generateError.tmp = 'tmp'

var appEl = document.getElementById('app')
var testEl = document.createElement('h2')
testEl.setAttribute('id', 'test-element')
testEl.innerHTML = 'Passed'
appEl.appendChild(testEl)
