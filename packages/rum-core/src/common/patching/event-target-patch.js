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
  SCHEDULE,
  INVOKE,
  ADD_EVENT_LISTENER_STR,
  REMOVE_EVENT_LISTENER_STR,
  EVENT_TARGET
} from '../constants'
import { apmSymbol } from './patch-utils'

const eventTypes = ['click']
const eventTypeSymbols = {}

for (let i = 0; i < eventTypes.length; i++) {
  const et = eventTypes[i]
  eventTypeSymbols[et] = apmSymbol(et)
}

function shouldInstrumentEvent(target, eventType, listenerFn) {
  return (
    target instanceof Element &&
    eventTypes.indexOf(eventType) >= 0 &&
    typeof listenerFn === 'function'
  )
}

export function patchEventTarget(callback) {
  if (!window.EventTarget) {
    return
  }

  let proto = window.EventTarget.prototype
  const nativeAddEventListener = proto[ADD_EVENT_LISTENER_STR]
  const nativeRemoveEventListener = proto[REMOVE_EVENT_LISTENER_STR]

  /**
   * This function checks whether we have already patched an event listener
   * according to the rules defined in:
   * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
   * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   * In short, the uniqueness of an event listener depends on even type, capture argument
   * and listener function instance. This ensures that no two event listeners that have the same value
   * for these arguments are registered.
   */
  function findTaskIndex(existingTasks, eventType, listenerFn, capture) {
    for (let i = 0; i < existingTasks.length; i++) {
      const task = existingTasks[i]
      if (
        task.eventType === eventType &&
        task.listenerFn === listenerFn &&
        task.capture === capture
      ) {
        return i
      }
    }
    return -1
  }

  /**
   * isCapture unifies the multiple ways 'useCapture'
   * argument can be passed to addEventlistener
   * For more: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  function isCapture(options) {
    let capture
    if (typeof options === 'boolean') {
      capture = options
    } else {
      capture = options ? !!options.capture : false
    }
    return capture
  }

  function createListenerWrapper(target, eventType, listenerFn, options) {
    const eventSymbol = eventTypeSymbols[eventType]

    if (!eventSymbol) return listenerFn

    let existingTasks = target[eventSymbol]

    let capture = isCapture(options)

    if (existingTasks) {
      let taskIndex = findTaskIndex(
        existingTasks,
        eventType,
        listenerFn,
        capture
      )
      if (taskIndex !== -1) {
        let task = existingTasks[taskIndex]
        return task.wrappingFn
      }
    } else {
      existingTasks = target[eventSymbol] = []
    }

    let task = {
      source: EVENT_TARGET,
      target,
      eventType,
      listenerFn,
      capture,
      wrappingFn
    }

    existingTasks.push(task)

    function wrappingFn() {
      callback(SCHEDULE, task)
      let result
      try {
        result = listenerFn.apply(this, arguments)
      } finally {
        callback(INVOKE, task)
      }
      return result
    }

    return wrappingFn
  }

  function getWrappingFn(target, eventType, listenerFn, options) {
    const eventSymbol = eventTypeSymbols[eventType]
    let existingTasks = target[eventSymbol]

    if (existingTasks) {
      let capture = isCapture(options)
      let taskIndex = findTaskIndex(
        existingTasks,
        eventType,
        listenerFn,
        capture
      )
      if (taskIndex !== -1) {
        let task = existingTasks[taskIndex]
        existingTasks.splice(taskIndex, 1)
        if (existingTasks.length === 0) {
          target[eventSymbol] = undefined
        }
        return task.wrappingFn
      }
    }
    return listenerFn
  }

  proto[ADD_EVENT_LISTENER_STR] = function(
    eventType,
    listenerFn,
    optionsOrCapture
  ) {
    const target = this
    if (!shouldInstrumentEvent(target, eventType, listenerFn)) {
      return nativeAddEventListener.apply(target, arguments)
    }

    const wrappingListenerFn = createListenerWrapper(
      target,
      eventType,
      listenerFn,
      optionsOrCapture
    )

    let args = [...arguments]
    args[1] = wrappingListenerFn

    return nativeAddEventListener.apply(target, args)
  }

  proto[REMOVE_EVENT_LISTENER_STR] = function(
    eventType,
    listenerFn,
    optionsOrCapture
  ) {
    const target = this
    if (!shouldInstrumentEvent(target, eventType, listenerFn)) {
      return nativeRemoveEventListener.apply(target, arguments)
    }

    let wrappingFn = getWrappingFn(
      target,
      eventType,
      listenerFn,
      optionsOrCapture
    )

    let args = [...arguments]
    args[1] = wrappingFn
    return nativeRemoveEventListener.apply(target, args)
  }
}
