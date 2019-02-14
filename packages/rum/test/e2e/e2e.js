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

const elasticApm = require('../..')
const apmBase = elasticApm.apmBase

const ApmServerMock = require('../../../rum-core/test/utils/apm-server-mock')
function createApmBase(config) {
  /**
   * globalConfigs - environment variable injected by webpack
   * during e2e build process
   */
  // eslint-disable-next-line
  var envConfig = globalConfigs
  if (!window.globalConfigs) {
    window.globalConfigs = envConfig
  }
  var gc = window.globalConfigs
  console.log(gc)
  var apmServer
  apmServer = apmBase.serviceFactory.getService('ApmServer')
  if (gc.serverUrl) {
    config.serverUrl = gc.serverUrl
  }
  var serverMock = new ApmServerMock(apmServer, gc.useMocks)
  apmBase.serviceFactory.registerServiceInstance('ApmServer', serverMock)

  return elasticApm.init(config)
}

module.exports = createApmBase
