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

import { createCustomEvent } from '../..'
import {
  createServiceFactory,
  patchEventHandler,
  TRANSACTION_SERVICE
} from '../../../src'
import { HISTORY } from '../../../src/common/constants'
import { observePageClicks } from '../../../src/common/observers'

describe('observePageClicks', () => {
  let serviceFactory
  let transactionService
  let performanceMonitoring
  let unobservePageClicks
  let containerElement

  beforeEach(() => {
    serviceFactory = createServiceFactory()
    transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
    containerElement = document.createElement('div')
    document.body.appendChild(containerElement)
  })

  afterEach(() => {
    document.body.removeChild(containerElement)
    // Remove the added listener since window object is shared among all tests
    unobservePageClicks()
  })

  it('should create user interaction transaction when clicking on DOM element', () => {
    unobservePageClicks = observePageClicks(transactionService)

    let element = document.createElement('button')
    containerElement.appendChild(element)
    element.setAttribute('class', 'cool-button purchase-style')

    element.click()

    let tr = transactionService.getCurrentTransaction()
    expect(tr).toBeDefined()
    expect(tr.name).toBe('Click - button')
    expect(tr.context.custom).toEqual({
      classes: 'cool-button purchase-style'
    })
    expect(tr.type).toBe('user-interaction')

    element.setAttribute('name', 'purchase')
    element.click()
    let newTr = transactionService.getCurrentTransaction()

    expect(newTr).toBe(tr)
    expect(newTr.name).toBe('Click - button["purchase"]')
  })

  it('should not create user interaction transaction when click event corresponds to a non-Element target', () => {
    unobservePageClicks = observePageClicks(transactionService)

    window.dispatchEvent(createCustomEvent('click'))
    let tr = transactionService.getCurrentTransaction()
    expect(tr).toBeUndefined()

    document.dispatchEvent(createCustomEvent('click'))
    tr = transactionService.getCurrentTransaction()
    expect(tr).toBeUndefined()
  })

  it('should respect the transaction type priority order', function () {
    const historySubFn = performanceMonitoring.getHistorySub()
    const cancelHistorySub = patchEventHandler.observe(HISTORY, historySubFn)
    unobservePageClicks = observePageClicks(transactionService)

    let element = document.createElement('button')
    containerElement.appendChild(element)
    element.setAttribute('name', 'purchase')

    const listener = () => {
      let tr = transactionService.getCurrentTransaction()
      expect(tr.type).toBe('user-interaction')
      history.pushState(undefined, undefined, 'test')
    }

    element.addEventListener('click', listener)
    element.click()

    let tr = transactionService.getCurrentTransaction()
    expect(tr.name).toBe('Click - button["purchase"]')
    expect(tr.type).toBe('route-change')

    cancelHistorySub()
  })

  it('should respect the custom transaction name', function () {
    const historySubFn = performanceMonitoring.getHistorySub()
    const cancelHistorySub = patchEventHandler.observe(HISTORY, historySubFn)
    unobservePageClicks = observePageClicks(transactionService)

    let element = document.createElement('button')
    containerElement.appendChild(element)
    element.setAttribute('data-transaction-name', 'purchase-transaction')

    const listener = () => {
      let tr = transactionService.getCurrentTransaction()
      expect(tr.type).toBe('user-interaction')
      history.pushState(undefined, undefined, 'test')
    }

    element.addEventListener('click', listener)
    element.click()

    let tr = transactionService.getCurrentTransaction()
    expect(tr.name).toBe('Click - purchase-transaction')
    expect(tr.type).toBe('route-change')

    cancelHistorySub()
  })
})
