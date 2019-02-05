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

const {
  apmSymbol,
  patchMethod,
  XHR_SYNC,
  XHR_URL,
  XHR_METHOD,
  XHR_IGNORE
} = require('./patch-utils')

const {
  SCHEDULE,
  INVOKE,
  CLEAR,
  XMLHTTPREQUEST_SOURCE,
  ADD_EVENT_LISTENER_STR,
  REMOVE_EVENT_LISTENER_STR
} = require('../constants')

const XHR_TASK = apmSymbol('xhrTask')
const XHR_LISTENER = apmSymbol('xhrListener')
const XHR_SCHEDULED = apmSymbol('xhrScheduled')

var alreadyPatched = false
function patchXMLHttpRequest (callback) {
  if (alreadyPatched) {
    return
  }

  alreadyPatched = true

  const XMLHttpRequestPrototype = XMLHttpRequest.prototype

  let oriAddListener = XMLHttpRequestPrototype[ADD_EVENT_LISTENER_STR]
  let oriRemoveListener = XMLHttpRequestPrototype[REMOVE_EVENT_LISTENER_STR]
  if (!oriAddListener) {
    const XMLHttpRequestEventTarget = window['XMLHttpRequestEventTarget']
    if (XMLHttpRequestEventTarget) {
      const XMLHttpRequestEventTargetPrototype = XMLHttpRequestEventTarget.prototype
      oriAddListener = XMLHttpRequestEventTargetPrototype[ADD_EVENT_LISTENER_STR]
      oriRemoveListener = XMLHttpRequestEventTargetPrototype[REMOVE_EVENT_LISTENER_STR]
    }
  }

  const READY_STATE_CHANGE = 'readystatechange'

  function invokeTask (task) {
    task.state = INVOKE
    if (!task.ignore) {
      callback(INVOKE, task)
    }
  }

  function scheduleTask (task) {
    XMLHttpRequest[XHR_SCHEDULED] = false
    task.state = SCHEDULE
    if (!task.ignore) {
      callback(SCHEDULE, task)
    }
    const data = task.data
    const target = data.target
    // remove existing event listener
    const listener = target[XHR_LISTENER]
    if (!oriAddListener) {
      oriAddListener = target[ADD_EVENT_LISTENER_STR]
      oriRemoveListener = target[REMOVE_EVENT_LISTENER_STR]
    }

    if (listener) {
      oriRemoveListener.call(target, READY_STATE_CHANGE, listener)
    }
    const newListener = (target[XHR_LISTENER] = () => {
      if (target.readyState === target.DONE) {
        // sometimes on some browsers XMLHttpRequest will fire onreadystatechange with
        // readyState=4 multiple times, so we need to check task state here
        if (!data.aborted && XMLHttpRequest[XHR_SCHEDULED] && task.state === SCHEDULE) {
          invokeTask(task)
        }
      }
    })

    oriAddListener.call(target, READY_STATE_CHANGE, newListener)

    const storedTask = target[XHR_TASK]
    if (!storedTask) {
      target[XHR_TASK] = task
    }
    var result = sendNative.apply(target, data.args)
    XMLHttpRequest[XHR_SCHEDULED] = true
    return result
  }

  function clearTask (task) {
    task.state = CLEAR
    callback(CLEAR, task)
    const data = task.data
    // Note - ideally, we would call data.target.removeEventListener here, but it's too late
    // to prevent it from firing. So instead, we store info for the event listener.
    data.aborted = true
  }

  const openNative = patchMethod(
    XMLHttpRequestPrototype,
    'open',
    () =>
      function (self, args) {
        self[XHR_METHOD] = args[0]
        self[XHR_URL] = args[1]
        self[XHR_SYNC] = args[2] === false
        return openNative.apply(self, args)
      }
  )

  const sendNative = patchMethod(
    XMLHttpRequestPrototype,
    'send',
    () =>
      function (self, args) {
        const task = {
          source: XMLHTTPREQUEST_SOURCE,
          state: '',
          type: 'macroTask',
          ignore: self[XHR_IGNORE],
          data: {
            target: self,
            method: self[XHR_METHOD],
            sync: self[XHR_SYNC],
            url: self[XHR_URL],
            args: args,
            aborted: false
          }
        }
        var result = scheduleTask(task)

        if (self[XHR_SYNC]) {
          invokeTask(task)
        }
        return result
      }
  )

  const abortNative = patchMethod(
    XMLHttpRequestPrototype,
    'abort',
    () =>
      function (self, args) {
        const task = self[XHR_TASK]
        if (task && typeof task.type === 'string') {
          // If the XHR has already been aborted, do nothing.
          if (task.data && task.data.aborted) {
            return
          }
          clearTask(task)
        }
        return abortNative.apply(self, args)
      }
  )
}

module.exports = {
  patchXMLHttpRequest: patchXMLHttpRequest
}
