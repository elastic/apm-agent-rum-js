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

import { HTTP_REQUEST_TIMEOUT } from '../constants'
import { isResponseSuccessful } from './response-status'

// keepalive flag tends to limit the payload size to 64 KB
// although this size if set, will be up to the user agent
// in order to be conservative we set a limit a little lower than that
export const BYTE_LIMIT = 60 * 1000

export function shouldUseFetchWithKeepAlive(method, payload) {
  if (!isFetchSupported()) {
    return false
  }

  const isKeepAliveSupported = 'keepalive' in new Request('')
  if (!isKeepAliveSupported) {
    return false
  }

  const size = calculateSize(payload)
  return method === 'POST' && size < BYTE_LIMIT
}

export function sendFetchRequest(
  method,
  url,
  {
    keepalive = false,
    timeout = HTTP_REQUEST_TIMEOUT,
    payload,
    headers,
    sendCredentials
  }
) {
  let timeoutConfig = {}
  if (typeof AbortController === 'function') {
    const controller = new AbortController()
    timeoutConfig.signal = controller.signal
    setTimeout(() => controller.abort(), timeout)
  }

  let fetchResponse
  return window
    .fetch(url, {
      body: payload,
      headers,
      method,
      keepalive, // used to allow the request to outlive the page.
      credentials: sendCredentials ? 'include' : 'omit',
      ...timeoutConfig
    })
    .then(response => {
      fetchResponse = response
      return fetchResponse.text()
    })
    .then(responseText => {
      const bodyResponse = {
        url,
        status: fetchResponse.status,
        responseText
      }

      if (!isResponseSuccessful(fetchResponse.status)) {
        throw bodyResponse
      }

      return bodyResponse
    })
}

export function isFetchSupported() {
  return (
    typeof window.fetch === 'function' && typeof window.Request === 'function'
  )
}

function calculateSize(payload) {
  if (!payload) {
    // IE 11 cannot create Blob from undefined
    return 0
  }

  // If the payload is compressed it is going to be already a Blob
  if (payload instanceof Blob) {
    return payload.size
  }

  return new Blob([payload]).size
}
