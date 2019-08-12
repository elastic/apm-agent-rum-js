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
const stats = require('stats-lite')
const { gatherRawMetrics, launchBrowser } = require('./profiler')
const { runs, port, scenarios, elasticApmUrl } = require('./config')
const startServer = require('./server')

const REPORTS_DIR = join(__dirname, '../../reports')

const resultMap = new Map()

function getFromEntries(entries, name, key) {
  entries = JSON.parse(entries)
  return entries
    .filter(entry => entry.name === name)
    .map(entry => entry[key])[0]
}

function getUnit(metricName) {
  let unit = 'ms'
  if (metricName.indexOf('size') >= 0) {
    unit = 'bytes'
  }
  return unit
}

async function analyzeMetrics(metric) {
  const {
    cpu,
    payload,
    navigation,
    measure,
    resource,
    url,
    browser,
    scenario
  } = metric

  const loadTime =
    getFromEntries(navigation, url, 'loadEventEnd') -
    getFromEntries(navigation, url, 'fetchStart')
  const initializationTime = getFromEntries(measure, 'init', 'duration')
  const bundleSize = getFromEntries(resource, elasticApmUrl, 'transferSize')

  /**
   * Analysis of each run
   */
  const analysis = {
    'page-load-time': loadTime,
    'rum-init-time': initializationTime,
    'total-cpu-time': cpu.cpuTime,
    'rum-cpu-time': cpu.cpuTimeFiltered,
    'payload-size': payload.size,
    'bundle-size': bundleSize
  }

  /**
   * Accumulate result of each run in the corresponding scenario
   */
  Object.keys(analysis).forEach(key => {
    const mapKey = `${scenario}-${key}`

    if (!resultMap.has(mapKey)) {
      resultMap.set(mapKey, {
        value: [analysis[key]],
        url,
        browser,
        scenario,
        name: key
      })
    } else {
      resultMap.get(mapKey).value.push(analysis[key])
    }
  })
}

function calculateResults() {
  const results = []
  for (let obj of resultMap.values()) {
    const { name, value, browser, scenario, url } = obj
    const mean = stats.mean(value)
    const p90 = stats.percentile(value, 90)

    results.push({
      scenario,
      name,
      mean,
      browser,
      url,
      p90,
      unit: getUnit(name)
    })
  }

  return results
}

!(async function run() {
  try {
    const server = await startServer()
    const browser = await launchBrowser()

    for (let scenario of scenarios) {
      const url = `http://localhost:${port}/${scenario}`
      const version = await browser.version()
      for (let i = 0; i < runs; i++) {
        const metrics = await gatherRawMetrics(browser, url)
        /**
         * Add common set of metrics for all scenarios
         */
        Object.assign(metrics, {
          url,
          browser: version,
          scenario
        })
        await analyzeMetrics(metrics)
      }
    }

    await browser.close()
    server.close()

    const results = calculateResults()

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
  }
})()
