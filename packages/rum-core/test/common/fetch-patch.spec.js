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

import patchEventHandler from './patch'
import { globalState } from '../../src/common/patching/patch-utils'
import { FETCH } from '../../src/common/constants'

describe('fetchPatch', function () {
  var events = []
  var cancelFn

  beforeAll(function () {
    cancelFn = patchEventHandler.observe(FETCH, function (event, task) {
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
    it('should fetch correctly when response cannot be read from a stream', function (done) {
      let originalCloneFn = window.Response.prototype.clone
      window.Response.prototype.clone = function () {
        return {}
      }

      var promise = window.fetch('/')
      expect(promise).toBeDefined()
      expect(typeof promise.then).toBe('function')
      expect(events.map(e => e.event)).toEqual(['schedule'])
      promise.then(function (resp) {
        expect(resp).toBeDefined()
        Promise.resolve().then(function () {
          expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
          window.Response.prototype.clone = originalCloneFn
          done()
        })
      })
    })

    if (window.ReadableStream) {
      describe('When response can be read from a stream', () => {
        function mockStreamReader(error) {
          let resolveStream
          let rejectStream
          const streamFinished = new Promise((resolve, reject) => {
            resolveStream = resolve
            rejectStream = reject
          })

          spyOn(ReadableStream.prototype, 'getReader').and.callFake(() => {
            let readCounter = 0

            return {
              read: () => {
                if (error) {
                  rejectStream()
                  return Promise.reject(error)
                }
                if (readCounter > 0) {
                  const response = Promise.resolve({
                    value: undefined,
                    done: true
                  })

                  resolveStream()

                  return response
                }

                readCounter += 1
                return Promise.resolve({ value: 'test', done: false })
              }
            }
          })

          return streamFinished
        }

        it('should produce task events when all data have been read', function (done) {
          const streamFinished = mockStreamReader()

          window.fetch('/')
          streamFinished.then(() => {
            Promise.resolve().then(function () {
              expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
              done()
            })
          })
        })

        it('should produce task events when a failure happens while reading', function (done) {
          const streamFinished = mockStreamReader(new Error('test error'))

          window.fetch('/')
          streamFinished.catch(function () {
            Promise.resolve().then(function () {
              expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
              const invokeTask = events[1].task
              expect(invokeTask.data.error).toBeDefined()
              expect(invokeTask.data.aborted).toBe(false)
              done()
            })
          })
        })

        it('should set invoke task as aborted when request aborts while reading', function (done) {
          const error = new Error('AbortError')
          error.name = 'AbortError'
          const streamFinished = mockStreamReader(error)
          window.fetch('/')

          streamFinished.catch(() => {
            Promise.resolve().then(function () {
              expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
              const invokeTask = events[1].task
              expect(invokeTask.data.aborted).toBe(true)
              done()
            })
          })
        })
      })
    }

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
      promise.then(
        () => {
          console.log('Bug in fetch spec', window.navigator.userAgent)
          done()
        },
        error => {
          // can not check the native error message since it's different in browsers
          expect(error.message).toBeDefined()
          done()
        }
      )
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
        Promise.resolve().then(function () {
          expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
          done()
        })
      })
    })

    it('should set invoke task as aborted when fetch request aborts', function (done) {
      const abortController = new AbortController()
      var promise = window.fetch('/', { signal: abortController.signal })
      abortController.abort()

      promise.catch(function (resp) {
        expect(resp).toBeDefined()
        Promise.resolve().then(function () {
          expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
          const invokeTask = events[1].task
          expect(invokeTask.data.aborted).toBe(true)
          done()
        })
      })
    })

    it('should reset fetchInProgress global state', function (done) {
      expect(globalState.fetchInProgress).toBe(false)
      window.fetch('http://localhost:54321/').then(done, () => done())
      expect(globalState.fetchInProgress).toBe(false)
    })
  }
})
