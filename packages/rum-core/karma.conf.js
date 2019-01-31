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

var karmaUtils = require('./dev-utils/karma.js')
var testUtils = require('./dev-utils/test.js')

module.exports = function (config) {
  config.set(karmaUtils.baseConfig)
  var env = testUtils.getTestEnvironmentVariables()
  var customConfig = {
    globalConfigs: {
      useMocks: false,
      agentConfig: {
        serverUrl: 'http://localhost:8200',
        serviceName: 'test',
        serviceVersion: 'test-version',
        agentName: 'apm-js-core',
        agentVersion: '0.0.1'
      }
    },
    testConfig: env
  }

  if (env.serverUrl) {
    customConfig.globalConfigs.agentConfig.serverUrl = env.serverUrl
  }

  console.log('customConfig:', JSON.stringify(customConfig, undefined, 2))
  config.set(customConfig)
  config.files.unshift('test/utils/polyfill.js')
  config.files.unshift('node_modules/es6-promise/dist/es6-promise.auto.js')
  // config.files.push({ pattern: 'test/exceptions/data/*.js', included: false, watched: false })
  config.files.push({ pattern: 'src/**/*.js', included: false, watched: true })

  var cfg = karmaUtils.prepareConfig(config)
  config.set(cfg)
}
