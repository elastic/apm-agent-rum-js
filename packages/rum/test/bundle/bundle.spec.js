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
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const rimraf = require('rimraf')

const PROJECT_ROOT = join(__dirname, '../../../../')
const BUNDLE_DIST_DIR = join(PROJECT_ROOT, 'tmp', 'bundle-test')

function runWebpack(config, callback) {
  const compiler = webpack(config)
  compiler.run((err, stats) => {
    if (err) {
      callback(err)
    }
    const { errors } = stats.toJson('errors-only')
    if (errors.length > 0) {
      callback(errors)
    } else {
      callback(null)
    }
  })
}

function getConfig(entry) {
  return {
    entry,
    output: {
      path: BUNDLE_DIST_DIR,
      filename: 'bundle.js',
      libraryTarget: 'umd'
    },
    mode: 'none',
    plugins: [new UglifyJSPlugin({})]
  }
}

describe('Browser bundle test', () => {
  afterEach(() => {
    rimraf.sync(BUNDLE_DIST_DIR)
  })

  describe('main version', () => {
    const mainEntry = require.resolve('@elastic/apm-rum/dist/lib/index.js')
    it('not produce any errors when run without babel', done => {
      const config = getConfig(mainEntry)
      return runWebpack(config, error => {
        expect(error).toBe(null)
        done()
      })
    })
  })

  describe('module version', () => {
    const moduleEntry = require.resolve('@elastic/apm-rum/dist/es/index.js')
    it('not produce any errors when run without babel', done => {
      const config = getConfig(moduleEntry)
      return runWebpack(config, error => {
        expect(error).toBe(null)
        done()
      })
    })
  })
})
