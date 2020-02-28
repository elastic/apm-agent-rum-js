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

class Queue {
  constructor(onFlush, opts = {}) {
    this.onFlush = onFlush
    this.items = []
    this.queueLimit = opts.queueLimit || -1
    this.flushInterval = opts.flushInterval || 0
    this.timeoutId = undefined
  }

  _setTimer() {
    this.timeoutId = setTimeout(() => this.flush(), this.flushInterval)
  }

  _clear() {
    if (typeof this.timeoutId !== 'undefined') {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }
    this.items = []
  }

  flush() {
    this.onFlush(this.items)
    this._clear()
  }

  add(item) {
    this.items.push(item)
    if (this.queueLimit !== -1 && this.items.length >= this.queueLimit) {
      this.flush()
    } else {
      if (typeof this.timeoutId === 'undefined') {
        this._setTimer()
      }
    }
  }
}

export default Queue
