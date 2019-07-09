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
  allowSomeBrowserErrors,
  waitForApmServerCalls
} = require('../../../../../dev-utils/webdriver')

describe('general-usercase', function() {
  it('should run the general usecase', function() {
    browser.url('/test/e2e/general-usecase/index.html')
    browser.waitUntil(
      () => {
        return $('#test-element').getText() === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    const serverCalls = waitForApmServerCalls(1, 1)

    expect(serverCalls.sendErrors.length).toBe(1)
    var errorPayload = serverCalls.sendErrors[0].args[0][0]
    expect(
      errorPayload.exception.message.indexOf('timeout test error') >= 0
    ).toBeTruthy()

    expect(serverCalls.sendTransactions.length).toBe(1)
    var transactionPayload = serverCalls.sendTransactions[0].args[0][0]
    expect(transactionPayload.marks.agent.domComplete).toBeDefined()
    expect(transactionPayload.type).toBe('page-load')
    expect(transactionPayload.name).toBe('general-usecase-initial-page-load')
    expect(transactionPayload.spans.length).toBeGreaterThan(4)

    /**
     * Check for all XHR, Fetch and Opentracing spans
     */
    const spanNames = [
      'OpenTracing span',
      'GET /test/e2e/common/data.json',
      'POST http://localhost:8003/data',
      'POST http://localhost:8003/fetch'
    ]
    let noOfSpansFound = 0

    transactionPayload.spans.forEach(({ name }) => {
      if (spanNames.indexOf(name) >= 0) {
        noOfSpansFound++
      }
    })

    /**
     * Fetch does not block the page load and its hard to exactly check if
     * fetch span happened before/after the payload, hence we check the span
     * length to be >=3 instead of 4
     */
    expect(noOfSpansFound).toBeGreaterThanOrEqual(3)

    return allowSomeBrowserErrors(['timeout test error with a secret'])
  })

  it('should capture history.pushState', function() {
    /**
     * The query string is only used to make url different to the previous test,
     * Otherwise, both tests will run in the same window.
     */

    browser.url('/test/e2e/general-usecase/index.html?run=pushState#test-state')
    browser.waitUntil(
      () => {
        return $('#test-element').getText() === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    const serverCalls = waitForApmServerCalls(0, 1)
    expect(serverCalls.sendTransactions.length).toBe(1)
    const transactionPayload = serverCalls.sendTransactions[0].args[0][0]
    expect(transactionPayload.name).toBe('Push state title')
    /**
     * The actual spans are tested as part of the previous test.
     */
    expect(transactionPayload.spans.length).toBeGreaterThanOrEqual(3)
  })
})
