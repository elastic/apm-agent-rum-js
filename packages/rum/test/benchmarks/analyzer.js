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
const { readFileSync } = require('fs')
const path = require('path')
const zlib = require('zlib')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const {
  getWebpackConfig,
  BUNDLE_TYPES,
  WEBPACK_HASH_FN
} = require('../../../../dev-utils/build')
const { runs, noOfImages } = require('./config')

const dist = path.join(__dirname, '../../dist')

function customApmBuild(filename) {
  /**
   * Match it with the default webpack prod build of elasticApm
   * expect function names are not mangled and source map is not generated
   */
  const config = {
    entry: path.join(__dirname, '../../src/index.js'),
    output: {
      filename,
      path: path.join(dist, 'bundles'),
      library: '[name]',
      libraryTarget: 'umd',
      hashFunction: WEBPACK_HASH_FN
    },
    ...getWebpackConfig(BUNDLE_TYPES.BROWSER_ESM_PROD),
    ...{
      devtool: false,
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            sourceMap: false,
            extractComments: true,
            terserOptions: {
              keep_fnames: true
            }
          })
        ]
      }
    }
  }

  return new Promise((resolve, reject) => {
    webpack(config, err => {
      if (err) {
        reject(err)
      }
      console.info('custom apm build - ', filename, 'generated')
      resolve()
    })
  })
}

function getMinifiedApmBundle(filename) {
  return readFileSync(path.join(dist, 'bundles', filename), 'utf-8')
}

function getApmBundleSize() {
  const content = getMinifiedApmBundle('elastic-apm-rum.umd.min.js')
  /**
   * To match the level with our bundlesize check
   */
  const gzippedContent = zlib.gzipSync(content, {
    level: 9
  })

  return {
    minified: content.length,
    gzip: gzippedContent.length
  }
}

function getCommonFields({ browser, url, scenario }) {
  const { minified, gzip } = getApmBundleSize()
  return {
    scenario,
    browser,
    'parameters.url': url,
    'parameters.runs': runs,
    'parameters.images': scenario === 'heavy' ? noOfImages : 0,
    'bundle-size.minified.bytes': minified,
    'bundle-size.gzip.bytes': gzip
  }
}

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
  const { cpu, payload, navigation, measure, url, scenario, memory } = metric

  const loadTime =
    getFromEntries(navigation, url, 'loadEventEnd') -
    getFromEntries(navigation, url, 'fetchStart')
  const initializationTime = getFromEntries(measure, 'init', 'duration')
  const parseAndExecTime = getFromEntries(
    measure,
    'parse-and-execute',
    'duration'
  )

  /**
   * Analysis of each run
   */
  const analysis = {
    'page-load-time': loadTime,
    'rum-init-time': initializationTime,
    'parse-and-execute-time': parseAndExecTime,
    'total-cpu-time': cpu.cpuTime,
    'rum-cpu-time': cpu.cpuTimeFiltered,
    'payload-size': payload.size,
    memory
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
       * Add consumed memory in bytes per each function to the result
       */
      if (metricName === 'memory') {
        const reducedValue = value.reduce((acc, curr) => {
          acc.push(...curr)
          return acc
        }, [])
        reducedValue.forEach(obj => {
          result[`memory.${obj.name}.bytes`] = obj.size
        })
      } else if (!Array.isArray(value)) {
        /**
         * deal with common data points
         */
        result[metricName] = value
      } else {
        /**
         * Skip if the value inside the array is null
         * which means the metric type is not captured inside the browser
         */
        if (value[0] == null) {
          return
        }
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

function filterCpuMetrics(profile, url) {
  return cpuprofile.filter(profile, {
    files: [url]
  })
}

function getMemoryAllocationPerFunction({ profile }) {
  const allocations = []
  /**
   * exclude Function names from the memory sample
   */
  const excludeFunctionNames = [
    '(V8 API)',
    '(BYTECODE_COMPILER)',
    '__webpack_require__',
    'scriptId'
  ]

  function traverseChild(obj) {
    const { callFrame, selfSize } = obj
    const { functionName } = callFrame

    if (
      selfSize > 0 &&
      functionName !== '' &&
      !excludeFunctionNames.includes(functionName)
    ) {
      allocations.push({
        name: functionName,
        size: selfSize
      })
    }

    if (Array.isArray(obj.children)) {
      obj.children.forEach(child => traverseChild(child))
    }
  }
  /**
   * Build the allocation tree starting from the 'root'
   */
  profile.head.children.forEach(c => {
    traverseChild(c)
  })

  allocations.sort((a, b) => b.size - a.size)

  return allocations
}

module.exports = {
  analyzeMetrics,
  customApmBuild,
  calculateResults,
  filterCpuMetrics,
  getMinifiedApmBundle,
  getApmBundleSize,
  getCommonFields,
  getMemoryAllocationPerFunction
}
