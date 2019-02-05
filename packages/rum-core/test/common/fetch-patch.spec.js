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

require('./patch')
const patchSubscription = window['__patchSubscription']
const { globalState } = require('../../src/common/patching/patch-utils')

describe('xhrPatch', function () {
  var events = []
  var cancelFn

  beforeAll(function () {
    cancelFn = patchSubscription.subscribe(function (event, task) {
      events.push({
        event,
        task
      })
    })
  })

  afterAll(function () {
    cancelFn()
  })

  beforeEach(function () {
    events = []
  })

  if (window.fetch) {
    it('should fetch correctly', function (done) {
      var promise = window.fetch('/')
      expect(promise).toBeDefined()
      expect(typeof promise.then).toBe('function')
      expect(events.map(e => e.event)).toEqual(['schedule'])
      promise.then(function (resp) {
        expect(resp).toBeDefined()
        expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
        done()
      })
    })

    it('should handle fetch polyfill errors', function (done) {
      window['__fetchDelegate'] = function () {
        throw new Error('fetch error')
      }

      var promise = window.fetch('/')
      expect(promise).toBeDefined()
      promise.catch(function (error) {
        expect(error).toBeDefined()
        expect(error.message).toContain('fetch error')
        done()
      })
      window['__fetchDelegate'] = undefined
    })

    it('should support native fetch exception', function (done) {
      var promise = window.fetch()
      expect(promise).toBeDefined()
      promise.catch(function (error) {
        // can not check the native error message since it's different in browsers
        expect(error.message).toBeDefined()
        done()
      })
    })

    it('should support native fetch alternative call format', function (done) {
      var promise = window.fetch(new Request('/'))
      expect(promise).toBeDefined()
      promise
        .then(function () {
          done()
        })
        .catch(function (error) {
          fail(error)
        })
    })

    it('should produce task events when fetch fails', function (done) {
      var promise = window.fetch('http://localhost:54321/')
      promise.catch(function (error) {
        expect(error).toBeDefined()
        expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
        done()
      })
    })
    it('should reset fetchInProgress global state', function () {
      expect(globalState.fetchInProgress).toBe(false)
      window.fetch('http://localhost:54321/')
      expect(globalState.fetchInProgress).toBe(false)
    })
  }
})
