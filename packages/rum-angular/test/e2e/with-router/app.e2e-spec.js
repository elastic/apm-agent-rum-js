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

describe('Angular router integration', function () {
  /**
   * Change ELEMENT_KEY to appropriate value when using `devtools`
   * automation protocol
   * https://github.com/webdriverio/webdriverio/blob/e942ce4d802161ac12579553889d9068dccf317c/packages/devtools/src/constants.ts#L8
   */
  const ELEMENT_KEY = 'element-6066-11e4-a52e-4f735466cecf'

  beforeAll(async () => {
    await browser.url('test/e2e/with-router/build/')
  })

  it('should run angular app and capture route-change', async () => {
    /**
     * Should render home page on load
     */
    const result = await browser.findElement(
      'css selector',
      'app-root app-home h2'
    )
    expect(await browser.getElementText(result[ELEMENT_KEY])).toEqual(
      'Home page'
    )

    await browser.waitUntil(
      async () => {
        /**
         * route to /contacts
         */
        const result = await browser.findElement('css selector', '#contacts')
        await browser.elementClick(result[ELEMENT_KEY])
        const listResult = await browser.findElement(
          'css selector',
          'app-root app-contact-list'
        )

        try {
          // In browsers such as Safari 12 the endpoint /session/{session id}/displayed is not longer available
          // Causing an exception and making the test fail.
          // https://developer.apple.com/documentation/webkit/macos_webdriver_commands_for_safari_12_and_later

          const isDisplayed = await browser.isElementDisplayed(
            listResult[ELEMENT_KEY]
          )

          return isDisplayed
        } catch (error) {
          // In browsers where isElementDisplayed is not supported we check if the expected element is available in the dom
          console.log(
            'an error happening trying to verify if element is displayed, checking if exists in the DOM instead'
          )
          return !!listResult[ELEMENT_KEY]
        }
      },
      10000,
      'expected contact list to be available',
      5000
    )

    const { sendEvents } = await waitForApmServerCalls(0, 2)
    const { transactions } = sendEvents
    expect(transactions.length).toBe(2)

    const pageLoadTransaction = transactions[0]
    expect(pageLoadTransaction.type).toBe('page-load')
    expect(pageLoadTransaction.name).toBe('/home')
    expect(pageLoadTransaction.spans.length).toBeGreaterThan(1)

    const routeTransaction = transactions[1]
    expect(routeTransaction.name).toBe('/contacts')
    expect(routeTransaction.type).toBe('route-change')
    expect(routeTransaction.spans.length).toBeGreaterThan(0)
    const extSpans = routeTransaction.spans.filter(
      span => span.type === 'external'
    )
    expect(extSpans[0].name).toBe(
      'GET /test/e2e/with-router/build/assets/data.json'
    )
  })
})
