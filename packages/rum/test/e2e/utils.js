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

function checkDtInfo(payload) {
  console.log('distributed tracing header value', JSON.stringify(payload))
  /**
   * In non supported browsers (like IE 10), `getRandomValues` on the crypto
   * is unsupported, we test the traceparent header to be not present in this case
   */
  const getRandomValues =
    (typeof crypto != 'undefined' &&
      typeof crypto.getRandomValues == 'function') ||
    (typeof msCrypto != 'undefined' &&
      typeof msCrypto.getRandomValues == 'function')

  if (!getRandomValues) {
    if (payload.noHeader !== true) {
      throw new Error(
        'traceparent header should not be present for non-supported browsers'
      )
    }
  } else if (typeof payload.traceId !== 'string') {
    throw new Error('Wrong distributed tracing payload')
  }
}

function renderTestElement() {
  const appEl = document.getElementById('app')
  const testEl = document.createElement('h2')
  testEl.setAttribute('id', 'test-element')
  testEl.innerHTML = 'Passed'
  appEl.appendChild(testEl)
}

function testXHR(backendUrl, callback = () => {}, validateDT = true) {
  const req = new window.XMLHttpRequest()
  req.onerror = err => console.log('[XHR Error]', err)
  req.open('POST', backendUrl + '/data', false)
  req.addEventListener('load', function() {
    if (validateDT) {
      const payload = JSON.parse(req.responseText)
      checkDtInfo(payload)
    }
    callback()
  })

  req.send()
}

function testFetch(backendUrl, callback = () => {}) {
  if ('fetch' in window) {
    fetch(backendUrl + '/fetch', { method: 'POST' }).then(response => {
      response.json().then(function(payload) {
        checkDtInfo(payload)
        callback()
      })
    })
  }
}

export { checkDtInfo, testXHR, testFetch, renderTestElement }
