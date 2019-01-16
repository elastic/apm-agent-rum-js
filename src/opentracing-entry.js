const indexExports = require('./index')
const opentracing = require('./opentracing')
const { extend } = require('elastic-apm-js-core/src/common/utils')
module.exports = extend({}, indexExports, opentracing)
