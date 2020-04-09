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

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const { baseConfig, prepareConfig } = require('../../dev-utils/karma.js')
// const {
//   getWebpackConfig,
//   PACKAGE_TYPES,
//   BUNDLE_TYPES
// } = require('../../dev-utils/build')

module.exports = function(config) {
  config.set(baseConfig)
  // config.set({
  //   webpack: getWebpackConfig(BUNDLE_TYPES.BROWSER_DEV, PACKAGE_TYPES.ANGULAR)
  // })
  const preparedConfig = prepareConfig(config, 'rum-angular')
  config.set(preparedConfig)
  config.frameworks = config.frameworks.filter(
    framework => framework !== 'karma-webpack'
  )
  config.frameworks.push('@angular-devkit/build-angular')
  config.plugins.push(require('@angular-devkit/build-angular/plugins/karma'))
  config.files = []
  config.preprocessors = {}
  config.preprocessor_priority = {}
  // delete config.buildWebpack
  // delete config.webpack
  delete config.webpack
  delete config.webpackMiddleware
  console.log('CONFIG', config)
}

// Default Karma config from Angular works and all tests pass
// module.exports = function(config) {
//   config.set({
//     basePath: '',
//     frameworks: ['jasmine', '@angular-devkit/build-angular'],
//     plugins: [
//       require('karma-jasmine'),
//       require('karma-chrome-launcher'),
//       require('karma-jasmine-html-reporter'),
//       require('karma-coverage-istanbul-reporter'),
//       require('@angular-devkit/build-angular/plugins/karma')
//     ],
//     client: {
//       clearContext: false // leave Jasmine Spec Runner output visible in browser
//     },
//     coverageIstanbulReporter: {
//       dir: require('path').join(__dirname, 'coverage/rum-angular'),
//       reports: ['html', 'lcovonly', 'text-summary'],
//       fixWebpackSourcePaths: true
//     },
//     reporters: ['progress', 'kjhtml'],
//     port: 9876,
//     colors: true,
//     logLevel: config.LOG_INFO,
//     autoWatch: true,
//     browsers: ['Chrome'],
//     singleRun: false,
//     restartOnFileChange: true
//   })
//   console.log('CONFIG', config)
// }
