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
import { createServiceFactory, patchEventHandler } from '../../../src'
import {
  HISTORY,
  TRANSACTION_SERVICE,
  PERFORMANCE_MONITORING
} from '../../../src/common/constants'
import { observePageClicks } from '../../../src/common/observers'
import { describeIf } from '../../../../../dev-utils/jasmine'

describe('observePageClicks', () => {
  let serviceFactory
  let transactionService
  let performanceMonitoring
  let unobservePageClicks
  let containerElement

  beforeEach(() => {
    serviceFactory = createServiceFactory()
    transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    performanceMonitoring = serviceFactory.getService(PERFORMANCE_MONITORING)
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

  describeIf(
    'browsers supporting closest API',
    () => {
      ;[
        {
          name:
            'should use customTransactionName when click target is a <button> child',
          parentTagName: 'button',
          parentCustomTransactionName: 'button-custom-name',
          childCustomTransactionName: 'custom-name-html-child',
          expected: 'Click - button-custom-name'
        },
        {
          name:
            'should use customTransactionName when click target is a <a> child',
          parentTagName: 'a',
          parentCustomTransactionName: 'a-custom-name-html',
          childCustomTransactionName: 'custom-name-html-child',
          expected: 'Click - a-custom-name-html'
        },
        {
          name:
            'should use customTransactionName from child when parent does not have the attribute set',
          parentTagName: 'button',
          parentCustomTransactionName: null,
          childCustomTransactionName: 'custom-name-html-child',
          expected: 'Click - custom-name-html-child'
        },
        {
          name:
            'should not use parent customTransactionName when click target is not child from <button> nor <a>',
          parentTagName: 'div',
          parentCustomTransactionName: 'div-custom-name-html',
          childCustomTransactionName: null,
          expected: 'Click - span'
        },
        {
          name:
            'should use child customTransactionName when click target is not child from <button> nor <a>',
          parentTagName: 'div',
          parentCustomTransactionName: 'div-custom-name-html',
          childCustomTransactionName: 'custom-name-html-child',
          expected: 'Click - custom-name-html-child'
        }
      ].forEach(
        ({
          name,
          parentTagName,
          parentCustomTransactionName,
          childCustomTransactionName,
          expected
        }) => {
          it(`${name}`, () => {
            unobservePageClicks = observePageClicks(transactionService)
            let parentElement = document.createElement(parentTagName)
            let childElement = document.createElement('span')
            if (parentCustomTransactionName) {
              parentElement.setAttribute(
                'data-transaction-name',
                parentCustomTransactionName
              )
            }
            if (childCustomTransactionName) {
              childElement.setAttribute(
                'data-transaction-name',
                childCustomTransactionName
              )
            }
            parentElement.appendChild(childElement)
            containerElement.appendChild(parentElement)
            // The structured represented here is:
            /**
             * <{{parentTagName}} data-transaction-name="{{customTransactionName}}">
             *   <span></span>
             * </{{parentTagName}}>
             */

            // Perform the click on the span - which is the child of the defined {{parentElement}} node
            childElement.click()

            let tr = transactionService.getCurrentTransaction()
            expect(tr.name).toBe(expected)
          })
        }
      )
    },
    document.body.closest
  )
})
