const { createTracer: createElasticTracer } = require('elastic-apm-js-core/src/opentracing')

function createTracer (apmBase) {
  return createElasticTracer(apmBase.serviceFactory)
}

if (window && window.elasticApm) {
  window.elasticApm.createTracer = createTracer.bind(window.elasticApm, window.elasticApm)
}

module.exports = {
  __esModule: true,
  default: createTracer,
  createTracer
}
