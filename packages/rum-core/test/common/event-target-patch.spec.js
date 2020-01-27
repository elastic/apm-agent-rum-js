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

  if (window.EventTarget) {
    it('should patch addEventListener', () => {
      let count = 0
      let body = document.body
      const listener = e => {
        expect(e.type).toBe('click')
        count++
      }

      body.addEventListener('click', listener)
      body.click()
      body.click()
      expect(count).toBe(2)
      body.removeEventListener('click', listener)
      body.click()
      expect(events.map(e => e.event)).toEqual([
        'schedule',
        'invoke',
        'schedule',
        'invoke'
      ])
      expect(count).toBe(2)
    })
  }
})
