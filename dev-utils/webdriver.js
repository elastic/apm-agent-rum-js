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

const { Promise } = require('es6-promise')
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

function assertNoBrowserErrors(whitelist) {
  return new Promise((resolve, reject) => {
    /**
     * browser.log API is available only in chrome driver
     * from 76 using webdriver protocol
     *
     * https://bugs.chromium.org/p/chromedriver/issues/detail?id=2947
     */
    if (!isChromeLatest()) {
      return resolve()
    }
    const failureEntries = []
    const debugLogs = []
    const browserLog = browser.getLogs('browser')

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

function allowSomeBrowserErrors(whitelist, done) {
  if (typeof done === 'function') {
    assertNoBrowserErrors(whitelist).then(() => {
      done()
    })
  } else {
    return assertNoBrowserErrors(whitelist)
  }
}

function verifyNoBrowserErrors(done) {
  if (typeof done === 'function') {
    assertNoBrowserErrors([]).then(() => {
      done()
    })
  } else {
    return assertNoBrowserErrors([])
  }
}

function handleError(done) {
  return function(error) {
    console.log(error, error.stack)
    if (error.message.indexOf('received Inspector.detached event') === -1) {
      done.fail(error)
    }
    done()
  }
}

function getWebdriveBaseConfig(
  path,
  specs = './test/e2e/**/*.e2e-spec.js',
  capabilities
) {
  const { tunnelIdentifier, username, accessKey } = getSauceConnectOptions()

  if (!capabilities) {
    /**
     * Skip the ios platform on E2E tests because of script
     * timeout issue in Appium
     */
    capabilities = getBrowserList().filter(
      ({ platformName }) => platformName !== 'iOS'
    )
  }

  capabilities = capabilities.map(capability => ({
    tunnelIdentifier,
    ...capability
  }))

  return {
    runner: 'local',
    specs: glob.sync(join(path, specs)),
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
    async before() {
      /**
       * Increase script timeout so that executeAsyncScript does not
       * throw async script failure in 0 ms error
       *
       * Skip setting timeouts on firefox and microsoftedge since they
       * result in NullPointerException issue from selenium driver
       */
      const { name } = getBrowserInfo()
      if (name === 'firefox' || name === 'microsoftedge') {
        return
      }

      await browser.setTimeout({ script: 30000 })
    },
    afterTest(test) {
      /**
       * Log only on failures
       * Log api is only available in chrome driver
       * */
      if (!test.passed && isChromeLatest()) {
        const response = browser.getLogs('browser')
        console.log(
          '[Chrome Browser Logs]:',
          JSON.stringify(response, undefined, 2)
        )
      }
    }
  }
}

function waitForApmServerCalls(errorCount = 0, transactionCount = 0) {
  const { name, version } = getBrowserInfo()
  console.log(
    `Waiting for minimum ${errorCount} Errors and ${transactionCount} Transactions in`,
    name,
    version
  )
  const serverCalls = browser.executeAsync(
    function(errorCount, transactionCount, done) {
      var apmServerMock = window.elasticApm.serviceFactory.getService(
        'ApmServer'
      )

      function checkCalls() {
        var serverCalls = apmServerMock.calls

        var validCalls = true

        if (errorCount) {
          validCalls =
            validCalls &&
            serverCalls.sendErrors &&
            serverCalls.sendErrors.length >= errorCount
        }
        if (transactionCount) {
          validCalls =
            validCalls &&
            serverCalls.sendTransactions &&
            serverCalls.sendTransactions.length >= transactionCount
        }

        if (validCalls) {
          console.log('calls', serverCalls)
          var promises = []

          if (serverCalls.sendErrors) {
            promises = promises.concat(
              serverCalls.sendErrors.map(function(s) {
                return s.returnValue
              })
            )
          }
          if (serverCalls.sendTransactions) {
            promises = promises.concat(
              serverCalls.sendTransactions.map(function(s) {
                return s.returnValue
              })
            )
          }

          Promise.all(promises)
            .then(function() {
              function mapCall(c) {
                return { args: c.args, mocked: c.mocked }
              }
              try {
                var calls = {
                  sendErrors: serverCalls.sendErrors
                    ? serverCalls.sendErrors.map(mapCall)
                    : undefined,
                  sendTransactions: serverCalls.sendTransactions
                    ? serverCalls.sendTransactions.map(mapCall)
                    : undefined
                }
                done(calls)
              } catch (e) {
                throw e
              }
            })
            .catch(function(reason) {
              console.log('reason', reason)
              try {
                done({ error: reason.message || JSON.stringify(reason) })
              } catch (e) {
                done({
                  error: 'Failed serializing rejection reason: ' + e.message
                })
              }
            })
        }
      }

      checkCalls()
      apmServerMock.subscription.subscribe(checkCalls)
    },
    errorCount,
    transactionCount
  )

  if (!serverCalls) {
    throw new Error('serverCalls is undefined!')
  }

  console.log(
    `Payload in ${name} ${version}`,
    JSON.stringify(serverCalls, null, 2)
  )
  if (serverCalls.error) {
    fail(serverCalls.error)
  }

  return serverCalls
}

function getBrowserInfo() {
  const { version, browserName } = browser.capabilities
  return {
    name: browserName.toLowerCase(),
    version
  }
}

function isChromeLatest() {
  const { name, version } = getBrowserInfo()
  const isChrome = name.indexOf('chrome') !== -1
  const isLatest = isChrome && version && Number(version.split('.')[0]) >= 76

  return isLatest
}

module.exports = {
  allowSomeBrowserErrors,
  verifyNoBrowserErrors,
  handleError,
  isChromeLatest,
  getWebdriveBaseConfig,
  getBrowserInfo,
  waitForApmServerCalls
}
