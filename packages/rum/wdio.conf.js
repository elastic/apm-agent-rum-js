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
const glob = require('glob')
const {
  getSauceConnectOptions,
  getBrowserList
} = require('../../dev-utils/test-config')
const { isChrome } = require('../../dev-utils/webdriver')

const { tunnelIdentifier, username, accessKey } = getSauceConnectOptions()

/**
 * Skip the ios platform on E2E tests because of script
 * timeout issue in Appium
 */
const capabilities = getBrowserList()
  .filter(({ platformName }) => platformName !== 'iOS')
  .map(capability => ({
    tunnelIdentifier,
    ...capability
  }))

exports.config = {
  runner: 'local',
  specs: glob.sync(join(__dirname, '/test/e2e/**/*.e2e-spec.js')),
  maxInstancesPerCapability: 3,
  services: ['sauce'],
  user: username,
  key: accessKey,
  sauceConnect: false,
  capabilities,
  logLevel: 'error',
  bail: 1,
  screenshotPath: join(__dirname, 'error-screenshot'),
  baseUrl: 'http://localhost:8000',
  waitforTimeout: 30000,
  framework: 'jasmine',
  reporters: ['dot', 'spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 90000
  },
  beforeTest() {
    /**
     * Sets timeout for scripts executed in the browser
     * via browser.executeAsync method
     */
    browser.setTimeout({ script: 20000 })
  },
  afterTest() {
    /** Log api is only available in Chrome */
    if (isChrome()) {
      const response = browser.getLogs('browser')
      console.log('browser.log:', JSON.stringify(response, undefined, 2))
    }
  }
}
