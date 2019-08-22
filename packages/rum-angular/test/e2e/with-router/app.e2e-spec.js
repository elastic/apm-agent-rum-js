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

describe('Angular router integration', function() {
  it('should run angular app and capture route-change', function() {
    browser.url('/test/e2e/with-router/')
    browser.waitUntil(
      () => {
        /**
         * Should render not found page
         */
        const notFoundElement = $('app-root h2')
        expect(notFoundElement.getText()).toEqual('page not found')

        /**
         * route to /contacts
         */
        $('#contacts').click()

        const contactListElement = $('app-root app-contact-list')
        expect(contactListElement.getText()).toContain('Name')
      },
      20000,
      'expected contact list to be rendered'
    )

    const serverCalls = waitForApmServerCalls(0, 2)
    expect(serverCalls.sendTransactions.length).toBe(2)

    const pageLoadTransaction = serverCalls.sendTransactions[0].args[0][0]
    expect(pageLoadTransaction.type).toBe('page-load')
    expect(pageLoadTransaction.name).toBe('/')
    expect(pageLoadTransaction.spans.length).toBeGreaterThan(1)

    const routeTransaction = serverCalls.sendTransactions[1].args[0][0]
    expect(routeTransaction.name).toBe('/contacts')
    expect(routeTransaction.type).toBe('route-change')
    expect(routeTransaction.spans.length).toBe(1)
    expect(routeTransaction.spans[0].name).toBe(
      'GET /test/e2e/with-router/data.json'
    )
  })
})
