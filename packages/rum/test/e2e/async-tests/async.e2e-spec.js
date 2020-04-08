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

const { getBrowserInfo } = require('../../../../../dev-utils/webdriver')

describe('async-tests', function() {
  it('should run the usecase', function() {
    browser.url('/test/e2e/async-tests/async-e2e.html')
    browser.waitUntil(
      () => {
        return $('#test-element').getText() === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    /**
     * Payload is set in the EJS template.
     * Its not possible to inject the ApmServerMock for standalone
     * tests as the application code is different from the APM Agent bundle code
     */
    const transactionPayload = browser.execute(function() {
      return window.TRANSACTION_PAYLOAD
    })
    expect(transactionPayload.type).toBe('page-load')
    expect(transactionPayload.name).toBe('/async')
    /**
     * Check for all types of spans that would be captured by
     * loading script async
     */
    const spanTypes = ['hard-navigation', 'external']
    /**
     * Safari does not support Resource & User Timing API
     */
    const { name } = getBrowserInfo()
    if (name.indexOf('safari') === -1) {
      spanTypes.push('resource', 'app')
    }

    const captured = transactionPayload.spans.every(({ type }) => {
      return spanTypes.indexOf(type) !== -1
    })

    expect(captured).toBe(true)
  })
})
