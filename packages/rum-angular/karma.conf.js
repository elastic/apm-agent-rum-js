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

const { baseConfig, prepareConfig } = require('../../dev-utils/karma.js')

module.exports = function(config) {
  const { watch, codeCoverage } = config.buildWebpack.options
  const angularConfig = {
    ...baseConfig,
    ...{
      basePath: '',
      files: [],
      /**
       * Disable our custom build system for Angular
       */
      preprocessors: null,
      webpack: null,
      frameworks: [...baseConfig.frameworks, '@angular-devkit/build-angular'],
      plugins: [
        ...baseConfig.plugins,
        require('@angular-devkit/build-angular/plugins/karma')
      ],
      coverage: codeCoverage,
      ...(Boolean(watch)
        ? { autoWatch: true, singleRun: false, restartOnFileChange: true }
        : { singleRun: true })
    }
  }
  config.set(angularConfig)
  config.set(prepareConfig(config, 'rum-angular'))
}
