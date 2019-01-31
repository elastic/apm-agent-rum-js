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

// dependencies
// npm i --save-dev jasmine karma karma-sauce-launcher karma-failed-reporter karma-jasmine karma-spec-reporter webpack karma-webpack karma-chrome-launcher karma-sourcemap-loader babel-core babel-loader babel-preset-es2015 babel-plugin-istanbul
var baseLaunchers = {
  SL_CHROME: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '62'
  },
  SL_CHROME46: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '46'
  },
  SL_FIREFOX: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '42'
  },
  SL_SAFARI9: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  SL_IE11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  SL_IE10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  SL_EDGE: {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '13'
  },
  'SL_ANDROID4.4': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4'
  },
  SL_ANDROID: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.0'
  },
  SL_IOS9: {
    base: 'SauceLabs',
    deviceName: 'iPhone Simulator',
    deviceOrientation: 'portrait',
    platformVersion: '9.3',
    platformName: 'iOS',
    browserName: 'Safari'
  }
}

var specPattern = 'test/{*.spec.js,!(e2e)/*.spec.js}'

var baseConfig = {
  exclude: ['e2e/**/*.*'],
  files: [specPattern],
  frameworks: ['jasmine'],
  plugins: [
    'karma-sauce-launcher',
    'karma-failed-reporter',
    'karma-jasmine',
    'karma-spec-reporter',
    'karma-webpack',
    'karma-sourcemap-loader'
  ],
  webpack: {
    mode: 'none',
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    ie: '10'
                  },
                  /**
                   * Enabling loose mode due to IE 10 transformation logic in babel
                   * https://github.com/babel/babel/pull/3527
                   */
                  loose: true,
                  useBuiltIns: false
                }
              ]
            ]
          }
        }
      ]
    },
    devtool: 'inline-source-map'
  },
  browserNoActivityTimeout: 120000,
  customLaunchers: baseLaunchers,
  browsers: [],
  captureTimeout: 120000, // on saucelabs it takes some time to capture browser
  reporters: ['spec', 'failed'],
  sauceLabs: {
    testName: 'ApmJs',
    startConnect: false,
    recordVideo: false,
    recordScreenshots: true,
    options: {
      'selenium-version': '2.48.2',
      'command-timeout': 600,
      'idle-timeout': 600,
      'max-duration': 5400
    }
  }
}
function prepareConfig (defaultConfig) {
  defaultConfig.preprocessors = {}
  defaultConfig.preprocessors[specPattern] = ['webpack', 'sourcemap']

  var testConfig = defaultConfig.testConfig || {}
  var isTravis = process.env.TRAVIS
  var isSauce = testConfig.sauceLabs
  var version = '' // userConfig.packageVersion || ''
  var buildId = 'ApmJs@' + version

  if (testConfig.mode) {
    console.log('mode: ' + testConfig.mode)
  }

  if (isTravis) {
    buildId =
      buildId +
      ' - TRAVIS #' +
      process.env.TRAVIS_BUILD_NUMBER +
      ' (' +
      process.env.TRAVIS_BUILD_ID +
      ')'
    // 'karma-chrome-launcher',
    defaultConfig.plugins.push('karma-firefox-launcher')
    defaultConfig.browsers.push('Firefox')
  } else {
    defaultConfig.plugins.push('karma-chrome-launcher')
    defaultConfig.browsers.push('Chrome')

    if (defaultConfig.coverage) {
      // istanbul code coverage
      defaultConfig.plugins.push('karma-coverage')

      var babelPlugins =
        defaultConfig.webpack.module.rules[0].options.plugins ||
        (defaultConfig.webpack.module.rules[0].options.plugins = [])
      babelPlugins.push('istanbul')

      defaultConfig.coverageReporter = {
        includeAllSources: true,
        reporters: [{ type: 'html', dir: 'coverage/' }, { type: 'text-summary' }],
        dir: 'coverage/'
      }
      defaultConfig.reporters.push('coverage')
    }
  }

  if (isSauce) {
    defaultConfig.concurrency = 3
    if (testConfig.branch === 'master') {
      // && process.env.TRAVIS_PULL_REQUEST !== 'false'
      defaultConfig.sauceLabs.build = buildId
      defaultConfig.sauceLabs.tags = ['master']
      console.log('saucelabs.build:', buildId)
    }
    defaultConfig.reporters = ['dots', 'saucelabs']
    defaultConfig.browsers = Object.keys(defaultConfig.customLaunchers)
    defaultConfig.transports = ['polling']
  }

  if (defaultConfig.globalConfigs) {
    var fs = require('fs')
    var dir = './tmp'
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir)
    }

    // console.log('globalConfigs:', defaultConfig.globalConfigs)
    var globalConfigs = defaultConfig.globalConfigs
    fs.writeFileSync(
      dir + '/globals.js',
      'window.globalConfigs = ' + JSON.stringify(globalConfigs) + ';',
      'utf8'
    )
    defaultConfig.files.unshift('tmp/globals.js')
  }
  return defaultConfig
}

var karma = require('karma')
function singleRunKarma (configFile, done) {
  new karma.Server(
    {
      configFile: configFile,
      singleRun: true
    },
    done
  ).start()
}

module.exports = {
  prepareConfig: prepareConfig,
  baseConfig: baseConfig,
  baseLaunchers: baseLaunchers,
  singleRunKarma: singleRunKarma
}
