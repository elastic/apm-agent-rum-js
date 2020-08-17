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
  patchMethod,
  XHR_SYNC,
  XHR_URL,
  XHR_METHOD,
  XHR_IGNORE
} from './patch-utils'
import {
  SCHEDULE,
  INVOKE,
  XMLHTTPREQUEST,
  ADD_EVENT_LISTENER_STR
} from '../constants'

export function patchXMLHttpRequest(callback) {
  const XMLHttpRequestPrototype = XMLHttpRequest.prototype
  /**
   * Handle if the XMLHttpRequest object is patched on the page
   */
  if (
    !XMLHttpRequestPrototype ||
    !XMLHttpRequestPrototype[ADD_EVENT_LISTENER_STR]
  ) {
    return
  }

  const READY_STATE_CHANGE = 'readystatechange'
  const LOAD = 'load'
  const ERROR = 'error'
  const TIMEOUT = 'timeout'
  const ABORT = 'abort'

  function invokeTask(task, status) {
    /**
     * On some browsers XMLHttpRequest will fire onreadystatechange with
     * readyState=4 multiple times, so we need to check task state and
     * not invoke tasks multiple times
     */
    if (task.state !== INVOKE) {
      task.state = INVOKE
      task.data.status = status
      callback(INVOKE, task)
    }
  }

  function scheduleTask(task) {
    if (task.state === SCHEDULE) {
      return
    }
    task.state = SCHEDULE
    callback(SCHEDULE, task)

    const { target } = task.data

    function addListener(name) {
      target[ADD_EVENT_LISTENER_STR](name, ({ type }) => {
        /**
         * Invoke task when the request is completed and when the status is non-zero,
         * denoting the request was aborted, timed out or errored which is handled in
         * else block
         */
        if (type === READY_STATE_CHANGE) {
          if (target.readyState === 4 && target.status !== 0) {
            invokeTask(task, 'success')
          }
        } else {
          const status = type === LOAD ? 'success' : type
          invokeTask(task, status)
        }
      })
    }

    /**
     * Register event listeners for the current request
     * We do not need to clear these listeners are the request object
     * is garbage collected once its done
     */
    addListener(READY_STATE_CHANGE)
    addListener(LOAD)
    addListener(TIMEOUT)
    addListener(ERROR)
    addListener(ABORT)
  }

  const openNative = patchMethod(
    XMLHttpRequestPrototype,
    'open',
    () =>
      function(self, args) {
        if (!self[XHR_IGNORE]) {
          self[XHR_METHOD] = args[0]
          self[XHR_URL] = args[1]
          self[XHR_SYNC] = args[2] === false
        }
        return openNative.apply(self, args)
      }
  )

  const sendNative = patchMethod(
    XMLHttpRequestPrototype,
    'send',
    () =>
      function(self, args) {
        if (self[XHR_IGNORE]) {
          return sendNative.apply(self, args)
        }

        const task = {
          source: XMLHTTPREQUEST,
          state: '',
          type: 'macroTask',
          data: {
            target: self,
            method: self[XHR_METHOD],
            sync: self[XHR_SYNC],
            url: self[XHR_URL],
            status: ''
          }
        }
        try {
          scheduleTask(task)
          return sendNative.apply(self, args)
        } catch (e) {
          /**
           * catch errors from Synchronous XHR when it fails to
           * load the URL or request is aborted
           */
          invokeTask(task, ERROR)
          throw e
        }
      }
  )
}
