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

import { noop } from './utils'

class LoggingService {
  constructor(spec = {}) {
    this.levels = ['trace', 'debug', 'info', 'warn', 'error']
    this.level = spec.level || 'warn'
    this.prefix = spec.prefix || ''

    this.resetLogMethods()
  }

  shouldLog(level) {
    return this.levels.indexOf(level) >= this.levels.indexOf(this.level)
  }

  setLevel(level) {
    if (level === this.level) {
      return
    }
    this.level = level
    this.resetLogMethods()
  }

  resetLogMethods() {
    this.levels.forEach(level => {
      this[level] = this.shouldLog(level) ? log : noop

      function log() {
        let normalizedLevel = level
        if (level === 'trace' || level === 'debug') {
          normalizedLevel = 'info'
        }
        let args = arguments
        args[0] = this.prefix + args[0]
        if (console) {
          const realMethod = console[normalizedLevel] || console.log
          if (typeof realMethod === 'function') {
            realMethod.apply(console, args)
          }
        }
      }
    })
  }
}

export default LoggingService
