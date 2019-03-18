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
const runAll = require('npm-run-all')
const testUtils = require('../../dev-utils/test-utils')
const { getSauceConnectOptions } = require('../../dev-utils/test-config')
const { runIntegrationTest } = require('./test/e2e/integration-test')
const { generateNotice } = require('../../dev-utils/dep-info')

const PROJECT_DIR = path.join(__dirname, './')

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

function runJasmine(cb) {
  const specFiles = ['test/node/*.node-spec.js']
  const jrunner = new JasmineRunner({
    projectBaseDir: PROJECT_DIR,
    specDir: ''
  })
  jrunner.onComplete(passed => {
    if (!passed) {
      const err = new Error('Jasmine node tests failed.')
      // The stack is not useful in this context.
      err.stack = ''
      cb(err)
    } else {
      cb()
    }
  })

  jrunner.showColors(true)
  jrunner.addReporter(JasmineRunner.ConsoleReporter(jrunner))
  jrunner.addSpecFiles(specFiles)
  jrunner.execute()
}

function runE2eTests(config) {
  const webDriverConfig = path.join(PROJECT_DIR, config)
  testUtils.runE2eTests(webDriverConfig, false)
}

function runSauceTests(serve = 'true') {
  let servers = []
  if (serve === 'true') {
    servers = serveE2e('./', 8000)
  }
  /**
   * Since there is no easy way to reuse the sauce connect tunnel even using same tunnel identifier,
   * we launch the sauce connect tunnel before starting all the saucelab tests
   *
   * Unit tests are not run in parallel with E2E because of concurrency limit in saucelabs
   */
  const sauceConnectOpts = getSauceConnectOptions()
  testUtils.runSauceConnect(sauceConnectOpts, () => {
    runAll('test:unit', {
      stdout: process.stdout,
      stderr: process.stderr
    })
      .then(() =>
        runAll(['test:e2e:supported', 'test:e2e:failsafe'], {
          parallel: true,
          aggregateOutput: true,
          printLabel: true,
          stdout: process.stdout,
          stderr: process.stderr
        })
      )
      .then(() => {
        console.log('All Unit and E2E Sauce Tests done')
      })
      .catch(err => {
        console.log('Sauce Tests Failed', err)
      })
      .then(() => {
        servers.map(s => s.close())
        process.exit(0)
      })
  })
}

const scripts = {
  startSelenium: testUtils.startSelenium,
  runSauceTests,
  runE2eTests,
  runNodeTests() {
    const servers = serveE2e('./', 8000)
    runJasmine(function(err) {
      servers.forEach(server => server.close())
      if (err) {
        console.log('Node tests failed:', err.message)
        process.exit(2)
      }
    })
  },
  buildE2eBundles(basePath) {
    basePath = basePath || './test/e2e'
    testUtils.buildE2eBundles(path.join(PROJECT_DIR, basePath), err => {
      err && process.exit(2)
    })
  },
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
