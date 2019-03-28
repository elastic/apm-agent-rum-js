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
const { version: agentVersion } = require('./package.json')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const OUTPUT_DIR = path.join(__dirname, 'dist', 'bundles')

const baseConfig = {
  entry: {
    'elastic-apm-rum': './src/index.js',
    'elastic-apm-opentracing': './src/opentracing/index.js'
  },
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
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: '%%agent-version%%',
            replace: agentVersion
          }
        }
      }
    ]
  }
}

const optimizeConfig = Object.assign({}, baseConfig, {
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
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(
        __dirname,
        'reports',
        'bundle-analyzer.html'
      ),
      generateStatsFile: true,
      statsFilename: path.resolve(__dirname, 'reports', 'bundle-analyzer.json'),
      openAnalyzer: false
    })
  ]
})

module.exports = [baseConfig, optimizeConfig]
