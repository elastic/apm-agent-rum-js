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

import Url from './url'
import { PAGE_LOAD } from './constants'
import { getPageMetadata, getServerTimingInfo } from './utils'

/**
 * Both Navigation and Resource timing level 2 exposes these below information
 *
 * for CORS requests without Timing-Allow-Origin header, transferSize & encodedBodySize will be 0
 */
function getResponseContext(perfTimingEntry) {
  const {
    transferSize,
    encodedBodySize,
    decodedBodySize,
    serverTiming
  } = perfTimingEntry

  const respContext = {
    transfer_size: transferSize,
    encoded_body_size: encodedBodySize,
    decoded_body_size: decodedBodySize
  }
  const serverTimingStr = getServerTimingInfo(serverTiming)
  if (serverTimingStr) {
    respContext.headers = {
      'server-timing': serverTimingStr
    }
  }
  return respContext
}

function getResourceContext(data) {
  const { entry, url } = data
  return {
    http: {
      url,
      response: getResponseContext(entry)
    }
  }
}

function getExternalContext(data) {
  const { url, method, target, response } = data
  const parsedUrl = new Url(url)

  const { href, port, protocol, hostname } = parsedUrl
  const isDefaultPort = port === '80' || port === '443'

  const context = {
    http: {
      method,
      url: href
    },
    destination: {
      service: {
        name: !isDefaultPort ? origin : protocol + '//' + hostname,
        resource: hostname + ':' + port,
        type: 'external'
      },
      address: hostname,
      port
    }
  }
  let statusCode
  if (target && typeof target.status !== 'undefined') {
    statusCode = target.status
  } else if (response) {
    statusCode = response.status
  }
  context.http.status_code = statusCode
  return context
}

export function addSpanContext(span, data) {
  if (!data) {
    return
  }
  const { type } = span
  let context
  switch (type) {
    case 'external':
      context = getExternalContext(data)
      break
    case 'resource':
      context = getResourceContext(data)
      break
  }
  span.addContext(context)
}

export function addTransactionContext(transaction, configContext) {
  const pageContext = getPageMetadata()
  let responseContext = {}
  if (
    transaction.type === PAGE_LOAD &&
    typeof performance.getEntriesByType === 'function'
  ) {
    let entries = performance.getEntriesByType('navigation')
    if (entries && entries.length > 0) {
      responseContext = {
        response: getResponseContext(entries[0])
      }
    }
  }
  transaction.addContext(pageContext, responseContext, configContext)
}
