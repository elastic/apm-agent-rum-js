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

const { baseConfig, prepareConfig } = require('../../dev-utils/karma')
const { getGlobalConfig } = require('../../dev-utils/test-config')

module.exports = function(config) {
  config.set(baseConfig)
  const customConfig = getGlobalConfig('rum-core')

  console.log(
    'Custom test bench config:',
    JSON.stringify(customConfig, null, 2)
  )
  config.set(customConfig)
  const specPattern = 'test/**/*.bench.js'
  config.set({
    files: [specPattern],
    frameworks: ['benchmark'],
    reporters: ['benchmark', 'benchmark-json'],
    plugins: [
      'karma-webpack',
      'karma-sourcemap-loader',
      'karma-benchmark',
      'karma-benchmark-reporter',
      'karma-benchmark-json-reporter'
    ],
    preprocessors: {
      specPattern: ['webpack', 'sourcemap']
    },
    benchmarkJsonReporter: {
      pathToJson: 'reports/benchmark-results.json',
      formatOutput(results) {
        const summary = results.map(r => {
          return { name: `${r.suite}.${r.name}`, mean: r.mean, hz: r.hz }
        })
        console.log(JSON.stringify(summary, undefined, 2))
        return { results }
      }
    }
  })
  const cfg = prepareConfig(config)
  cfg.browsers = ['ChromeHeadless']
  config.set(cfg)
}
