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

import { XHR_IGNORE } from '../patching/patch-utils'
import { isResponseSuccessful } from './response-status'
import { Promise } from '../polyfills'

export function sendXHR(
  method,
  url,
  {
    timeout = HTTP_REQUEST_TIMEOUT,
    payload,
    headers,
    beforeSend,
    sendCredentials
  }
) {
  return new Promise(function (resolve, reject) {
    var xhr = new window.XMLHttpRequest()
    xhr[XHR_IGNORE] = true
    xhr.open(method, url, true)
    xhr.timeout = timeout
    xhr.withCredentials = sendCredentials

    if (headers) {
      for (var header in headers) {
        if (headers.hasOwnProperty(header)) {
          xhr.setRequestHeader(header, headers[header])
        }
      }
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        const { status, responseText } = xhr
        if (isResponseSuccessful(status)) {
          resolve(xhr)
        } else {
          reject({ url, status, responseText })
        }
      }
    }

    xhr.onerror = () => {
      const { status, responseText } = xhr
      reject({ url, status, responseText })
    }

    let canSend = true
    if (typeof beforeSend === 'function') {
      canSend = beforeSend({ url, method, headers, payload, xhr })
    }
    if (canSend) {
      xhr.send(payload)
    } else {
      reject({
        url,
        status: 0,
        responseText: 'Request rejected by user configuration.'
      })
    }
  })
}
