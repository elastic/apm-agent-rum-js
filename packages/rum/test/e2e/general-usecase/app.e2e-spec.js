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
  getLastServerCall,
  getBrowserFeatures
} = require('../../../../../dev-utils/webdriver')

describe('general-usercase', function () {
  it('should run the general usecase', async () => {
    await browser.url('/test/e2e/general-usecase/index.html')
    await browser.waitUntil(
      async () => {
        const elem = await $('#test-element')
        return (await elem.getText()) === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    const { sendEvents } = await getLastServerCall(1, 1)
    const { transactions, errors } = sendEvents

    expect(errors.length).toBe(1)
    var errorPayload = errors[0]
    expect(
      errorPayload.exception.message.indexOf('timeout test error') >= 0
    ).toBeTruthy()

    expect(transactions.length).toBe(1)
    var transactionPayload = transactions[0]
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

  it('should capture history.pushState', async () => {
    /**
     * The query string is only used to make url different to the previous test,
     * Otherwise, both tests will run in the same window.
     */

    await browser.url(
      '/test/e2e/general-usecase/index.html?run=pushState#test-state'
    )
    await browser.waitUntil(
      async () => {
        const elem = await $('#test-element')
        return (await elem.getText()) === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    const { sendEvents } = await getLastServerCall(0, 1)
    const { transactions } = sendEvents
    expect(transactions.length).toBe(1)
    const transactionPayload = transactions[0]
    expect(transactionPayload.name).toBe('Push state title')
    /**
     * The actual spans are tested as part of the previous test.
     */
    expect(transactionPayload.spans.length).toBeGreaterThanOrEqual(3)
  })

  it('should capture click user interaction', async () => {
    let features = await getBrowserFeatures()
    if (features.EventTarget) {
      await browser.url('/test/e2e/general-usecase/index.html')
      await browser.waitUntil(
        async () => {
          const elem = await $('#test-element')
          return (await elem.getText()) === 'Passed'
        },
        5000,
        'expected element #test-element'
      )

      let result = await getLastServerCall(0, 1)
      const [pageLoadTransaction] = result.sendEvents.transactions

      expect(pageLoadTransaction.type).toBe('page-load')

      // we should wait until load transaction finishes before
      // triggering the user interaction logic
      const actionButton = await $('#test-action')
      await actionButton.click()

      result = await getLastServerCall(0, 1)
      const [clickTransaction] = result.sendEvents.transactions

      expect(clickTransaction.type).toBe('user-interaction')
      expect(clickTransaction.name).toBe('Click - button["test-action"]')
      expect(clickTransaction.spans.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should capture session', async () => {
    await browser.url('/test/e2e/general-usecase/index.html')
    await browser.waitUntil(
      async () => {
        const elem = await $('#test-element')
        return (await elem.getText()) === 'Passed'
      },
      5000,
      'expected element #test-element'
    )

    const { sendEvents } = await getLastServerCall(0, 1)
    const { transactions } = sendEvents

    expect(transactions.length).toBe(1)
    const transactionPayload = transactions[0]
    expect(transactionPayload.type).toBe('page-load')
    expect(transactionPayload.session.id).toBeDefined()
    expect(transactionPayload.session.sequence).toBeGreaterThan(0)
    expect(transactionPayload.context.tags.session_id).toBeDefined()

    return allowSomeBrowserErrors(['timeout test error with a secret'])
  })
})
