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

import { browser, by, element } from 'protractor'
// import { waitForApmServerCalls } from '../../../../../../dev-utils/webdriver'

describe('Angular router integration', () => {
  it('should run angular app and capture route-change', () => {
    browser.get(browser.baseUrl)
    /**
     * Should render home page on load
     */
    // const notFoundElement = $('app-root app-home h2')
    expect(element(by.css('app-root app-home h2')).getText()).toEqual(
      'Home page'
    )

    // browser.wait(
    //   async () => {
    //     /**
    //      * route to /contacts
    //      */
    //     element(by.css('#contacts')).click()
    //     const contactListElement = await element(by.css('app-root app-contact-list'))
    //     return contactListElement.getText().indexOf('Name') !== -1
    //   },
    //   5000,
    //   'expected contact list to be rendered'
    // )

    // waitForApmServerCalls fails because Angular uses protractor and this was written for webdriver.io
    // const { sendEvents } = waitForApmServerCalls(0, 2)
    // const { transactions } = sendEvents
    // expect(transactions.length).toBe(2)
    //
    // const pageLoadTransaction = transactions[0]
    // expect(pageLoadTransaction.type).toBe('page-load')
    // expect(pageLoadTransaction.name).toBe('/home')
    // expect(pageLoadTransaction.spans.length).toBeGreaterThan(1)
    //
    // const routeTransaction = transactions[1]
    // expect(routeTransaction.name).toBe('/contacts')
    // expect(routeTransaction.type).toBe('route-change')
    // expect(routeTransaction.spans.length).toBe(1)
    // expect(routeTransaction.spans[0].name).toBe('GET /assets/data.json')
  })
})
