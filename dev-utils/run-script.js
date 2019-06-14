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
const {
  runKarma,
  runSauceConnect,
  runE2eTests: runE2eTestsUtils,
  buildE2eBundles: buildE2eBundlesUtils
} = require('./test-utils')

const runAll = require('npm-run-all')

const { startTestServers } = require('./test-servers')

const {
  getSauceConnectOptions,
  getTestEnvironmentVariables
} = require('./test-config')
const { generateNotice } = require('./dep-info')

const PROJECT_DIR = join(__dirname, '../')

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

function runE2eTests(configPath) {
  const webDriverConfig = join(PROJECT_DIR, configPath)
  runE2eTestsUtils(webDriverConfig, false)
}

function buildE2eBundles(basePath) {
  buildE2eBundlesUtils(join(PROJECT_DIR, basePath), err => {
    err && process.exit(2)
  })
}

function runSauceTests(serve = 'true', path = './', ...scripts) {
  /**
   * `console.logs` from the tests will be truncated when the process exits
   * To avoid truncation, we flush the data from stdout before exiting the process
   */
  if (process.stdout.isTTY && process.stdout._handle) {
    process.stdout._handle.setBlocking(true)
  }

  let servers = []
  if (serve === 'true') {
    servers = startTestServers(join(PROJECT_DIR, path))
  }
  /**
   * Decides the saucelabs test status
   */
  let exitCode = 0
  const loggerOpts = {
    stdout: process.stdout,
    stderr: process.stderr
  }
  /**
   * Since there is no easy way to reuse the sauce connect tunnel even using same tunnel identifier,
   * we launch the sauce connect tunnel before starting all the saucelab tests
   */
  const sauceConnectOpts = getSauceConnectOptions()
  runSauceConnect(sauceConnectOpts, async sauceConnectProcess => {
    try {
      await runAll(scripts, loggerOpts)
      console.log(`Ran all [${scripts.join(', ')}] scripts successfully!`)
    } catch (err) {
      console.log('Sauce Tests Failed', err)
      exitCode = 1
    } finally {
      servers.map(s => s.close())
      sauceConnectProcess.close(() => {
        exitCode && process.exit(exitCode)
      })
    }
  })
}

const scripts = {
  runUnitTests,
  launchSauceConnect,
  generateNotice,
  runSauceTests,
  runE2eTests,
  buildE2eBundles,
  startTestServers
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
