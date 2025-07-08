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

const {
  getSauceConnectOptions,
  getBrowserList,
  getGlobalConfig,
  getAppiumBrowsersForKarma
} = require('./test-config')
const { getWebpackConfig, BUNDLE_TYPES } = require('./build')

/**
 * Polyfills file that are required for the browser tests
 *
 * Including here eliminates polyfills required in each test suite
 */
const polyfills = 'test/polyfills.+(js|ts)'

const specPattern =
  'test/{*.spec.+(js|ts),!(e2e|integration|node|bundle|types)/**/*.spec.+(js|ts)}'
const { tunnelIdentifier } = getSauceConnectOptions()

// makes all object properties configurable by default
// which in jasmine is essential to spy on functions exported from modules
const objectConfigurable = '../../dev-utils/object-configurable.js'

/**
 * Common base config for all the mono repo packages
 */
const baseConfig = {
  files: [
    objectConfigurable,
    polyfills,
    require.resolve('regenerator-runtime/runtime'),
    specPattern
  ],
  frameworks: ['jasmine'],
  preprocessors: {
    [specPattern]: ['webpack', 'sourcemap'],
    [polyfills]: ['webpack']
  },
  plugins: [
    'karma-sauce-launcher',
    'karma-jasmine',
    'karma-failed-reporter',
    'karma-spec-reporter',
    'karma-webpack',
    'karma-sourcemap-loader'
  ],
  client: {
    clearContext: false,
    jasmine: {
      random: false,
      failFast: true,
      timeoutInterval: 30000
    }
  },
  webpack: getWebpackConfig(BUNDLE_TYPES.BROWSER_DEV),
  webpackMiddleware: {
    logLevel: 'error'
  },
  autoWatch: false,
  browserNoActivityTimeout: 120000,
  customLaunchers: [...getBrowserList(), ...getAppiumBrowsersForKarma()].map(
    launcher => ({
      ...launcher,
      base: 'SauceLabs'
    })
  ),
  browsers: [],
  captureTimeout: 120000, // on saucelabs it takes some time to capture browser
  reporters: ['spec', 'failed'],
  sauceLabs: {
    testName: 'ApmJs',
    startConnect: false,
    recordVideo: false,
    recordScreenshots: true,
    tunnelIdentifier,
    options: {
      commandTimeout: 600,
      idleTimeout: 600,
      maxDuration: 5400
    }
  }
}

function prepareConfig(config, packageName) {
  const globalConfig = getGlobalConfig(packageName)
  const { agentConfig, testConfig } = globalConfig

  const { isCI, sauceLabs: isSauce } = testConfig
  let buildId = `ApmJs-${agentConfig.name}`

  if (isCI) {
    console.log('prepareConfig: Run in Jenkins')
    buildId =
      buildId +
      ' - Jenkins #' +
      process.env.BUILD_NUMBER +
      ' (' +
      process.env.BRANCH_NAME +
      ') Elastic Stack ' +
      process.env.STACK_VERSION +
      ' Scope ' +
      process.env.SCOPE

    config.plugins.push('karma-chrome-launcher')

    if (!isSauce) {
      config.browsers = ['ChromeHeadlessNoSandbox']
      config.customLaunchers = {
        ChromeHeadlessNoSandbox: {
          base: 'ChromeHeadless',
          flags: [
            '--no-sandbox', // required to run without privileges in docker
            '--user-data-dir=/tmp/chrome-test-profile',
            '--disable-web-security'
          ]
        }
      }
    }
    config.plugins.push('karma-junit-reporter')
    config.reporters.push('junit')
    config.junitReporter = {
      outputDir: 'reports'
    }
  } else {
    console.log('prepareConfig: Run in Default enviroment')
    config.plugins.push('karma-chrome-launcher')
    config.browsers.push('Chrome')
  }

  /**
   *  Add coverage reports and plugins required for all environments
   */
  if (config.coverage) {
    config.plugins.push('karma-coverage', 'karma-coverage-istanbul-reporter')
    config.reporters.push('coverage')
    if (config.webpack) {
      const babelPlugins = config.webpack.module.rules[0].options.plugins
      babelPlugins.push('istanbul')
    }
    config.coverageReporter = {
      includeAllSources: true,
      reporters: [
        { type: 'cobertura', file: 'coverage-' + buildId + '-report.xml' },
        { type: 'lcov' },
        { type: 'text-summary' }
      ],
      dir: 'coverage/'
    }
  }

  if (isSauce) {
    console.log('prepareConfig: Run in SauceLab mode')
    config.sauceLabs.build = buildId
    console.log('saucelabs.build:', buildId)
    if (isCI) {
      config.sauceLabs.tags = [testConfig.branch, process.env.STACK_VERSION]
    } else if (testConfig.branch === 'main') {
      config.sauceLabs.tags = [testConfig.branch]
    }
    config.reporters.push('dots', 'saucelabs')
    config.browsers = Object.keys(config.customLaunchers)
    config.transports = ['polling']
  }

  return config
}

module.exports = {
  prepareConfig,
  baseConfig
}
