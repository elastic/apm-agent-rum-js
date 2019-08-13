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

const cpuprofile = require('cpuprofile-filter')
const stats = require('stats-lite')
const { elasticApmUrl } = require('./config')

function getFromEntries(entries, name, key) {
  entries = JSON.parse(entries)
  return entries
    .filter(entry => entry.name.indexOf(name) !== -1)
    .map(entry => entry[key])[0]
}

function getUnit(metricName) {
  let unit = 'ms'
  if (metricName.indexOf('size') >= 0) {
    unit = 'bytes'
  } else if (metricName === 'transactions' || metricName === 'spans') {
    unit = 'count'
  }
  return unit
}

async function analyzeMetrics(metric, resultMap) {
  const { cpu, payload, navigation, measure, resource, url, scenario } = metric

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
    transactions: payload.transactions,
    spans: payload.spans,
    'bundle-size': bundleSize
  }

  /**
   * Accumulate result of each run in the corresponding scenario
   */
  Object.keys(analysis).forEach(key => {
    const metricObj = resultMap.get(scenario)
    if (!metricObj[key]) {
      metricObj[key] = []
    }
    metricObj[key].push(analysis[key])
  })
}

function calculateResults(resultMap) {
  const results = []
  for (let metricObj of resultMap.values()) {
    let result = {}
    Object.keys(metricObj).forEach(metricName => {
      const value = metricObj[metricName]
      /**
       * deal with common data points
       */
      if (!Array.isArray(value)) {
        result[metricName] = value
      } else {
        const unit = getUnit(metricName)
        const mean = stats.mean(value)
        const p90 = stats.percentile(value, 90)
        result[`${metricName}.mean.${unit}`] = mean
        result[`${metricName}.p90.${unit}`] = p90
      }
    })
    results.push(result)
  }
  return results
}

function filterCpuMetrics(profile) {
  return cpuprofile.filter(profile, {
    files: [elasticApmUrl]
  })
}

/**
 * APM server payload is in NDJSON format
 */
function getTransactionPaylod(payload) {
  const parsedData = payload.split('\n')
  /**
   * 0 -  Metadata
   * 1 - Transaction
   * 2* - Spans
   */
  const transactionData = parsedData[1]
  return JSON.parse(transactionData)
}

function capturePayloadInfo(payload) {
  const { transaction } = getTransactionPaylod(payload)
  const { started } = transaction.span_count
  /**
   * there will be only one page-load transaction in
   * the test, so hard coding number of transaction to 1
   */
  return {
    transactions: 1,
    spans: started,
    size: payload.length
  }
}

module.exports = {
  analyzeMetrics,
  calculateResults,
  filterCpuMetrics,
  capturePayloadInfo
}
