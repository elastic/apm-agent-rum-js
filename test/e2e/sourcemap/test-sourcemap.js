var sourceMap = require('source-map')

var bundleMap = require('./app.bundle.js.map.json')
var errorPayload = require('./sample-error-request.json')

var minfiedBundleMap = require('./app.bundle.min.js.map.json')
var minifiedErrorPayload = require('./sample-error-request-min.json')

function testMap (map, stacktrace) {
  return new Promise((resolve, reject) => {
    sourceMap.SourceMapConsumer.with(map, null, consumer => {
      var result = stacktrace.map((stack) => {
        var mapped = consumer.originalPositionFor({ line: stack.lineno, column: stack.colno })
        return {original: stack,mapped: mapped}
      })
      resolve(result)
    })
  })
}

var printStack = bundleName => result => {
  console.log(`\n --------- ${bundleName} \n`)
  console.log(JSON.stringify(result, null, 2))
}

testMap(bundleMap, errorPayload.errors[0].exception.stacktrace)
  .then(printStack('bundle'))
testMap(minfiedBundleMap, minifiedErrorPayload.errors[0].exception.stacktrace)
  .then(printStack('minified'))
