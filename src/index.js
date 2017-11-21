var ApmBase = require('./apm-base')
var apmBase = new ApmBase()
window.elasticApm = apmBase

var exports = {
  __esModule: true,
  default: apmBase.init.bind(apmBase),
  init: apmBase.init.bind(apmBase),
  apmBase: apmBase
}

module.exports = exports
