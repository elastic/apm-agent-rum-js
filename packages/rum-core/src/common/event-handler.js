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

import { BEFORE_EVENT, AFTER_EVENT } from './constants'

class EventHandler {
  constructor() {
    this.observers = {}
  }

  observe(name, fn) {
    if (typeof fn === 'function') {
      if (!this.observers[name]) {
        this.observers[name] = []
      }
      this.observers[name].push(fn)

      return () => {
        var index = this.observers[name].indexOf(fn)
        if (index > -1) {
          this.observers[name].splice(index, 1)
        }
      }
    }
  }

  sendOnly(name, args) {
    const obs = this.observers[name]
    if (obs) {
      obs.forEach(fn => {
        try {
          fn.apply(undefined, args)
        } catch (error) {
          console.log(error, error.stack)
        }
      })
    }
  }

  send(name, args) {
    this.sendOnly(name + BEFORE_EVENT, args)
    this.sendOnly(name, args)
    this.sendOnly(name + AFTER_EVENT, args)
  }
}

export default EventHandler
