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
const { EnvironmentPlugin } = require('webpack')
const { getWebpackEnv } = require('../../../../../dev-utils/test-config')

module.exports = {
  entry: {
    general: path.join(__dirname, 'general.js'),
    switch: path.join(__dirname, 'switch.js')
  },
  output: {
    path: path.resolve(__dirname),
    filename: '[name].e2e-bundle.js'
  },
  devtool: false,
  mode: 'development',
  performance: {
    hints: false
  },
  module: {
    rules: [
      {
        test: /.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  ie: '11'
                },
                useBuiltIns: false,
                modules: 'umd'
              }
            ],
            ['@babel/preset-react']
          ],
          plugins: ['@babel/plugin-transform-destructuring']
        }
      }
    ]
  },
  plugins: [new EnvironmentPlugin(getWebpackEnv())],
  resolve: {
    extensions: ['.js', '.jsx']
  }
}
