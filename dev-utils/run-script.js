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
const runAll = require('npm-run-all')
const {
  runKarma,
  runSauceConnect,
  runJasmine,
  runE2eTests: runE2eTestsUtils,
  buildE2eBundles: buildE2eBundlesUtils
} = require('./test-utils')
const { startTestServers } = require('./test-servers')
const {
  getTestEnvironmentVariables,
  getSauceConnectOptions
} = require('./test-config')
const { generateNotice } = require('./dep-info')

const PROJECT_DIR = join(__dirname, '../')
const { sauceLabs } = getTestEnvironmentVariables()

function runUnitTests(packagePath, startSauceConnect = 'false') {
  const karmaConfigFile = join(PROJECT_DIR, packagePath, 'karma.conf.js')
  if (startSauceConnect === 'true') {
    return launchSauceConnect(() => runKarma(karmaConfigFile))
  }
  runKarma(karmaConfigFile)
}

/**
 * Checks if the MODE is set to "saucelabs" and decides where to run the
 * corresponding callback function
 */
function launchSauceConnect(callback = () => {}) {
  if (sauceLabs) {
    const sauceOpts = getSauceConnectOptions()
    return runSauceConnect(sauceOpts, callback)
  }
  console.info('Skipping sauce tests, MODE is not set to saucelabs')
  return callback()
}

function runIntegrationTests() {
  const servers = startTestServers('./')
  const SPEC_DIR = 'test/integration'
  runJasmine(SPEC_DIR, err => {
    servers.forEach(server => server.close())
    if (err) {
      console.log('Integration tests failed:', err.message)
      process.exit(2)
    }
  })
}

/**
 * Ensure all the exports from our module works
 * in Node.js without babel transpiling the modules
 */
function runNodeTests() {
  const SPEC_DIR = 'test/node'
  runJasmine(SPEC_DIR, err => {
    if (err) {
      console.log('Node tests for build failed:', err.message)
      process.exit(2)
    }
  })
}

let cleanUps = []

function exitHandler(exitCode) {
  console.log('Running cleanups.')
  cleanUps.forEach(f => {
    try {
      f(exitCode)
    } catch (e) {
      console.error(e)
    }
  })
  cleanUps = []
  process.exit(exitCode)
}

process.on('exit', exitHandler)
process.on('uncaughtException', exitHandler)
process.on('SIGINT', exitHandler)

function runE2eTests(configPath) {
  const webDriverConfig = join(PROJECT_DIR, configPath)
  runE2eTestsUtils(webDriverConfig, false)
}

function buildE2eBundles(basePath) {
  return buildE2eBundlesUtils(join(PROJECT_DIR, basePath))
}

function runSauceTests(packagePath, serve = 'true', ...scripts) {
  /**
   * Since there is no easy way to reuse the sauce connect tunnel even using same tunnel identifier,
   * we launch the sauce connect tunnel before starting all the saucelab tests
   */

  let servers = []
  if (serve === 'true') {
    servers = startTestServers(join(PROJECT_DIR, packagePath))
  }
  cleanUps.push(() => {
    servers.map(s => s.close())
  })

  launchSauceConnect(async sauceConnectProcess => {
    if (!sauceLabs) {
      return runUnitTests(packagePath)
    }

    /**
     * `console.logs` from the tests will be truncated when the process exits
     * To avoid truncation, we flush the data from stdout before exiting the process
     */
    if (process.stdout.isTTY && process.stdout._handle) {
      process.stdout._handle.setBlocking(true)
    }

    /**
     * Decides the saucelabs test status
     */
    let exitCode = 0
    const loggerOpts = {
      stdout: process.stdout,
      stderr: process.stderr
    }

    try {
      await runAll(scripts, loggerOpts)
      console.log(`Ran all [${scripts.join(', ')}] scripts successfully!`)
    } catch (err) {
      console.log('Sauce Tests Failed', err)
      exitCode = 1
    } finally {
      sauceConnectProcess.close(() => {
        process.exit(exitCode)
      })
    }
  })
}

const scripts = {
  launchSauceConnect,
  generateNotice,
  runUnitTests,
  runSauceTests,
  runE2eTests,
  runIntegrationTests,
  runNodeTests,
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
