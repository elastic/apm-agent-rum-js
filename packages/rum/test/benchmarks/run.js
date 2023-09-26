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
const { writeFileSync } = require('fs')
const { promisify } = require('util')
const { gatherRawMetrics, launchBrowser } = require('./profiler')
const {
  analyzeMetrics,
  calculateResults,
  getCommonFields,
  customApmBuild
} = require('./analyzer')
const { runs, port, scenarios, browserTypes } = require('./config')
const startServer = require('./server')

const REPORTS_DIR = join(__dirname, '../../reports')

/**
 * catch script errors thrown inside browser process
 */
process.on('unhandledRejection', reason => {
  console.error('Unhandled Promise Rejection', reason)
  process.exit(1)
})

!(async function run() {
  let exitCode = 0
  try {
    /**
     * Generate custom apm build
     */
    const filename = 'apm-rum-with-name.umd.min.js'
    await customApmBuild(filename)

    const server = await startServer(filename)
    const close = promisify(server.close.bind(server))
    /**
     * object cache holding the metrics accumlated in each run and
     * helps in processing the overall results
     */
    const resultMap = new Map()

    for (let scenario of scenarios) {
      for (let type of browserTypes) {
        const url = `http://localhost:${port}/${scenario}`
        /**
         * Add common set of metrics for all scenarios
         */
        const key = `${scenario}.${type}`
        resultMap.set(key, getCommonFields({ browser: type, url, scenario }))
        for (let i = 0; i < runs; i++) {
          console.log('Launching browser ', type)
          const browser = await launchBrowser(type)
          const metrics = await gatherRawMetrics(browser, url)
          Object.assign(metrics, { scenario: key, url })
          await analyzeMetrics(metrics, resultMap)
          await browser.close()
        }
      }
    }
    /**
     * close the server
     */
    await close()

    const results = calculateResults(resultMap)

    console.log(
      '@elastic/apm-rum benchmarks',
      JSON.stringify(results, undefined, 2)
    )

    const filePath = join(REPORTS_DIR, 'rum-benchmarks.json')
    writeFileSync(
      filePath,
      JSON.stringify({
        type: 'eum',
        summary: results
      })
    )

    console.log('RUM benchmark results written to disk', filePath)
  } catch (e) {
    console.error('Error running RUM benchmark script', e)
    exitCode = 1
  } finally {
    process.exit(exitCode)
  }
})()
