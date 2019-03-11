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
const { getSauceConnectOptions } = require('../../dev-utils/test-config')
const { isChrome } = require('../../dev-utils/webdriver')

const browserList = [
  {
    browserName: 'chrome',
    version: '62'
  },
  {
    browserName: 'firefox',
    version: '57'
  },
  {
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '17'
  },
  {
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  {
    browserName: 'android',
    platform: 'Linux',
    version: '5.0'
  }
]

const sauceConnectOpts = getSauceConnectOptions()

exports.config = {
  specs: [join(__dirname, '/test/e2e/**/*.e2e-spec.js')],
  maxInstancesPerCapability: 3,
  services: ['sauce'],
  user: sauceConnectOpts.username,
  key: sauceConnectOpts.accessKey,
  sauceConnect: false,
  sauceConnectOpts,
  capabilities: browserList,
  logLevel: 'silent',
  screenshotPath: join(__dirname, 'error-screenshot'),
  baseUrl: 'http://localhost:8000',
  waitforTimeout: 30000,
  framework: 'jasmine',
  reporters: ['dot', 'spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 90000
  },
  afterTest() {
    /** Log api is only available in Chrome */
    if (isChrome()) {
      browser.execute('1+1')
      var response = browser.log('browser')
      var browserLogs = response.value
      console.log('browser.log:', JSON.stringify(browserLogs, undefined, 2))
    }
  }
}
