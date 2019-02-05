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

/**
 * Bare miniaml URL parser that is not compatible with URL Api
 * in the browser
 *
 * Does not support
 * - URLSearchParams
 * - Unicode chars, Punycode
 *
 * {
 *    hash: '',
 *    host: '',
 *    origin: '',
 *    path: ''
 *    protocol: '',
 *    query: '',
 * }
 *
 * Based on code from url-parser!
 * https://github.com/unshiftio/url-parse/blob/master/index.js
 *
 */

const RULES = [
  ['#', 'hash'],
  ['?', 'query'],
  ['/', 'path'],
  [NaN, 'host', 1] //
]
const PROTOCOL_REGEX = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i

class Url {
  constructor (url) {
    let { protocol, address, slashes } = this.extractProtocol(url || '')
    const relative = !protocol && !slashes
    const location = this.getLocation()
    const instructions = RULES.slice()
    // Sanitize what is left of the address
    address = address.replace('\\', '/')

    let index
    for (let i = 0; i < instructions.length; i++) {
      const instruction = instructions[i]
      const parse = instruction[0]
      const key = instruction[1]

      if (typeof parse === 'string') {
        index = address.indexOf(parse)
        if (~index) {
          this[key] = address.slice(index)
          address = address.slice(0, index)
        }
      } else {
        /** NaN condition */
        this[key] = address
      }
      /**
       * Default values for all keys from location if url is relative
       */
      this[key] = this[key] || (relative && instruction[2] ? location[key] || '' : '')
      /**
       * host should be lowercased so they can be used to
       * create a proper `origin`.
       */
      if (instruction[2]) this[key] = this[key].toLowerCase()
    }

    this.protocol = protocol || location.protocol || ''

    this.origin =
      this.protocol && this.host && this.protocol !== 'file:'
        ? this.protocol + '//' + this.host
        : 'null'
  }

  getLocation () {
    var globalVar = {}
    if (typeof window !== 'undefined') {
      globalVar = window
    }

    return globalVar.location
  }

  extractProtocol (url) {
    const match = PROTOCOL_REGEX.exec(url)
    return {
      protocol: match[1] ? match[1].toLowerCase() : '',
      slashes: !!match[2],
      address: match[3]
    }
  }
}

module.exports = Url
