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

const { waitForApmServerCalls } = require('../../../../../dev-utils/webdriver')

describe('Using Switch component of react router', function() {
  beforeAll(() => browser.url('/test/e2e/with-router/switch.html'))

  it('should render the react app on route change', function() {
    browser.waitUntil(
      () => {
        /**
         * Click a link to trigger the rendering of functional componnet
         */
        $('#functional').click()
        const componentContainer = $('#func-container')
        return componentContainer.getText().indexOf('/func') !== -1
      },
      5000,
      'expected functional component to be rendered'
    )

    const serverCalls = waitForApmServerCalls(0, 2)
    expect(serverCalls.sendTransactions.length).toBe(2)

    const pageLoadTransaction = serverCalls.sendTransactions[0].args[0][0]
    expect(pageLoadTransaction.type).toBe('page-load')
    expect(pageLoadTransaction.name).toBe('/notfound')

    const routeTransaction = serverCalls.sendTransactions[1].args[0][0]
    expect(routeTransaction.name).toBe('/func')
    expect(routeTransaction.type).toBe('route-change')
    /**
     * Should include the fetch call inside useEffect hook
     */
    expect(routeTransaction.spans.length).toBe(1)
    expect(routeTransaction.spans[0].name).toBe('GET /test/e2e/data.json')
  })
})
