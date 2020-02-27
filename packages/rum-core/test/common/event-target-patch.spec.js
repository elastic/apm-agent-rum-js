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
import { EVENT_TARGET } from '../../src/common/constants'
import { createCustomEvent } from '../'
import { describeIf } from '../../../../dev-utils/jasmine'

describe('EventTargetPatch', function() {
  let events = []
  let cancelFn

  beforeAll(function() {
    cancelFn = patchEventHandler.observe(EVENT_TARGET, function(event, task) {
      events.push({
        event,
        task
      })
    })
  })

  afterAll(function() {
    cancelFn()
  })

  beforeEach(function() {
    events = []
  })

  it('should work different argument types', () => {
    let element = document.createElement('div')
    document.body.insertBefore(element, null)
    let eventType = 'click'
    element.addEventListener(eventType, undefined)
    let spy = jasmine.createSpy('spy')
    element.addEventListener(eventType, spy)
    element.click()
    expect(spy).toHaveBeenCalled()
  })

  it('should not affect other event types', () => {
    const eventType = 'apm-test-event'
    let event = createCustomEvent(eventType)

    let count = 0
    let element = document.createElement('div')
    const listener = e => {
      expect(e.type).toBe(eventType)
      count++
    }
    element.addEventListener(eventType, listener)
    element.dispatchEvent(event)
    expect(count).toBe(1)
    expect(events.length).toBe(0)
    element.removeEventListener(eventType, listener)
    element.dispatchEvent(event)
    expect(count).toBe(1)
  })

  describeIf(
    'EventTarget supported',
    () => {
      it('should patch EventTarget', () => {
        let count = 0
        let element = document.createElement('div')
        const listener = e => {
          expect(e.type).toBe('click')
          count++
        }

        element.addEventListener('click', listener)
        element.addEventListener('click', listener, { capture: true })
        element.click()
        expect(count).toBe(2)
        element.removeEventListener('click', listener)
        element.click()
        expect(count).toBe(3)
        element.removeEventListener('click', listener, true)
        element.click()
        expect(events.map(e => e.event)).toEqual([
          'schedule',
          'invoke',
          'schedule',
          'invoke',
          'schedule',
          'invoke'
        ])
        expect(count).toBe(3)
      })

      it('should consider event listener uniqueness condition', () => {
        let count = 0
        let element = document.createElement('div')
        const listener = e => {
          expect(e.type).toBe('click')
          count++
        }

        element.addEventListener('click', listener)
        element.addEventListener('click', listener)
        /**
         * Providing object as the third argument is only support on
         * Chrome Mobile 49 and above therefore we can not
         * pass an object if we want capture to be false
         * since an object will be evaluated as a truthy value.
         */
        element.addEventListener('click', listener, false)

        element.click()
        expect(count).toBe(1)

        element.addEventListener('click', listener, true)
        element.addEventListener('click', listener, { capture: true })

        element.click()
        expect(count).toBe(3)

        element.removeEventListener('click', listener)
        element.removeEventListener('click', listener)
        element.click()
        expect(count).toBe(4)

        element.removeEventListener('click', listener, true)
        element.click()
        expect(count).toBe(4)

        element.removeEventListener('click', listener, true)
        element.click()
        expect(count).toBe(4)
        expect(events.length).toBe(8)
      })

      it('should not instrument non-Element targets', () => {
        let count = 0
        const eventType = 'click'
        const listener = e => {
          expect(e.type).toBe(eventType)
          count++
        }

        let event = createCustomEvent(eventType)
        window.addEventListener(eventType, listener)
        window.dispatchEvent(event)
        expect(count).toBe(1)
        expect(events.length).toBe(0)

        window.addEventListener.apply(undefined, [eventType, listener, true])
        window.dispatchEvent(event)
        expect(count).toBe(3)
        expect(events.length).toBe(0)
      })
    },
    !!window.EventTarget
  )
})
