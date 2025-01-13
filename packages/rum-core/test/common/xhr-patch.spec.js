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
import {
  XHR_IGNORE,
  XHR_METHOD,
  XHR_URL,
  XHR_SYNC
} from '../../src/common/patching/patch-utils'
import { XMLHTTPREQUEST } from '../../src/common/constants'

function registerEventListener(target) {
  const events = []

  const cancelFn = patchEventHandler.observe(
    XMLHTTPREQUEST,
    function (event, task) {
      if (!target || target === task.data.target) {
        events.push({
          event,
          task
        })
      }
    }
  )

  return done => {
    if (done) {
      cancelFn()
      if (typeof done === 'function') {
        done()
      }
    }
    return events
  }
}

describe('xhrPatch', function () {
  function mapEvent(event) {
    delete event.task.data.target
    return event
  }

  it('should register symbols for url, sync and method', function () {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    expect(req[XHR_URL]).toBe('/')
    expect(req[XHR_METHOD]).toBe('GET')
    expect(req[XHR_SYNC]).toBe(false)
  })

  it('should produce events', function (done) {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/', true)
    req.addEventListener('load', function () {
      expect(getEvents(done).map(mapEvent)).toEqual([
        {
          event: 'schedule',
          task: {
            source: XMLHTTPREQUEST,
            state: 'invoke',
            type: 'macroTask',
            data: {
              method: 'GET',
              url: '/',
              sync: false,
              status: 'success'
            }
          }
        },
        {
          event: 'invoke',
          task: {
            source: XMLHTTPREQUEST,
            state: 'invoke',
            type: 'macroTask',
            data: {
              method: 'GET',
              url: '/',
              sync: false,
              status: 'success'
            }
          }
        }
      ])
    })

    req.send()
  })

  it('should work with synchronous xhr', function () {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/', false)

    req.send()
    expect(getEvents(true).map(e => e.event)).toEqual(['schedule', 'invoke'])
  })

  it('should schedule events correctly for 404', function (done) {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/test.json', true)
    req.addEventListener('load', () => {
      expect(getEvents(done).map(e => e.event)).toEqual(['schedule', 'invoke'])
    })

    req.send()
  })

  it('should correctly schedule events when sync xhr fails', function () {
    const req = new window.XMLHttpRequest()
    const getEvents = registerEventListener(req)
    try {
      req.open('GET', 'https://localhost:1234/doesnotexist', false)
      req.send()
    } catch (e) {
      expect(
        getEvents(true).map(e => ({
          event: e.event,
          status: e.task.data.status
        }))
      ).toEqual([
        { event: 'schedule', status: 'error' },
        { event: 'invoke', status: 'error' }
      ])
    }
  })

  it('should correctly schedule events when async xhr fails', function (done) {
    const req = new window.XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('GET', 'https://localhost:1234/doesnotexist')

    req.addEventListener('loadend', () => {
      expect(
        getEvents(done).map(e => ({
          event: e.event,
          status: e.task.data.status
        }))
      ).toEqual([
        { event: 'schedule', status: 'error' },
        { event: 'invoke', status: 'error' }
      ])
    })

    req.send()
  })

  it('should work with aborted xhr', function () {
    var req = new XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('GET', '/', true)
    req.send()
    req.abort()

    expect(
      getEvents(true).map(e => ({ event: e.event, status: e.task.data.status }))
    ).toEqual([
      { event: 'schedule', status: 'abort' },
      { event: 'invoke', status: 'abort' }
    ])
  })

  it('should schedule events correctly for CORS requests', function (done) {
    const req = new window.XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('GET', 'https://elastic.co/guide', true)
    req.timeout = 1
    req.addEventListener('loadend', () => {
      expect(getEvents(done).map(e => e.event)).toEqual(['schedule', 'invoke'])
    })
    req.send()
  })

  it('should capture events correctly for timeouts', function (done) {
    const req = new XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('GET', '/timeout', true)
    req.timeout = 1
    req.addEventListener('loadend', () => {
      expect(
        getEvents(done).map(e => ({
          event: e.event,
          status: e.task.data.status
        }))
      ).toEqual([
        { event: 'schedule', status: 'timeout' },
        { event: 'invoke', status: 'timeout' }
      ])
    })
    req.send()
  })

  it('should work properly when send request multiple times on single xmlRequest instance', function (done) {
    const req = new XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('get', '/?multiple1', true)
    req.send()
    req.onload = function () {
      req.onload = null
      req.open('get', '/?multiple2', true)
      req.onload = function () {
        expect(getEvents(done).map(e => e.event)).toEqual([
          'schedule',
          'invoke',
          'schedule',
          'invoke'
        ])
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

  it('should work correctly when abort was called before request is completed', function (done) {
    const req = new XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('get', '/', true)
    req.send()
    req.addEventListener('readystatechange', function () {
      if (req.readyState >= 2) {
        expect(() => {
          req.abort()
        }).not.toThrow()
      }
    })

    req.addEventListener('loadend', () => {
      expect(getEvents(done).map(e => e.event)).toEqual(['schedule', 'invoke'])
    })
  })

  it('should preserve other setters', done => {
    const req = new XMLHttpRequest()
    req.open('get', '/?preserve', true)
    req.addEventListener('load', done)
    req.send()
    try {
      req.responseType = 'document'
      expect(req.responseType).toBe('document')
    } catch (e) {
      // Android browser: using this setter throws, this should be preserved
      expect(e.message).toBe('INVALID_STATE_ERR: DOM Exception 11')
    }
  })

  it('should not create events and pollute xhr when ignore flag is true', function (done) {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req[XHR_IGNORE] = true
    req.open('GET', '/?ignoretest')
    req.addEventListener('load', function () {
      expect(req[XHR_METHOD]).toBeUndefined()
      expect(req[XHR_URL]).toBeUndefined()
      expect(getEvents(done).map(e => e.event)).toEqual([])
    })

    req.send()
    expect(getEvents().map(e => e.event)).toEqual([])
  })

  it('should consider load events registered on XHR', done => {
    const req = new window.XMLHttpRequest()
    const getEvents = registerEventListener(req)
    req.open('GET', '/?loadtest')

    req.send()
    req.addEventListener('load', function () {
      expect(getEvents(done).map(e => e.event)).toEqual(['schedule', 'invoke'])
    })
    expect(getEvents().map(e => e.event)).toEqual(['schedule'])
  })
})
