var initElasticApm = require('../../..').init
// import init as initElasticApm from '../../..'

var elasticApm = initElasticApm({
  debug: true,
  serviceUrl: 'http://localhost:8200',
  serviceName: 'apm-agent-js-base-test-e2e-general-usecase'
})

setTimeout(function () {
  throw new Error('timeout test error')
}, 100)
