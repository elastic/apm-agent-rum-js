var bootstrap = require('./bootstrap')
var enabled = bootstrap()

var apmCore = require('elastic-apm-js-core')
var ApmBase = require('./apm-base')

var serviceFactory = apmCore.createServiceFactory()

var apmBase = new ApmBase(serviceFactory, !enabled)

if (typeof window !== 'undefined') {
  window.elasticApm = apmBase
}

var exports = {
  __esModule: true,
  default: apmBase.init.bind(apmBase),
  init: apmBase.init.bind(apmBase),
  ApmBase: ApmBase,
  apmBase: apmBase,
  apm: apmBase
}

module.exports = exports
