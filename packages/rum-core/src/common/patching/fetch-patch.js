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

import { Promise } from '../polyfills'
import { globalState } from './patch-utils'
import { SCHEDULE, INVOKE, FETCH } from '../constants'
import { scheduleMicroTask } from '../utils'
import { isFetchSupported } from '../http/fetch'

export function patchFetch(callback) {
  if (!isFetchSupported()) {
    return
  }

  function scheduleTask(task) {
    task.state = SCHEDULE
    callback(SCHEDULE, task)
  }

  function invokeTask(task) {
    task.state = INVOKE
    callback(INVOKE, task)
  }

  function handleResponseError(task, error) {
    task.data.aborted = isAbortError(error)
    task.data.error = error
    invokeTask(task)
  }

  function readStream(stream, task) {
    const reader = stream.getReader()
    const read = () => {
      reader.read().then(
        ({ done }) => {
          if (done) {
            invokeTask(task)
          } else {
            read()
          }
        },
        error => {
          handleResponseError(task, error)
        }
      )
    }
    read()
  }

  var nativeFetch = window.fetch
  window.fetch = function (input, init) {
    var fetchSelf = this
    var args = arguments
    var request, url
    var isURL = input instanceof URL
    if (typeof input === 'string' || isURL) {
      request = new Request(input, init)
      if (isURL) {
        url = request.url
      } else {
        // when the input is a string, the url value should be copied from it, rather than from request.url
        // this is important, there are existing users using relative urls when using fetch, which generates a span.name like 'GET /path-example'
        // switching to request.url like we do now with the introduction of URL objects support would start changing existing spans
        // the name would start being something like 'GET http://the-url-of-the-web-page.tld/path-example' which would cause unexpected results in the Kibana side
        url = input
      }
    } else if (input) {
      request = input
      url = request.url
    } else {
      return nativeFetch.apply(fetchSelf, args)
    }

    const task = {
      source: FETCH,
      state: '',
      type: 'macroTask',
      data: {
        target: request,
        method: request.method,
        url,
        aborted: false
      }
    }

    return new Promise(function (resolve, reject) {
      globalState.fetchInProgress = true
      scheduleTask(task)
      var promise
      try {
        promise = nativeFetch.apply(fetchSelf, [request])
      } catch (error) {
        reject(error)
        task.data.error = error
        invokeTask(task)
        globalState.fetchInProgress = false
        return
      }

      promise.then(
        response => {
          let clonedResponse = response.clone ? response.clone() : {}
          resolve(response)
          // invokeTask in the next execution cycle to let the promise resolution complete
          scheduleMicroTask(() => {
            task.data.response = response
            const { body } = clonedResponse
            if (body) {
              readStream(body, task)
            } else {
              invokeTask(task)
            }
          })
        },
        error => {
          reject(error)
          scheduleMicroTask(() => {
            handleResponseError(task, error)
          })
        }
      )
      globalState.fetchInProgress = false
    })
  }
}

function isAbortError(error) {
  return error && error.name === 'AbortError'
}
