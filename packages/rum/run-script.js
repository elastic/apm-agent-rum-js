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

const JasmineRunner = require('jasmine')
const testUtils = require('../../dev-utils/test-utils')
const { startTestServers } = require('../../dev-utils/test-servers')

function runJasmine(specDir, transform, cb) {
  const jrunner = new JasmineRunner()
  /**
   * Files are relative to spec directory
   */
  jrunner.loadConfig({
    spec_dir: specDir,
    spec_files: ['*.spec.js'],
    helpers: transform ? ['../babel-helper.js'] : []
  })
  jrunner.onComplete(passed => {
    if (!passed) {
      const err = new Error('Jasmine tests failed')
      // The stack is not useful in this context.
      err.stack = ''
      cb(err)
    } else {
      cb()
    }
  })
  jrunner.execute()
}

function runIntegrationTests() {
  const servers = startTestServers('./')
  const SPEC_DIR = 'test/integration'
  runJasmine(SPEC_DIR, true, err => {
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
  runJasmine(SPEC_DIR, false, err => {
    if (err) {
      console.log('Node tests for build failed:', err.message)
      process.exit(2)
    }
  })
}

const scripts = {
  startSelenium: testUtils.startSelenium,
  runIntegrationTests,
  runNodeTests
}

module.exports = scripts

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
