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

const { getLastServerCall } = require('../../../../dev-utils/webdriver')

describe('Vue router integration', function () {
  beforeAll(async () => {
    await browser.url('/test/e2e/')
  })

  it('should run vue app and capture route-change events', async () => {
    let result = await getLastServerCall(0, 1)
    const [pageLoadTransaction] = result.sendEvents.transactions

    expect(pageLoadTransaction.type).toBe('page-load')
    expect(pageLoadTransaction.name).toBe('/')
    expect(pageLoadTransaction.spans.length).toBeGreaterThan(1)

    await browser.waitUntil(
      async () => {
        /**
         * route to /fetch
         */
        await $('#fetch').click()
        const fetchResult = await $('#content')
        return (await fetchResult.getText()).indexOf('loaded data.json') !== -1
      },
      5000,
      'expected data.json to be loaded'
    )

    result = await getLastServerCall(0, 1)
    const [routeTransaction] = result.sendEvents.transactions

    expect(routeTransaction.name).toBe('/fetch')
    expect(routeTransaction.type).toBe('route-change')
    expect(routeTransaction.spans.length).toBeGreaterThan(0)
    const extSpans = routeTransaction.spans.filter(
      span => span.type === 'external'
    )
    expect(extSpans[0].name).toBe('GET /test/e2e/data.json')
  })
})

describe('Script setup syntax', function () {
  beforeAll(async () => {
    await browser.url('/test/e2e/')
  })

  it('should be supported', async () => {
    await browser.waitUntil(
      async () => {
        /**
         * route to /syntax
         */
        await $('#syntax').click()
        const supportResult = await $('#script-setup-syntax-support')
        return (await supportResult.getText()) === 'true'
      },
      5000,
      'expected script setup syntax to be supported'
    )
  })
})
