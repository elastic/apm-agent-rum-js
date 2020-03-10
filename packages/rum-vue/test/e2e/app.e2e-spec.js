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

const { waitForApmServerCalls } = require('../../../../dev-utils/webdriver')

describe('Vue router integration', function() {
  beforeAll(() => browser.url('/test/e2e/'))

  it('should run vue app and capture route-change events', function() {
    browser.waitUntil(
      () => {
        /**
         * route to /fetch
         */
        $('#fetch').click()
        const fetchResult = $('#content')
        return fetchResult.getText().indexOf('loaded data.json') !== -1
      },
      5000,
      'expected data.json to be loaded'
    )

    const { sendEvents } = waitForApmServerCalls(0, 2)
    const { transactions } = sendEvents
    expect(transactions.length).toBe(2)

    const pageLoadTransaction = transactions[0]
    expect(pageLoadTransaction.type).toBe('page-load')
    expect(pageLoadTransaction.name).toBe('/')
    expect(pageLoadTransaction.spans.length).toBeGreaterThan(1)

    const routeTransaction = transactions[1]
    expect(routeTransaction.name).toBe('/fetch')
    expect(routeTransaction.type).toBe('route-change')
    expect(routeTransaction.spans.length).toBe(1)
    expect(routeTransaction.spans[0].name).toBe('GET /test/e2e/data.json')
  })
})
