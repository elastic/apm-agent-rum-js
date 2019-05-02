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
const { runKarma, runSauceConnect } = require('./test-utils')
const {
  getSauceConnectOptions,
  getTestEnvironmentVariables
} = require('./test-config')
const { generateNotice } = require('./dep-info')

const sauceConnectOpts = getSauceConnectOptions()
const { sauceLabs } = getTestEnvironmentVariables()

function runUnitTests(launchSauceConnect = 'false', directory) {
  const karmaConfigFile = join(__dirname, '..', directory, './karma.conf.js')
  if (launchSauceConnect === 'true' && sauceLabs) {
    return runSauceConnect(sauceConnectOpts, () => runKarma(karmaConfigFile))
  }
  runKarma(karmaConfigFile)
}

function launchSauceConnect() {
  if (sauceLabs) {
    return runSauceConnect(sauceConnectOpts, () => {
      console.log('Launched SauceConnect!')
    })
  }
  console.log('set MODE=saucelabs to launch sauce connect')
}

const scripts = {
  runUnitTests,
  launchSauceConnect,
  generateNotice
}

function runScript() {
  const [, , scriptName, ...scriptArgs] = process.argv
  if (scriptName) {
    var message = `Running: ${scriptName}(${scriptArgs
      .map(a => a.trim())
      .join(', ')}) \n`
    console.log(message)
    if (typeof scripts[scriptName] === 'function') {
      return scripts[scriptName].apply(this, scriptArgs)
    } else {
      throw new Error('No script with name ' + scriptName)
    }
  }
}

runScript()
