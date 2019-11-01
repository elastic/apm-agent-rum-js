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

const { EnvironmentPlugin } = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')
const VuePlugin = require('vue-loader/lib/plugin')
const { getTestEnvironmentVariables } = require('./test-config')

const BUNDLE_TYPES = {
  NODE_DEV: 'NODE_DEV',
  NODE_PROD: 'NODE_PROD',
  NODE_ESM_PROD: 'NODE_ESM_PROD',
  BROWSER_DEV: 'BROWSER_DEV',
  BROWSER_PROD: 'BROWSER_PROD',
  BROWSER_ESM_PROD: 'BROWSER_ESM_PROD'
}

const {
  NODE_PROD,
  NODE_ESM_PROD,
  BROWSER_DEV,
  BROWSER_PROD,
  BROWSER_ESM_PROD
} = BUNDLE_TYPES

const PACKAGE_TYPES = {
  DEFAULT: 'DEFAULT',
  REACT: 'REACT',
  ANGULAR: 'ANGULAR',
  VUE: 'VUE'
}

function getBabelPresetEnv(bundleType) {
  const isBrowser = [BROWSER_DEV, BROWSER_PROD, BROWSER_ESM_PROD].includes(
    bundleType
  )
  /**
   * Decides transformation of ES6 module syntax to another module type.
   */
  const shipESModule = [NODE_ESM_PROD, BROWSER_ESM_PROD].includes(bundleType)

  return [
    [
      '@babel/preset-env',
      {
        targets: isBrowser ? { ie: '11' } : { node: true },
        modules: shipESModule ? false : 'auto',
        loose: true
      }
    ]
  ]
}

function getAngularConfig(options) {
  return Object.assign({}, options, {
    presets: options.presets.concat(['@babel/preset-typescript']),
    plugins: options.plugins.concat([
      /**
       * Angular dependency injection will not work
       * if we dont have this plugin enabled
       */
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }]
    ])
  })
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

function getVueConfig(options) {
  return Object.assign({}, options, {
    plugins: options.plugins.concat(['@babel/plugin-syntax-dynamic-import'])
  })
}

function getOptions(options, packageType) {
  if (packageType === PACKAGE_TYPES.REACT) {
    return getReactConfig(options)
  } else if (packageType === PACKAGE_TYPES.ANGULAR) {
    return getAngularConfig(options)
  } else if (packageType === PACKAGE_TYPES.VUE) {
    return getVueConfig(options)
  }
  return options
}

function getBabelConfig(bundleType, packageType) {
  let options = {
    comments: false,
    babelrc: false,
    exclude: '/**/node_modules/**',
    presets: getBabelPresetEnv(bundleType),
    plugins: []
  }

  return getOptions(options, packageType)
}

/**
 * Used for injecting process.env across webpack bundles for testing
 */
function getWebpackEnv(env = 'development') {
  const { serverUrl, stackVersion } = getTestEnvironmentVariables()
  return {
    APM_SERVER_URL: serverUrl,
    STACK_VERSION: stackVersion,
    NODE_ENV: env
  }
}

function getWebpackConfig(bundleType, packageType) {
  const isEnvProduction = [
    NODE_PROD,
    NODE_ESM_PROD,
    BROWSER_PROD,
    BROWSER_ESM_PROD
  ].includes(bundleType)

  const config = {
    stats: {
      colors: true,
      warnings: false
    },
    devtool: isEnvProduction ? 'source-map' : 'cheap-module-source-map',
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: getBabelConfig(bundleType, packageType)
        },
        {
          test: /\.vue$/,
          use: 'vue-loader'
        }
      ]
    },
    mode: isEnvProduction ? 'production' : 'development',
    plugins: [new EnvironmentPlugin(getWebpackEnv())],
    resolve: {
      extensions: ['.js', '.jsx', '.ts']
    }
  }

  if (packageType === PACKAGE_TYPES.VUE) {
    config.plugins.push(new VuePlugin())
    Object.assign(config, {
      resolve: {
        alias: {
          vue$: 'vue/dist/vue.esm.js'
        }
      }
    })
  }

  if (isEnvProduction) {
    return Object.assign({}, config, {
      optimization: {
        minimizer: [
          new UglifyJSPlugin({
            sourceMap: true,
            extractComments: true
          })
        ]
      },
      performance: {
        hints: false
      }
    })
  }

  return config
}

module.exports = {
  getBabelConfig,
  getWebpackConfig,
  BUNDLE_TYPES,
  PACKAGE_TYPES
}
