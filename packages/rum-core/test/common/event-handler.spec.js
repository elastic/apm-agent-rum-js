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

import EventHandler from '../../src/common/event-handler'
import { BEFORE_EVENT, AFTER_EVENT } from '../../src/common/constants'

describe('EventHandler', () => {
  it('should observe events', () => {
    var handler = new EventHandler()
    var observer1Spy = jasmine.createSpy('observer1')
    var observer2Spy = jasmine.createSpy('observer2')
    var cancelObserver = handler.observe('test-event-name1', observer1Spy)
    handler.observe('test-event-name2', observer2Spy)

    handler.send('test-event-name1', ['arg1', 2])
    expect(observer1Spy).toHaveBeenCalledWith('arg1', 2)
    expect(observer1Spy).toHaveBeenCalledTimes(1)
    expect(observer2Spy).not.toHaveBeenCalled()
    cancelObserver()
    observer1Spy.calls.reset()
    handler.send('test-event-name1', ['arg1', 2])
    expect(observer1Spy).not.toHaveBeenCalled()
    expect(observer2Spy).not.toHaveBeenCalled()
  })

  it('should consider before and after event modifiers', () => {
    var handler = new EventHandler()
    const eventName = 'test-event-name'
    var events = []

    var observerBeforeSpy = jasmine.createSpy('observer').and.callFake(e => {
      events.push('before-event')
      e.count++
    })
    var observerSpy = jasmine.createSpy('observer').and.callFake(e => {
      events.push('event')
      e.count++
    })

    var observerAfterSpy = jasmine.createSpy('observer').and.callFake(e => {
      events.push('after-event')
      e.count++
    })

    handler.observe(eventName, observerSpy)
    handler.observe(eventName + BEFORE_EVENT, observerBeforeSpy)
    handler.observe(eventName + AFTER_EVENT, observerAfterSpy)

    handler.send(eventName, [{ count: 0 }])
    expect(observerSpy).toHaveBeenCalledWith({ count: 3 })
    expect(events).toEqual(['before-event', 'event', 'after-event'])
  })

  it('should handle errors in an observer', () => {
    spyOn(console, 'log')
    var handler = new EventHandler()
    var observer1Spy = jasmine.createSpy('observer1').and.callFake(() => {
      throw new Error('test error!')
    })
    var observer2Spy = jasmine.createSpy('observer2')
    const eventName = 'test-event-name'
    handler.observe(eventName, observer1Spy)
    handler.observe(eventName, observer2Spy)

    handler.send(eventName)

    expect(observer1Spy).toHaveBeenCalled()
    expect(observer2Spy).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalled()
  })
})
