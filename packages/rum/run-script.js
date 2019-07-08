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

const path = require('path')
const JasmineRunner = require('jasmine')
const express = require('express')
const serveIndex = require('serve-index')
const testUtils = require('../../dev-utils/test-utils')
const { runIntegrationTest } = require('./test/e2e/integration-test')
const { generateNotice } = require('../../dev-utils/dep-info')

function createBackendAgentServer() {
  const express = require('express')
  const app = express()

  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, elastic-apm-traceparent, Content-Type, Accept'
      )
    }
    next()
  })

  function dTRespond(req, res) {
    const header = req.headers['elastic-apm-traceparent']
    let payload = { noHeader: true }
    if (header) {
      const splited = header.split('-')
      payload = {
        version: splited[0],
        traceId: splited[1],
        parentId: splited[2],
        flags: splited[3]
      }
      console.log('elastic-apm-traceparent:', header)
    }

    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(payload))
  }
  app.post('/data', dTRespond)
  app.post('/fetch', dTRespond)

  const port = 8003
  const server = app.listen(port)

  console.log('[Backend Server] - serving on: ', port)
  return server
}

function serveE2e(servingPath, port) {
  const app = express()
  const staticPath = path.join(__dirname, servingPath)

  app.get('/healthcheck', function(req, res) {
    res.send('OK')
  })

  app.get('/run_integration_test', async function(req, res) {
    const echo = req.query.echo
    try {
      const result = await runIntegrationTest(
        'http://localhost:8000/test/e2e/general-usecase/'
      )
      if (echo) {
        return res.send(echo)
      }
      res.send(result)
    } catch (err) {
      /**
       * This implies a failure in running the Integration test and we
       * return 500 instead of success status code 200
       */
      res.status(500).send(err.message)
    }
  })

  app.use(express.static(staticPath), serveIndex(staticPath, { icons: false }))
  const staticServer = app.listen(port)

  console.log('[Static Server] - serving on: ', staticPath, port)
  const backendAgentServer = createBackendAgentServer()

  return [staticServer, backendAgentServer]
}

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
  const servers = serveE2e('./', 8000)
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
  runNodeTests,
  serveE2e,
  generateNotice
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
