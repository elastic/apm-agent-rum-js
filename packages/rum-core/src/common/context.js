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

import { Url } from './url'
import { PAGE_LOAD, NAVIGATION } from './constants'
import { getServerTimingInfo, PERF, isPerfTimelineSupported } from './utils'

const LEFT_SQUARE_BRACKET = 91 // [
const RIGHT_SQUARE_BRACKET = 93 // ]
const EXTERNAL = 'external'
const RESOURCE = 'resource'
const HARD_NAVIGATION = 'hard-navigation'

/**
 * Get the port number including the default ports
 */
function getPortNumber(port, protocol) {
  if (port === '') {
    port = protocol === 'http:' ? '80' : protocol === 'https:' ? '443' : ''
  }
  return port
}

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

function getDestination(parsedUrl, type) {
  const { port, protocol, hostname, host } = parsedUrl

  const portNumber = getPortNumber(port, protocol)

  /**
   * If hostname begins with [ and ends with ] then its an IPV6 address
   *
   * since address and port are recorded separately, we are recording the
   * info in canonical form without square brackets
   *
   * IPv6 check is done here instead of in the URL parser to keep the URL parser
   * functionality minimal and it also makes things easier for service construction
   */
  const ipv6Hostname =
    hostname.charCodeAt(0) === LEFT_SQUARE_BRACKET &&
    hostname.charCodeAt(hostname.length - 1) === RIGHT_SQUARE_BRACKET

  let address = hostname
  if (ipv6Hostname) {
    address = hostname.slice(1, -1)
  }

  return {
    service: {
      name: protocol + '//' + host,
      resource: hostname + ':' + portNumber,
      type
    },
    address,
    port: Number(portNumber)
  }
}

function getResourceContext(data) {
  const { entry, url } = data
  const parsedUrl = new Url(url)

  const destination = getDestination(parsedUrl, RESOURCE)
  return {
    http: {
      url,
      response: getResponseContext(entry)
    },
    destination
  }
}

function getExternalContext(data) {
  const { url, method, target, response } = data
  const parsedUrl = new Url(url)

  const destination = getDestination(parsedUrl, EXTERNAL)

  const context = {
    http: {
      method,
      url: parsedUrl.href
    },
    destination
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

function getNavigationContext(data) {
  const { url } = data
  const parsedUrl = new Url(url)

  const destination = getDestination(parsedUrl, HARD_NAVIGATION)
  return { destination }
}

export function getPageContext() {
  return {
    page: {
      referer: document.referrer,
      url: location.href
    }
  }
}

export function addSpanContext(span, data) {
  if (!data) {
    return
  }
  const { type } = span
  let context
  switch (type) {
    case EXTERNAL:
      context = getExternalContext(data)
      break
    case RESOURCE:
      context = getResourceContext(data)
      break
    case HARD_NAVIGATION:
      context = getNavigationContext(data)
      break
  }
  span.addContext(context)
}

export function addTransactionContext(
  transaction,
  // eslint-disable-next-line no-unused-vars
  { tags, ...configContext } = {}
) {
  const pageContext = getPageContext()
  let responseContext = {}
  if (transaction.type === PAGE_LOAD && isPerfTimelineSupported()) {
    let entries = PERF.getEntriesByType(NAVIGATION)
    if (entries && entries.length > 0) {
      responseContext = {
        response: getResponseContext(entries[0])
      }
    }
  }
  transaction.addContext(pageContext, responseContext, configContext)
}
