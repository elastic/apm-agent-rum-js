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
const testUtils = require('elastic-apm-js-core/dev-utils/test')
const { runIntegrationTest } = require('../test/e2e/integration-test')
const projectDirectory = path.join(__dirname, './../')

function runUnitTests (launchSauceConnect) {
  var testConfig = testUtils.getTestEnvironmentVariables()
  testConfig.karmaConfigFile = path.join(__dirname, './../karma.conf.js')
  if (launchSauceConnect !== 'false') {
    return testUtils.runUnitTests(testConfig)
  } else {
    testUtils.runKarma(testConfig.karmaConfigFile)
  }
}

function createBackendAgentServer () {
  const express = require('express')
  const app = express()

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') {
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, elastic-apm-traceparent, Content-Type, Accept'
      )
    }
    next()
  })

  function dTRespond (req, res) {
    var header = req.headers['elastic-apm-traceparent']
    var payload = { noHeader: true }
    if (header) {
      var splited = header.split('-')
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

  var port = 8003
  var server = app.listen(port)

  console.log('serving on: ', port)
  return server
}

function serveE2e (servingPath, port) {
  const express = require('express')
  const serveIndex = require('serve-index')

  const app = express()
  var staticPath = path.join(__dirname, '../', servingPath)

  app.get('/healthcheck', function (req, res) {
    res.send('OK')
  })

  app.get('/run_integration_test', async function (req, res) {
    var echo = req.query.echo
    var result = await runIntegrationTest(
      'http://localhost:8000/test/e2e/general-usecase/'
    )
    if (echo) {
      res.send(echo)
    } else {
      res.send(result)
    }
  })

  app.get('/test-config.js', async function (req, res) {
    var config = require('../test.config')
    var result = `
      window.globalConfigs = ${JSON.stringify(config)}
    `
    res.setHeader('Content-Type', 'text/javascript')
    res.setHeader('Content-Length', Buffer.byteLength(result))
    res.send(result)
  })

  app.use(express.static(staticPath), serveIndex(staticPath, { icons: false }))
  var server = app.listen(port)

  console.log('serving on: ', staticPath, port)
  var backendAgentServer = createBackendAgentServer()
  return [server, backendAgentServer]
}

function runJasmine (cb) {
  var JasmineRunner = require('jasmine')
  var jrunner = new JasmineRunner()

  var specFiles = ['test/node/*.node-spec.js']

  jrunner.configureDefaultReporter({ showColors: true })

  jrunner.onComplete(function (passed) {
    if (!passed) {
      var err = new Error('Jasmine node tests failed.')
      // The stack is not useful in this context.
      err.showStack = false
      cb(err)
    } else {
      cb()
    }
  })
  jrunner.print = function (value) {
    process.stdout.write(value)
  }
  jrunner.addReporter(new JasmineRunner.ConsoleReporter(jrunner))
  jrunner.projectBaseDir = projectDirectory
  jrunner.specDir = ''
  jrunner.addSpecFiles(specFiles)
  jrunner.execute()
}

function runE2eTests (serve) {
  if (serve !== 'false') {
    serveE2e('./', 8000)
  }

  const file = path.join(projectDirectory, 'wdio.conf.js')
  testUtils.runE2eTests(file, false)
}

const scripts = {
  runUnitTests,
  startSelenium: testUtils.startSelenium,
  runE2eTests,
  runNodeTests: function () {
    var servers = serveE2e('./', 8000)
    runJasmine(function (err) {
      servers.forEach(server => server.close())
      if (err) {
        console.log('Node tests failed:', err)
        var exitCode = 2
        process.exit(exitCode)
      }
    })
  },
  buildE2eBundles: function (basePath) {
    basePath = basePath || './test/e2e'
    function callback (err) {
      if (err) {
        var exitCode = 2
        process.exit(exitCode)
      }
    }

    testUtils.buildE2eBundles(path.join(projectDirectory, basePath), callback)
  },
  serveE2e
}

module.exports = scripts

function runScript () {
  var scriptName = process.argv[2]
  if (scriptName) {
    var scriptArgs = [].concat(process.argv)
    scriptArgs.splice(0, 3)
    var message = `Running: ${scriptName}(${scriptArgs
      .map(a => "'" + a + "'")
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
