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

const { getLastServerCall } = require('../../../../../dev-utils/webdriver')

describe('Using Routes component of react router', function () {
  beforeAll(async () => {
    await browser.url('/test/e2e/with-router/routes.html')
  })

  it('should render the react app on route change', async () => {
    let result = await getLastServerCall(0, 1)
    let [pageLoadTransaction] = result.sendEvents.transactions

    expect(pageLoadTransaction.type).toBe('page-load')
    expect(pageLoadTransaction.name).toBe('/notfound')
    await browser.waitUntil(
      async () => {
        /**
         * Click a link to trigger the rendering of functional componnet
         */
        await $('#functional').click()
        const componentContainer = await $('#func-container')
        return (await componentContainer.getText()).indexOf('/func') !== -1
      },
      5000,
      'expected functional component to be rendered'
    )

    result = await getLastServerCall(0, 1)
    let [routeTransaction] = result.sendEvents.transactions

    expect(routeTransaction.name).toBe('/func')
    expect(routeTransaction.type).toBe('route-change')
    /**
     * Include the fetch call inside useEffect hook
     * and also lazy loaded component's bundle
     */
    const spanTypes = ['resource', 'external']
    const foundSpans = routeTransaction.spans.filter(
      span => spanTypes.indexOf(span.type) > -1
    )
    /**
     * `resource` span type will not be captured if
     * Resource Timing API is not supported.
     */
    expect(foundSpans.length).toBeGreaterThanOrEqual(1)
  })
})
