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
const { EnvironmentPlugin } = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const { getBabelConfig, BUNDLE_TYPES } = require('../../dev-utils/build')

const OUTPUT_DIR = join(__dirname, 'dist', 'bundles')
const SRC_DIR = join(__dirname, 'src')
const REPORTS_DIR = join(__dirname, 'reports')

const devConfig = entry => ({
  entry,
  output: {
    filename: '[name].umd.js',
    path: OUTPUT_DIR,
    library: '[name]',
    libraryTarget: 'umd'
  },
  mode: 'development',
  stats: {
    assets: true,
    modules: false
  },
  node: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: getBabelConfig(BUNDLE_TYPES.BROWSER_DEV)
      }
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'development'
    })
  ]
})

const prodConfig = name => ({
  output: {
    filename: '[name].umd.min.js',
    path: OUTPUT_DIR
  },
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        extractComments: true
      })
    ]
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 65 * 1024 // 65 kB
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'production'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: join(REPORTS_DIR, `${name}-report.html`),
      generateStatsFile: true,
      statsFilename: join(REPORTS_DIR, `${name}-stats.json`),
      openAnalyzer: false
    })
  ]
})

const rumDevConfig = devConfig({
  'elastic-apm-rum': join(SRC_DIR, 'index.js')
})

const rumProdConfig = Object.assign({}, rumDevConfig, prodConfig('apm-rum'))

const rumOpenTracingDevConfig = devConfig({
  'elastic-apm-opentracing': join(SRC_DIR, 'opentracing.js')
})

const rumOpenTracingProdConfig = Object.assign(
  {},
  rumOpenTracingDevConfig,
  prodConfig('apm-opentracing')
)

module.exports = [
  rumDevConfig,
  rumProdConfig,
  rumOpenTracingDevConfig,
  rumOpenTracingProdConfig
]
