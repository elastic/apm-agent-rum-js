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

const { XHR_IGNORE, XHR_METHOD, XHR_URL } = require('../../src/common/patching/patch-utils')

var urlSympbol = XHR_URL
var methodSymbol = XHR_METHOD
var xhrIgnore = XHR_IGNORE

var patchSubscription = require('./patch')

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

  function mapEvent (event) {
    delete event.task.data.target
    event.task.data.args = [].slice.call(event.task.data.args)
    return event
  }

  beforeEach(function () {
    events = []
  })
  it('should have correct url and method', function () {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    expect(req[urlSympbol]).toBe('/')
    expect(req[methodSymbol]).toBe('GET')
  })

  it('should produce events', function (done) {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    req.addEventListener('load', function () {
      expect(events.map(mapEvent)).toEqual([
        {
          event: 'schedule',
          task: {
            source: 'XMLHttpRequest.send',
            state: 'invoke',
            type: 'macroTask',
            ignore: undefined,
            data: {
              method: 'GET',
              url: '/',
              sync: false,
              args: [],
              aborted: false
            }
          }
        },
        {
          event: 'invoke',
          task: {
            source: 'XMLHttpRequest.send',
            state: 'invoke',
            type: 'macroTask',
            ignore: undefined,
            data: {
              method: 'GET',
              url: '/',
              sync: false,
              args: [],
              aborted: false
            }
          }
        }
      ])
      done()
    })

    req.send()
  })

  it('should work with synchronous xhr', function (done) {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', false)
    req.addEventListener('load', function () {
      done()
    })

    req.send()
    expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
  })

  it('should work with failing xhr', function (done) {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/test.json', true)
    req.addEventListener('load', function () {
      expect(events.map(e => e.event)).toEqual(['schedule', 'invoke'])
      done()
    })

    req.send()
  })

  it('should work with aborted xhr', function () {
    var req = new XMLHttpRequest()
    req.open('GET', '/', true)

    req.send()
    req.abort()
    expect(events.map(e => e.event)).toEqual(['schedule', 'clear'])
  })

  it('should work properly when send request multiple times on single xmlRequest instance', function (done) {
    const req = new XMLHttpRequest()
    req.open('get', '/', true)
    req.send()
    req.onload = function () {
      req.onload = null
      req.open('get', '/', true)
      req.onload = function () {
        expect(events.map(e => e.event)).toEqual(['schedule', 'invoke', 'schedule', 'invoke'])
        done()
      }
      expect(() => {
        req.send()
      }).not.toThrow()
    }
  })

  it('should preserve static constants', function () {
    expect(XMLHttpRequest.UNSENT).toEqual(0)
    expect(XMLHttpRequest.OPENED).toEqual(1)
    expect(XMLHttpRequest.HEADERS_RECEIVED).toEqual(2)
    expect(XMLHttpRequest.LOADING).toEqual(3)
    expect(XMLHttpRequest.DONE).toEqual(4)
  })

  it('should work correctly when abort was called multiple times before request is done', function (done) {
    const req = new XMLHttpRequest()
    req.open('get', '/', true)
    req.send()
    req.addEventListener('readystatechange', function () {
      if (req.readyState >= 2) {
        expect(() => {
          req.abort()
        }).not.toThrow()
        done()
      }
    })
  })

  it('should return null when access ontimeout first time without error', function () {
    let req = new XMLHttpRequest()
    expect(req.ontimeout).toBe(null)
  })

  it('should allow aborting an XMLHttpRequest after its completed', function (done) {
    let req

    req = new XMLHttpRequest()
    req.onreadystatechange = function () {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status !== 0) {
          setTimeout(function () {
            req.abort()
            done()
          }, 0)
        }
      }
    }
    req.open('get', '/', true)

    req.send()
  })

  it('should preserve other setters', function () {
    const req = new XMLHttpRequest()
    req.open('get', '/', true)
    req.send()
    try {
      req.responseType = 'document'
      expect(req.responseType).toBe('document')
    } catch (e) {
      // Android browser: using this setter throws, this should be preserved
      expect(e.message).toBe('INVALID_STATE_ERR: DOM Exception 11')
    }
  })

  it('should not throw error when get XMLHttpRequest.prototype.onreadystatechange the first time', function () {
    const func = function () {
      const req = new XMLHttpRequest()
      // eslint-disable-next-line
      req.onreadystatechange
    }
    expect(func).not.toThrow()
  })

  it('should consider xhr ignore', function (done) {
    var req = new window.XMLHttpRequest()
    req[xhrIgnore] = true
    req.open('GET', '/')
    req.addEventListener('load', function () {
      done()
    })

    req.send()
    expect(events.map(e => e.event)).toEqual([])
  })
})
