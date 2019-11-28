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

import {
  XHR_IGNORE,
  XHR_METHOD,
  XHR_URL
} from '../../src/common/patching/patch-utils'

import { scheduleMacroTask } from '../../src/common/utils'
import patchEventHandler from './patch'
import { XMLHTTPREQUEST } from '../../src/common/constants'
import { scheduleTaskCycles } from '../'

function registerEventListener(target) {
  let events = []

  let cancelFn = patchEventHandler.observe(XMLHTTPREQUEST, function(
    event,
    task
  ) {
    if (!target || target === task.data.target) {
      events.push({
        event,
        task
      })
    }
  })

  return done => {
    if (done) {
      cancelFn()
      if (typeof done === 'function') {
        scheduleMacroTask(done)
      }
    }
    return events
  }
}

describe('xhrPatch', function() {
  function mapEvent(event) {
    delete event.task.data.target
    return event
  }

  it('should have correct url and method', function() {
    var req = new window.XMLHttpRequest()
    req.open('GET', '/', true)
    expect(req[XHR_URL]).toBe('/')
    expect(req[XHR_METHOD]).toBe('GET')
  })

  it('should produce events', function(done) {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/', true)
    req.addEventListener('load', function() {
      scheduleTaskCycles(() => {
        expect(getEvents().map(mapEvent)).toEqual([
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
                aborted: false
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
                aborted: false
              }
            }
          }
        ])
        getEvents(done)
      }, 2)
    })

    req.send()
  })

  it('should work with synchronous xhr', function() {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/', false)

    req.send()
    expect(getEvents().map(e => e.event)).toEqual(['schedule', 'invoke'])
  })

  it('should work with failing xhr', function(done) {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/test.json', true)
    req.addEventListener('load', function() {
      scheduleTaskCycles(() => {
        expect(getEvents(done).map(e => e.event)).toEqual([
          'schedule',
          'invoke'
        ])
      }, 2)
    })

    req.send()
  })

  it('should work with aborted xhr', function() {
    var req = new XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/', true)

    req.send()
    req.abort()
    expect(getEvents(true).map(e => e.event)).toEqual(['schedule', 'clear'])
  })

  it('should work properly when send request multiple times on single xmlRequest instance', function(done) {
    const req = new XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('get', '/?multiple1', true)
    req.send()
    req.onload = function() {
      req.onload = null
      req.open('get', '/?multiple2', true)
      req.onload = function() {
        scheduleTaskCycles(() => {
          expect(getEvents(done).map(e => e.event)).toEqual([
            'schedule',
            'schedule',
            'invoke',
            'invoke'
          ])
        }, 2)
      }
      expect(() => {
        req.send()
      }).not.toThrow()
    }
  })

  it('should preserve static constants', function() {
    expect(XMLHttpRequest.UNSENT).toEqual(0)
    expect(XMLHttpRequest.OPENED).toEqual(1)
    expect(XMLHttpRequest.HEADERS_RECEIVED).toEqual(2)
    expect(XMLHttpRequest.LOADING).toEqual(3)
    expect(XMLHttpRequest.DONE).toEqual(4)
  })

  it('should work correctly when abort was called multiple times before request is done', function(done) {
    const req = new XMLHttpRequest()
    req.open('get', '/', true)
    req.send()
    req.addEventListener('readystatechange', function() {
      if (req.readyState >= 2) {
        expect(() => {
          req.abort()
        }).not.toThrow()
        done()
      }
    })
  })

  it('should return null when access ontimeout first time without error', function() {
    let req = new XMLHttpRequest()
    expect(req.ontimeout).toBe(null)
  })

  it('should allow aborting an XMLHttpRequest after its completed', function(done) {
    let req

    req = new XMLHttpRequest()
    req.onreadystatechange = function() {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status !== 0) {
          setTimeout(function() {
            req.abort()
            done()
          }, 0)
        }
      }
    }
    req.open('get', '/', true)

    req.send()
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

  it('should not throw error when get XMLHttpRequest.prototype.onreadystatechange the first time', function() {
    const func = function() {
      const req = new XMLHttpRequest()
      // eslint-disable-next-line
      req.onreadystatechange
    }
    expect(func).not.toThrow()
  })

  it('should not create events and pollute xhr when ignore flag is true', function(done) {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req[XHR_IGNORE] = true
    req.open('GET', '/?ignoretest')
    req.addEventListener('load', function() {
      expect(req[XHR_METHOD]).toBeUndefined()
      expect(req[XHR_URL]).toBeUndefined()
      expect(getEvents(done).map(e => e.event)).toEqual([])
    })

    req.send()
    expect(getEvents().map(e => e.event)).toEqual([])
  })

  it('should consider load events registered on XHR', done => {
    var req = new window.XMLHttpRequest()
    let getEvents = registerEventListener(req)
    req.open('GET', '/?loadtest')

    var earlierEvent = false
    function checkEvents() {
      if (earlierEvent) {
        expect(getEvents().map(e => e.event)).toEqual(['schedule'])

        scheduleTaskCycles(() => {
          expect(getEvents(done).map(e => e.event)).toEqual([
            'schedule',
            'invoke'
          ])
        }, 2)
      } else {
        expect(getEvents().map(e => e.event)).toEqual(['schedule'])
        earlierEvent = true
      }
    }

    req.addEventListener('readystatechange', () => {
      if (req.readyState === req.DONE) {
        checkEvents()
      }
    })
    req.addEventListener('load', function() {
      checkEvents()
    })

    req.send()
    req.addEventListener('load', function() {
      expect(getEvents().map(e => e.event)).toEqual(['schedule'])
    })
    expect(getEvents().map(e => e.event)).toEqual(['schedule'])
  })
})
