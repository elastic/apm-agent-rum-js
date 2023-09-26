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

const { join } = require('path')
const {
  BUNDLE_TYPES,
  WEBPACK_HASH_FN,
  getWebpackReleaseConfig
} = require('../../dev-utils/build')

const OUTPUT_DIR = join(__dirname, 'dist', 'bundles')
const SRC_DIR = join(__dirname, 'src')

const devConfig = entry => ({
  ...getWebpackReleaseConfig(BUNDLE_TYPES.BROWSER_DEV),
  entry,
  output: {
    filename: '[name].umd.js',
    path: OUTPUT_DIR,
    hashFunction: WEBPACK_HASH_FN,
    library: '[name]',
    libraryTarget: 'umd'
  }
})

const prodConfig = name => ({
  ...getWebpackReleaseConfig(BUNDLE_TYPES.BROWSER_PROD, name),
  output: {
    filename: '[name].umd.min.js',
    path: OUTPUT_DIR,
    hashFunction: WEBPACK_HASH_FN
  }
})

const rumDevConfig = devConfig({
  'elastic-apm-rum': join(SRC_DIR, 'index.js')
})
const rumProdConfig = { ...rumDevConfig, ...prodConfig('apm-rum') }

const rumOpenTracingDevConfig = devConfig({
  'elastic-apm-opentracing': join(SRC_DIR, 'opentracing.js')
})
const rumOpenTracingProdConfig = {
  ...rumOpenTracingDevConfig,
  ...prodConfig('apm-opentracing')
}

module.exports = [
  rumDevConfig,
  rumProdConfig,
  rumOpenTracingDevConfig,
  rumOpenTracingProdConfig
]
