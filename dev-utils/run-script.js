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
  runJasmine,
  runE2eTests: runE2eTestsUtils,
  buildE2eBundles: buildE2eBundlesUtils
} = require('./test-utils')
const { startTestServers } = require('./test-servers')
const { generateNotice } = require('./dep-info')

const PROJECT_DIR = join(__dirname, '../')

let cleanUps = []

function startServersWithCleanups() {
  let servers = startTestServers.apply(this, arguments)
  cleanUps.push(() => {
    servers.map(s => s.close())
  })
  return servers
}

function runUnitTests(packagePath) {
  const karmaConfigFile = join(PROJECT_DIR, packagePath, 'karma.conf.js')
  runKarma(karmaConfigFile)
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

function runBundleTests() {
  const SPEC_DIR = 'test/bundle'
  runJasmine(SPEC_DIR, err => {
    if (err) {
      console.log('browser bundle tests failed:', err.message)
      process.exit(2)
    }
  })
}

function runE2eTests(configPath) {
  const webDriverConfig = join(PROJECT_DIR, configPath)
  runE2eTestsUtils(webDriverConfig, false)
}

function buildE2eBundles(basePath) {
  return buildE2eBundlesUtils(join(PROJECT_DIR, basePath))
}

function exitHandler(exitCode) {
  if (cleanUps.length > 0) {
    console.log('Running cleanups:', cleanUps.length)
    cleanUps.forEach(f => {
      try {
        f(exitCode)
      } catch (e) {
        console.error(e)
      }
    })
    cleanUps = []
  }
}

process.on('exit', exitHandler)
process.on('SIGINT', exitHandler)

const scripts = {
  generateNotice,
  runUnitTests,
  runE2eTests,
  runIntegrationTests,
  runNodeTests,
  runBundleTests,
  buildE2eBundles,
  startTestServers: startServersWithCleanups
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
