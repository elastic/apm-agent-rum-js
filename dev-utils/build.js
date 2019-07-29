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

const BUNDLE_TYPES = {
  NODE_DEV: 'NODE_DEV',
  NODE_PROD: 'NODE_PROD',
  BROWSER_DEV: 'BROWSER_DEV',
  BROWSER_PROD: 'BROWSER_PROD'
}

const { NODE_DEV, NODE_PROD, BROWSER_DEV, BROWSER_PROD } = BUNDLE_TYPES

const DEFAULT_NODE_PRESET = [
  [
    '@babel/preset-env',
    {
      targets: {
        node: true
      },
      loose: true
    }
  ]
]

const DEFAULT_BROWSER_PRESET = [
  [
    '@babel/preset-env',
    {
      targets: {
        ie: '11'
      },
      modules: false,
      loose: true
    }
  ]
]

const PACKAGE_TYPES = {
  DEFAULT: 'DEFAULT',
  REACT: 'REACT'
}

function getReactConfig(options) {
  return Object.assign({}, options, {
    presets: options.presets.concat(['@babel/react']),
    plugins: options.plugins.concat([
      '@babel/plugin-transform-destructuring',
      '@babel/plugin-syntax-dynamic-import'
    ])
  })
}

function getBabelConfig(bundleType, packageType) {
  let options = {
    comments: false,
    babelrc: false,
    exclude: '/**/node_modules/**',
    presets: [],
    plugins: []
  }
  switch (bundleType) {
    case NODE_DEV:
    case NODE_PROD:
      options = { ...options, presets: DEFAULT_NODE_PRESET }
      if (packageType === PACKAGE_TYPES.REACT) {
        return getReactConfig(options)
      }
      return options
    case BROWSER_DEV:
    case BROWSER_PROD:
      options = { ...options, presets: DEFAULT_BROWSER_PRESET }
      if (packageType === PACKAGE_TYPES.REACT) {
        return getReactConfig(options)
      }
      return options
    default:
      return options
  }
}

module.exports = {
  getBabelConfig,
  BUNDLE_TYPES,
  PACKAGE_TYPES
}
