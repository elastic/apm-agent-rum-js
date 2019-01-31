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

var logLevels = {
  ALL: { value: Number.MIN_VALUE },
  DEBUG: { value: 700 },
  INFO: { value: 800 },
  WARNING: { value: 900 },
  SEVERE: { value: 1000 },
  OFF: { value: Number.MAX_VALUE }
}

var debugMode = false
var debugLevel = logLevels.INFO.value
function assertNoBrowserErrors (whitelist) {
  return new Promise((resolve, reject) => {
    // TODO: Bug in ChromeDriver: Need to execute at least one command
    // so that the browser logs can be read out!
    browser.execute('1+1')
    var response = browser.log('browser')
    var failureEntries = []
    var debugLogs = []
    var browserLog = response.value

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
      reject(
        new Error(
          'Expected no errors in the browserLog but got ' + failureEntries.length + ' error(s)'
        )
      )
    } else {
      resolve()
    }
  })
}

function isLogEntryATestFailure (entry, whitelist) {
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
module.exports = {
  allowSomeBrowserErrors: function allowSomeBrowserErrors (whitelist, done) {
    if (typeof done === 'function') {
      assertNoBrowserErrors(whitelist).then(() => {
        done()
      })
    } else {
      return assertNoBrowserErrors(whitelist)
    }
  },
  verifyNoBrowserErrors: function verifyNoBrowserErrors (done) {
    if (typeof done === 'function') {
      assertNoBrowserErrors([]).then(() => {
        done()
      })
    } else {
      return assertNoBrowserErrors([])
    }
  },
  handleError: function handleError (done) {
    return function (error) {
      console.log(error, error.stack)
      if (error.message.indexOf('received Inspector.detached event') === -1) {
        done.fail(error)
      }
      // done()
    }
  }
}
