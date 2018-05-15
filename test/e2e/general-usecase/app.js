var initElasticApm = require('../../..').init
// import init as initElasticApm from '../../..'
var createApmBase = require('../e2e')

var active = Math.random() < 1

var elasticApm = createApmBase({
  active: active,
  debug: true,
  serviceName: 'apm-agent-js-base-test-e2e-general-usecase',
  serviceVersion: '0.0.1'
})

elasticApm.setInitialPageLoadName('general-usecase-initial-page-load')

elasticApm.setUserContext({usertest: 'usertest',id: 'userId',username: 'username',email: 'email'})
elasticApm.setCustomContext({testContext: 'testContext'})
elasticApm.setTags({'testTagKey': 'testTagValue'})

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
          var url = new URL(span.context.http.url.raw)
          if (url.searchParams && url.searchParams.get('token')) {
            url.searchParams.set('token', 'REDACTED')
          }
          span.context.http.url.raw = url.toString()
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

generateError.tmp = 'tmp'

var appEl = document.getElementById('app')
var testEl = document.createElement('h2')
testEl.setAttribute('id', 'test-element')
testEl.innerHTML = 'Passed'
appEl.appendChild(testEl)
