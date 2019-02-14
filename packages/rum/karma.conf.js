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

const { baseConfig, prepareConfig } = require('../../dev-utils/karma.js')
const { getConfig } = require('../../dev-utils/test')

module.exports = function(config) {
  // temporarily set firefox version to 44 due to apm-server#676 issue
  baseConfig.customLaunchers.SL_FIREFOX.version = '44'
  baseConfig.browserNoActivityTimeout = 120000

  config.set(baseConfig)
  var testConfig = getConfig()
  var customeConfig = {
    globalConfigs: testConfig,
    testConfig: testConfig.env
  }
  console.log('customeConfig:', customeConfig)
  config.set(customeConfig)
  var cfg = prepareConfig(config)
  config.set(cfg)
}
