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

const express = require('express')
const serveIndex = require('serve-index')
const proxy = require('express-http-proxy')
const { join } = require('path')
const { runIntegrationTest } = require('./integration-test')
const { DEFAULT_APM_SERVER_URL } = require('./test-config')

function startBackendAgentServer(port = 8003) {
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

  const server = app.listen(port)

  console.log('[Backend Server] - serving on: ', port)
  return server
}

function startApmServerProxy(port = 8001) {
  const serverUrl = DEFAULT_APM_SERVER_URL

  let proxyApp = express()
  proxyApp.use(
    proxy(serverUrl, {
      userResHeaderDecorator(headers) {
        if (!headers['Access-Control-Allow-Origin']) {
          headers['Access-Control-Allow-Origin'] = '*'
        }
        return headers
      }
    })
  )

  const proxyServer = proxyApp.listen(port)
  console.log(`[APM Server Proxy] - For ${serverUrl} on: ${port}`)
  return proxyServer
}

function startTestServers(path = join(__dirname, '../'), port = 8000) {
  const app = express()
  const staticPath = path

  app.get('/healthcheck', function(req, res) {
    res.send('OK')
  })

  app.get('/run_integration_test', async function(req, res) {
    const echo = req.query.echo
    try {
      const result = await runIntegrationTest(
        `http://localhost:${port}/test/e2e/general-usecase/`
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
  const backendAgentServer = startBackendAgentServer()
  const apmServerProxy = startApmServerProxy()

  return [staticServer, backendAgentServer, apmServerProxy]
}

module.exports = {
  startBackendAgentServer,
  startTestServers
}
