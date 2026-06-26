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

const { spawn, execSync } = require('@lerna/child-process')
const glob = require('glob')
const { join } = require('path')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')

const pReadFile = promisify(readFile)
const pWriteFile = promisify(writeFile)
const PKG_DIR = join(__dirname, '../')

async function getAllBenchmarkResults() {
  const results = []
  const files = glob.sync(`${PKG_DIR}/packages/**/reports/*-benchmarks.json`)

  for (let file of files) {
    try {
      const benchmarksFile = await pReadFile(file, 'utf-8')
      const parsedResults = JSON.parse(benchmarksFile)
      const { type, summary } = parsedResults
      const formattedResult = extractFields(summary, type)
      results.push(...formattedResult)
    } catch (err) {
      console.error('Failed to read benchmark from', file, err)
    }
  }
  return results
}

function extractFields(benchResults, type) {
  let keysToFilter = []

  switch (type) {
    case 'benchmarkjs':
      keysToFilter = ['browser', 'suite', 'name', 'hz', 'unit']
      break
    case 'eum':
      keysToFilter = '*'
  }
  const filteredResult = []

  for (let result of benchResults) {
    filteredResult.push(
      Object.keys(result)
        .filter(key => {
          if (keysToFilter === '*') {
            return !!key
          }
          return keysToFilter.includes(key)
        })
        .reduce(
          (obj, key) => ({
            ...obj,
            [key]: result[key]
          }),
          {}
        )
    )
  }

  return filteredResult
}

function runBenchmarks() {
  const outputFile = process.argv[2]
  const lernaProcess = spawn('lerna', ['run', 'bench', '--stream'])
  lernaProcess.on('exit', code => {
    if (code !== 0) {
      process.exit(code)
    }
  })
  lernaProcess.on('close', async () => {
    try {
      const results = await getAllBenchmarkResults()
      if (results.length === 0) {
        console.warn('No benchmarks results found', 'Skipping this run')
        process.exit(1)
      }
      const gitlog = execSync('git', [
        'log',
        '-1',
        '--pretty=%h,%s',
        '--no-merges'
      ])
      const [commit, commitMessage] = gitlog.split(',')
      const branch = execSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'])

      const baseOutput = {
        process: {
          version: process.version,
          arch: process.arch,
          platform: process.platform
        },
        meta: {
          commit,
          commitMessage,
          branch,
          agentName: 'rum-js'
        }
      }

      let resultObj = {}
      for (let result of results) {
        const metricKey = result.name || result.scenario
        const browser = result.browser
        if (!resultObj[metricKey]) {
          resultObj[metricKey] = {}
        }
        resultObj[metricKey][browser] = result
      }

      const output = Object.assign({}, baseOutput, {
        metrics: resultObj,
        '@timestamp': Date.now()
      })

      /**
       * DEV - show the results in the terminal
       * CI - store the results in file and upload to ES
       */
      if (!outputFile) {
        console.log(
          'Benchmark Results:',
          '\n',
          JSON.stringify(output, undefined, 2)
        )
        return
      }

      /**
       * NDJSON format for uploading to ES
       */
      let ndJSONOutput = '{"index": { "_index": "benchmarks-rum-js" }}' + '\n'
      ndJSONOutput += JSON.stringify(output)
      ndJSONOutput += '\n'

      const outputPath = join(PKG_DIR, outputFile)
      await pWriteFile(outputPath, ndJSONOutput)
      console.log('Benchmark results is stored in', outputPath)
    } catch (err) {
      console.error('Error running benchmark script', err)
      process.exit(2)
    }
  })
}

if (require.main === module) {
  runBenchmarks()
}
