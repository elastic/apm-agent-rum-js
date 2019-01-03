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

elasticApm.setInitialPageLoadName('general-usecase-initial-page-load')

elasticApm.setUserContext({
  usertest: 'usertest',
  id: 'userId',
  username: 'username',
  email: 'email'
})
elasticApm.setCustomContext({ testContext: 'testContext' })
elasticApm.setTags({ testTagKey: 'testTagValue' })

elasticApm.addFilter(function (payload) {
  if (payload.errors) {
    payload.errors.forEach(function (error) {
      error.exception.message = error.exception.message.replace('secret', '[REDACTED]')
    })
  }
  if (payload.transactions) {
    payload.transactions.forEach(function (tr) {
      tr.spans.forEach(function (span) {
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

function generateError () {
  throw new Error('timeout test error with a secret')
}

setTimeout(function () {
  generateError()
}, 100)

var url = '/test/e2e/common/data.json?test=hamid'
var req = new window.XMLHttpRequest()
req.open('GET', url, false)

req.addEventListener('load', function () {
  console.log('got data!')
})

req.send()

function checkDtInfo (payload) {
  console.log('distributed tracing data', payload)
  if (typeof payload.traceId !== 'string') {
    throw new Error('Wrong distributed tracing payload: ' + req.responseText)
  }
}

req = new window.XMLHttpRequest()
req.open('POST', serverUrl + '/data', false)
req.addEventListener('load', function () {
  var payload = JSON.parse(req.responseText)
  checkDtInfo(payload)
})
req.onerror = function (err) {
  console.log('XHR Error', err)
}
req.send()

if ('fetch' in window) {
  fetch(serverUrl + '/fetch', { method: 'POST' }).then(function (response) {
    response.json().then(function (payload) {
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
