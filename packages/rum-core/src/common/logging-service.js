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

const { noop } = require('./utils')

class LoggingService {
  constructor (spec) {
    if (!spec) spec = {}
    this.levels = ['trace', 'debug', 'info', 'warn', 'error']
    this.level = spec.level || 'info'
    this.prefix = spec.prefix || ''

    this.resetLogMethods()
  }

  shouldLog (level) {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.level)
  }

  setLevel (level) {
    this.level = level
    this.resetLogMethods()
  }

  resetLogMethods () {
    var loggingService = this
    this.levels.forEach(function (level) {
      loggingService[level] = loggingService.shouldLog(level) ? log : noop

      function log () {
        var prefix = loggingService.prefix
        var normalizedLevel

        switch (level) {
          case 'trace':
            normalizedLevel = 'info'
            break
          case 'debug':
            normalizedLevel = 'info'
            break
          default:
            normalizedLevel = level
        }
        var args = arguments
        if (prefix) {
          if (typeof prefix === 'function') prefix = prefix(level)
          args[0] = prefix + args[0]
        }
        if (console) {
          var realMethod = console[normalizedLevel] ? console[normalizedLevel] : console.log
          if (typeof realMethod === 'function') {
            realMethod.apply(console, args)
          }
        }
      }
    })
  }
}

module.exports = LoggingService
