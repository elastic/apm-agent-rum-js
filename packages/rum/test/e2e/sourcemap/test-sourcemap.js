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

var sourceMap = require('source-map')

var bundleMap = require('./app.bundle.js.map.json')
var errorPayload = require('./sample-error-request.json')

var minfiedBundleMap = require('./app.bundle.min.js.map.json')
var minifiedErrorPayload = require('./sample-error-request-min.json')

function testMap(map, stacktrace) {
  return new Promise(resolve => {
    sourceMap.SourceMapConsumer.with(map, null, consumer => {
      var result = stacktrace.map(stack => {
        var mapped = consumer.originalPositionFor({
          line: stack.lineno,
          column: stack.colno
        })
        return { original: stack, mapped }
      })
      resolve(result)
    })
  })
}

var printStack = bundleName => result => {
  console.log(`\n --------- ${bundleName} \n`)
  console.log(JSON.stringify(result, null, 2))
}

testMap(bundleMap, errorPayload.errors[0].exception.stacktrace).then(
  printStack('bundle')
)
testMap(
  minfiedBundleMap,
  minifiedErrorPayload.errors[0].exception.stacktrace
).then(printStack('minified'))
