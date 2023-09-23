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

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { getGlobalConfig } = require('../../../../../dev-utils/test-config')
const {
  getWebpackConfig,
  BUNDLE_TYPES,
  WEBPACK_HASH_FN
} = require('../../../../../dev-utils/build')

const { serverUrl, mockBackendUrl } = getGlobalConfig().testConfig

const commonConfig = getWebpackConfig(BUNDLE_TYPES.BROWSER_DEV)
module.exports = {
  entry: path.join(__dirname, 'app.js'),
  output: {
    path: path.resolve(__dirname),
    filename: 'app.e2e-bundle.min.js',
    hashFunction: WEBPACK_HASH_FN
  },
  ...commonConfig,
  plugins: [
    ...commonConfig.plugins,
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.ejs'),
      filename: path.resolve(__dirname, 'async-e2e.html'),
      templateParameters: {
        serverUrl,
        mockBackendUrl
      },
      inject: false
    })
  ]
}
