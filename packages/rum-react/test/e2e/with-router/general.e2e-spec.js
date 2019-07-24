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

describe('General usecase with react-router', function() {
  it('should run the react app', function() {
    browser.url('/test/e2e/with-router/')
    browser.waitUntil(
      () => {
        return $('#test-element').getText() === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    const serverCalls = waitForApmServerCalls(0, 1)

    expect(serverCalls.sendTransactions.length).toBe(1)

    var transaction = serverCalls.sendTransactions[0].args[0][0]
    expect(transaction.type).toBe('page-load')
    expect(transaction.name).toBe('/home')
    expect(transaction.spans.length).toBeGreaterThan(1)

    const spanNames = [
      'Requesting and receiving the document',
      'Parsing the document, executing sync. scripts',
      'GET /test/e2e/data.json',
      'Render'
    ]
    var foundSpans = transaction.spans.filter(span => {
      return spanNames.indexOf(span.name) > -1
    })

    expect(foundSpans.length).toBeGreaterThanOrEqual(4)

    return allowSomeBrowserErrors()
  })
})
