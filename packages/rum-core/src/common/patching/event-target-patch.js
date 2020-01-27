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

export function patchEventTarget(callback) {
  if (!window.EventTarget) {
    return
  }

  let proto = window.EventTarget.prototype
  const nativeAddEventListener = proto[ADD_EVENT_LISTENER_STR]
  const nativeRemoveEventListener = proto[REMOVE_EVENT_LISTENER_STR]

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

  function isCapture(options) {
    let capture
    if (options === undefined) {
      capture = false
    } else if (options === true) {
      capture = true
    } else if (options === false) {
      capture = false
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

    function wrappingFn(event) {
      task.event = event
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

  proto[ADD_EVENT_LISTENER_STR] = function(
    eventType,
    listenerFn,
    optionsOrCapture
  ) {
    if (eventTypes.indexOf(eventType) < 0 || typeof listenerFn !== 'function') {
      return nativeAddEventListener.apply(this, arguments)
    }
    const target = this

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
    if (eventTypes.indexOf(eventType) < 0 || typeof listenerFn !== 'function') {
      return nativeRemoveEventListener.apply(this, arguments)
    }
    const target = this

    const eventSymbol = eventTypeSymbols[eventType]

    let existingTasks = target[eventSymbol]
    let capture = isCapture(optionsOrCapture)
    let args = [...arguments]
    if (existingTasks) {
      let taskIndex = findTaskIndex(
        existingTasks,
        eventType,
        listenerFn,
        capture
      )
      if (taskIndex !== -1) {
        let task = existingTasks[taskIndex]
        args[1] = task.wrappingFn
        existingTasks.splice(taskIndex, 1)
      }
    }
    return nativeRemoveEventListener.apply(target, args)
  }
}
