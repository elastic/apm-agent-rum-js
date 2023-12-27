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

import { observePageVisibility } from '../../../src/common/observers'
import { createServiceFactory } from '../../../src'
import { state } from '../../../src/state'
import {
  QUEUE_FLUSH,
  TRANSACTION_SERVICE,
  CONFIG_SERVICE,
  PERFORMANCE_MONITORING,
  TEMPORARY_TYPE
} from '../../../src/common/constants'
import * as utils from '../../../src/common/utils'
import {
  hidePageSynthetically,
  dispatchBrowserEvent,
  setDocumentVisibilityState
} from '../..'
import { spyOnFunction, waitFor } from '../../../../../dev-utils/jasmine'
import * as inpReporter from '../../../src/performance-monitoring/metrics/inp/report'
import * as inpProcessor from '../../../src/performance-monitoring/metrics/inp/process'

describe('observePageVisibility', () => {
  // Starts performanceMonitoring to observe how transaction ends
  function startsPerformanceMonitoring() {
    const performanceMonitoring = serviceFactory.getService(
      PERFORMANCE_MONITORING
    )
    performanceMonitoring.init()
  }

  let serviceFactory
  let configService
  let transactionService
  let unobservePageVisibility
  let originalLastHiddenStart

  beforeEach(() => {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService(CONFIG_SERVICE)
    transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    setDocumentVisibilityState('visible') // default value for the tests
  })

  afterEach(() => {
    // Since the flow page visibility mutates the global state
    // it should be restored
    state.lastHiddenStart = originalLastHiddenStart

    // Remove the added listener since window object is shared among all tests
    unobservePageVisibility()
  })

  it('should reset lastHiddenStart if document is hidden', () => {
    setDocumentVisibilityState('hidden')
    const anyTime = 1234567810
    state.lastHiddenStart = anyTime

    unobservePageVisibility = observePageVisibility(
      configService,
      transactionService
    )

    expect(state.lastHiddenStart).toBe(0)
  })

  it('should not reset lastHiddenStart if document is visible', () => {
    const anyTime = 1234567811
    // Set an arbitrary value
    state.lastHiddenStart = anyTime

    unobservePageVisibility = observePageVisibility(
      configService,
      transactionService
    )

    expect(state.lastHiddenStart).toBe(anyTime)
  })

  // the observed events by the agent...
  ;['visibilitychange', 'pagehide'].forEach(eventName => {
    describe(`when page becomes hidden due to ${eventName.toUpperCase()} event`, () => {
      it('should report INP', async () => {
        // Arrange
        const dispatchEventSpy = spyOn(
          configService,
          'dispatchEvent'
        ).and.callThrough()
        const reportSpy = spyOnFunction(
          inpReporter,
          'reportInp'
        ).and.callThrough()
        const calculateInpSpy = spyOnFunction(inpProcessor, 'calculateInp')
        calculateInpSpy.and.returnValue(100) // makes sure the inp transaction is created
        unobservePageVisibility = observePageVisibility(
          configService,
          transactionService
        )
        startsPerformanceMonitoring()

        // Act
        hidePageSynthetically(eventName)
        await waitFor(() => dispatchEventSpy.calls.any())

        // Assert
        expect(reportSpy).toHaveBeenCalledTimes(1)
        expect(reportSpy).toHaveBeenCalledWith(transactionService)
        expect(dispatchEventSpy).toHaveBeenCalledWith(QUEUE_FLUSH)
      })

      describe('with every transaction already ended', () => {
        it('should dispatch the QUEUE_FLUSH event', () => {
          const dispatchEventSpy = spyOn(configService, 'dispatchEvent')

          unobservePageVisibility = observePageVisibility(
            configService,
            transactionService
          )
          hidePageSynthetically(eventName)

          expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
          expect(dispatchEventSpy).toHaveBeenCalledWith(QUEUE_FLUSH)
        })

        it('should set lastHiddenStart', () => {
          const anyTime = 1234567834
          spyOnFunction(utils, 'now').and.returnValue(anyTime)

          unobservePageVisibility = observePageVisibility(
            configService,
            transactionService
          )
          hidePageSynthetically(eventName)

          expect(state.lastHiddenStart).toBe(anyTime)
        })
      })

      describe('with a transaction that has not ended yet', () => {
        function createTransaction() {
          const transaction = transactionService.startTransaction(
            'test-tr',
            'test-type'
          )

          let span = transaction.startSpan('test span', 'test span type', {
            startTime: 0
          })
          span.end(100)

          return transaction
        }

        it('should end the transaction', () => {
          const transaction = createTransaction()
          const endTransactionSpy = spyOn(transaction, 'end')
          spyOn(transactionService, 'getCurrentTransaction').and.returnValue(
            transaction
          )

          unobservePageVisibility = observePageVisibility(
            configService,
            transactionService
          )
          hidePageSynthetically(eventName)

          expect(endTransactionSpy).toHaveBeenCalledTimes(1)
        })

        describe('event listeners', () => {
          ;[
            {
              name: 'should fire when transaction is added to the queue',
              createTransaction,
              customAssertions: ({ dispatchEventSpy }) => {
                // should dispatch the QUEUE_FLUSH event
                expect(dispatchEventSpy).toHaveBeenCalledWith(QUEUE_FLUSH)
              }
            },
            {
              name: 'should fire when transaction is discarded',
              createTransaction: () => {
                const tr = createTransaction()
                // make sure transaction will be discarded
                tr.type = TEMPORARY_TYPE

                return tr
              },
              customAssertions: utils.noop
            }
          ].forEach(({ name, createTransaction, customAssertions }) => {
            it(`${name}`, async () => {
              // Arrange
              const anyTime = 1234567834
              spyOnFunction(utils, 'now').and.returnValue(anyTime)
              const unobserveSpy = jasmine.createSpy()
              const observeEvent = configService.observeEvent.bind(
                configService
              )
              spyOn(configService, 'observeEvent').and.callFake((name, fn) => {
                observeEvent(name, fn)
                return unobserveSpy
              })
              const transaction = createTransaction()
              const dispatchEventSpy = spyOn(
                configService,
                'dispatchEvent'
              ).and.callThrough()
              spyOn(
                transactionService,
                'getCurrentTransaction'
              ).and.returnValue(transaction)
              startsPerformanceMonitoring()

              // Act
              unobservePageVisibility = observePageVisibility(
                configService,
                transactionService
              )
              hidePageSynthetically(eventName)
              await waitFor(() => dispatchEventSpy.calls.any())

              // Assert
              customAssertions({ dispatchEventSpy })
              expect(unobserveSpy).toHaveBeenCalledTimes(2)
              expect(state.lastHiddenStart).toBe(anyTime)
            })
          })
        })
      })
    })
  })

  describe('when visibility changes into visible', () => {
    it('should not dispatch the QUEUE_FLUSH event', () => {
      const dispatchEventSpy = spyOn(configService, 'dispatchEvent')

      unobservePageVisibility = observePageVisibility(
        configService,
        transactionService
      )
      dispatchBrowserEvent('visibilitychange')

      expect(dispatchEventSpy).toHaveBeenCalledTimes(0)
    })

    it('should not set lastHiddenStart', () => {
      const anyTime = 1234567834
      spyOnFunction(utils, 'now').and.returnValue(anyTime)

      unobservePageVisibility = observePageVisibility(
        configService,
        transactionService
      )

      state.lastHiddenStart = 111
      dispatchBrowserEvent('visibilitychange')

      expect(state.lastHiddenStart).toBe(111)
    })
  })
})
