
var ApmBase = require('./apm-base')
var utils = require('elastic-apm-js-core/src/common/utils')
var apmBase = new ApmBase()
function initApmBase () {
  return apmBase.init.apply(apmBase, arguments)
}

window.elasticApm = apmBase

var exports = {
  __esModule: true,
  default: apmBase.init.bind(apmBase),
  init: apmBase.init.bind(apmBase),
  apmBase: apmBase
}

module.exports = exports
