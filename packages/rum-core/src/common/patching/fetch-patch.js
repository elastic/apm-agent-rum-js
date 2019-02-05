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

const { globalState } = require('./patch-utils')
const { SCHEDULE, INVOKE, FETCH_SOURCE } = require('../constants')

var alreadyPatched = false

function patchFetch (callback) {
  if (alreadyPatched) {
    return
  }
  alreadyPatched = true

  if (!window.fetch || !window.Request) {
    return
  }

  function scheduleTask (task) {
    task.state = SCHEDULE
    callback(SCHEDULE, task)
  }

  function invokeTask (task) {
    task.state = INVOKE
    callback(INVOKE, task)
  }

  var nativeFetch = window.fetch
  window.fetch = function (input, init) {
    var fetchSelf = this
    var args = arguments
    var request, url
    if (typeof input === 'string') {
      request = new Request(input, init)
      url = input
    } else if (input) {
      request = input
      url = request.url
    } else {
      return nativeFetch.apply(fetchSelf, args)
    }

    const task = {
      source: FETCH_SOURCE,
      state: '',
      type: 'macroTask',
      data: {
        target: request,
        method: request.method,
        sync: false,
        url: url,
        args: arguments,
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
        function (response) {
          resolve(response)
          task.data.response = response
          invokeTask(task)
        },
        function (error) {
          reject(error)
          task.data.error = error
          invokeTask(task)
        }
      )
      globalState.fetchInProgress = false
    })
  }
}

module.exports = {
  patchFetch: patchFetch
}
