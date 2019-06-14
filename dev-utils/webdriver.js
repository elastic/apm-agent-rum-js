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
const { getSauceConnectOptions, getBrowserList } = require('./test-config')

const logLevels = {
  ALL: { value: Number.MIN_VALUE },
  DEBUG: { value: 700 },
  INFO: { value: 800 },
  WARNING: { value: 900 },
  SEVERE: { value: 1000 },
  OFF: { value: Number.MAX_VALUE }
}
const debugMode = false
const debugLevel = logLevels.INFO.value

function isChrome() {
  const browserName = browser.capabilities.browserName.toLowerCase()
  return browserName.indexOf('chrome') !== -1
}

function assertNoBrowserErrors(whitelist) {
  return new Promise((resolve, reject) => {
    /**
     * browser.log API is available only in chrome
     */
    if (!isChrome()) {
      return resolve()
    }
    var response = browser.getLogs('browser')
    var failureEntries = []
    var debugLogs = []
    var browserLog = response

    for (var i = 0; i < browserLog.length; i++) {
      var logEntry = browserLog[i]
      if (isLogEntryATestFailure(logEntry, whitelist)) {
        failureEntries.push(logEntry)
      }
      if (logLevels[logEntry.level].value >= debugLevel) {
        debugLogs.push(logEntry)
      }
    }

    if (failureEntries.length > 0 || debugMode) {
      console.log('------------> FailuresLogs')
      console.log(JSON.stringify(failureEntries, undefined, 2))
    }

    if (debugMode) {
      console.log('------------> debugLogs')
      console.log(JSON.stringify(debugLogs, undefined, 2))
    }

    if (failureEntries.length > 0) {
      return reject(
        new Error(
          'Expected no errors in the browserLog but got ' +
            failureEntries.length +
            ' error(s)'
        )
      )
    }
    resolve()
  })
}

function isLogEntryATestFailure(entry, whitelist) {
  var result = false
  if (logLevels[entry.level].value > logLevels.WARNING.value) {
    result = true
    if (whitelist) {
      for (var i = 0, l = whitelist.length; i < l; i++) {
        if (entry.message.indexOf(whitelist[i]) !== -1) {
          result = false
          break
        }
      }
    }
  }
  return result
}

function getWebdriveBaseConfig(path) {
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

  return {
    runner: 'local',
    specs: glob.sync(join(path, './test/e2e/**/*.e2e-spec.js')),
    maxInstancesPerCapability: 3,
    services: ['sauce'],
    user: username,
    key: accessKey,
    sauceConnect: false,
    capabilities,
    logLevel: 'error',
    bail: 1,
    screenshotPath: join(path, 'error-screenshot'),
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
    afterTest(test) {
      /**
       * Log only on failures
       * Log api is only available in chrome driver
       * */
      if (!test.passed && isChrome()) {
        const response = browser.getLogs('browser')
        console.log('[Browser Logs]:', JSON.stringify(response, undefined, 2))
      }
    }
  }
}

module.exports = {
  allowSomeBrowserErrors: function allowSomeBrowserErrors(whitelist, done) {
    if (typeof done === 'function') {
      assertNoBrowserErrors(whitelist).then(() => {
        done()
      })
    } else {
      return assertNoBrowserErrors(whitelist)
    }
  },
  verifyNoBrowserErrors: function verifyNoBrowserErrors(done) {
    if (typeof done === 'function') {
      assertNoBrowserErrors([]).then(() => {
        done()
      })
    } else {
      return assertNoBrowserErrors([])
    }
  },
  handleError: function handleError(done) {
    return function(error) {
      console.log(error, error.stack)
      if (error.message.indexOf('received Inspector.detached event') === -1) {
        done.fail(error)
      }
      // done()
    }
  },
  isChrome,
  getWebdriveBaseConfig
}
