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
const TerserPlugin = require('terser-webpack-plugin')
const VuePlugin = require('vue-loader/lib/plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
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

function isProduction(bundleType) {
  const isEnvProduction = [
    NODE_PROD,
    NODE_ESM_PROD,
    BROWSER_PROD,
    BROWSER_ESM_PROD
  ].includes(bundleType)

  return isEnvProduction
}

function getCommonWebpackConfig(bundleType, packageType) {
  const isEnvProduction = isProduction(bundleType)
  const mode = isEnvProduction ? 'production' : 'development'

  return {
    devtool: isEnvProduction ? 'source-map' : 'inline-cheap-module-source-map',
    mode,
    stats: {
      colors: true,
      assets: true,
      modules: false
    },
    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: getBabelConfig(bundleType, packageType)
        }
      ]
    },
    plugins: [new EnvironmentPlugin(getWebpackEnv(mode))],
    ...(isEnvProduction
      ? {
          optimization: {
            minimize: true,
            minimizer: [
              new TerserPlugin({
                sourceMap: true,
                extractComments: true
              })
            ]
          }
        }
      : {})
  }
}

/**
 * Webpack config that are used across Unit, Integration and E2E Tests
 */
function getWebpackConfig(bundleType, packageType) {
  const config = {
    ...getCommonWebpackConfig(bundleType, packageType),
    ...{
      resolve: {
        mainFields: ['source', 'browser', 'module', 'main'],
        extensions: ['.js', '.jsx', '.ts']
      }
    }
  }

  if (packageType === PACKAGE_TYPES.VUE) {
    config.module.rules.push({
      test: /\.vue$/,
      use: 'vue-loader'
    })
    config.plugins.push(new VuePlugin())
    config.resolve.alias = {
      vue$: 'vue/dist/vue.esm.js'
    }
  }
  return config
}

/**
 * Webpack config which handles how the RUM and Opentracing bundles
 * are built for releases
 */
function getWebpackReleaseConfig(bundleType, name) {
  const isEnvProduction = isProduction(bundleType)
  const REPORTS_DIR = join(__dirname, '..', 'packages', 'rum', 'reports')

  const config = {
    ...getCommonWebpackConfig(bundleType),
    node: false
  }

  if (isEnvProduction) {
    /**
     * Warns if the ungzipped bundle size is more than 60 kB
     */
    config.performance = {
      hints: 'warning',
      maxAssetSize: 60 * 1024 // 60 kB
    }
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: join(REPORTS_DIR, `${name}-report.html`),
        generateStatsFile: true,
        statsFilename: join(REPORTS_DIR, `${name}-stats.json`),
        openAnalyzer: false
      })
    )
  }

  return config
}

module.exports = {
  getBabelConfig,
  getWebpackConfig,
  getWebpackReleaseConfig,
  BUNDLE_TYPES,
  PACKAGE_TYPES
}
