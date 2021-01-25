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

import { Promise } from '../common/polyfills'
import Transaction from './transaction'
import {
  PerfEntryRecorder,
  captureObserverEntries,
  metrics,
  createTotalBlockingTimeSpan
} from './metrics'
import {
  extend,
  getEarliestSpan,
  getLatestNonXHRSpan,
  isPerfTypeSupported
} from '../common/utils'
import { captureNavigation } from './capture-navigation'
import {
  PAGE_LOAD,
  NAME_UNKNOWN,
  TRANSACTION_START,
  TRANSACTION_END,
  TEMPORARY_TYPE,
  TRANSACTION_TYPE_ORDER,
  LARGEST_CONTENTFUL_PAINT,
  LONG_TASK,
  PAINT,
  TRUNCATED_TYPE,
  FIRST_INPUT,
  LAYOUT_SHIFT
} from '../common/constants'
import { addTransactionContext } from '../common/context'
import { __DEV__, state } from '../state'
import { slugifyUrl } from '../common/url'

class TransactionService {
  constructor(logger, config) {
    this._config = config
    this._logger = logger
    this.currentTransaction = undefined
    this.respIntervalId = undefined
    this.recorder = new PerfEntryRecorder(list => {
      const tr = this.getCurrentTransaction()
      if (tr && tr.captureTimings) {
        let capturePaint = false
        if (tr.type === PAGE_LOAD) {
          capturePaint = true
        }
        const { spans, marks } = captureObserverEntries(list, { capturePaint })
        tr.spans.push(...spans)
        tr.addMarks({ agent: marks })
      }
    })
  }

  createCurrentTransaction(name, type, options) {
    const tr = new Transaction(name, type, options)
    this.currentTransaction = tr
    return tr
  }

  getCurrentTransaction() {
    if (this.currentTransaction && !this.currentTransaction.ended) {
      return this.currentTransaction
    }
  }

  createOptions(options) {
    const config = this._config.config
    let presetOptions = { transactionSampleRate: config.transactionSampleRate }
    let perfOptions = extend(presetOptions, options)
    if (perfOptions.managed) {
      perfOptions = extend(
        {
          pageLoadTraceId: config.pageLoadTraceId,
          pageLoadSampled: config.pageLoadSampled,
          pageLoadSpanId: config.pageLoadSpanId,
          pageLoadTransactionName: config.pageLoadTransactionName
        },
        perfOptions
      )
    }
    return perfOptions
  }

  startManagedTransaction(name, type, perfOptions) {
    let tr = this.getCurrentTransaction()
    let isRedefined = false
    if (!tr) {
      tr = this.createCurrentTransaction(name, type, perfOptions)
    } else if (tr.canReuse() && perfOptions.canReuse) {
      /*
       * perfOptions could also have `canReuse:true` in which case we
       * allow a redefinition until there's a call that doesn't have that
       * or the threshold is exceeded.
       */
      let redefineType = tr.type
      const currentTypeOrder = TRANSACTION_TYPE_ORDER.indexOf(tr.type)
      const redefineTypeOrder = TRANSACTION_TYPE_ORDER.indexOf(type)

      /**
       * Update type based on precedence defined in TRANSACTION_TYPE_ORDER.
       * 1. If both orders doesn't exist, we don't redefine the type.
       * 2. If only the redefined type is not present in predefined order, that implies
       * it's a user defined type and it is of higher precedence
       */
      if (currentTypeOrder >= 0 && redefineTypeOrder < currentTypeOrder) {
        redefineType = type
      }
      if (__DEV__) {
        this._logger.debug(
          `redefining transaction(${tr.id}, ${tr.name}, ${tr.type})`,
          'to',
          `(${name || tr.name}, ${redefineType})`,
          tr
        )
      }
      tr.redefine(name, redefineType, perfOptions)
      isRedefined = true
    } else {
      if (__DEV__) {
        this._logger.debug(
          `ending previous transaction(${tr.id}, ${tr.name})`,
          tr
        )
      }
      tr.end()
      tr = this.createCurrentTransaction(name, type, perfOptions)
    }

    if (tr.type === PAGE_LOAD) {
      if (!isRedefined) {
        this.recorder.start(LARGEST_CONTENTFUL_PAINT)
        this.recorder.start(PAINT)
        this.recorder.start(FIRST_INPUT)
        this.recorder.start(LAYOUT_SHIFT)
      }
      if (perfOptions.pageLoadTraceId) {
        tr.traceId = perfOptions.pageLoadTraceId
      }
      if (perfOptions.pageLoadSampled) {
        tr.sampled = perfOptions.pageLoadSampled
      }
      /**
       * The name must be set as soon as the transaction is started
       * Ex: Helps to decide sampling based on name
       */
      if (tr.name === NAME_UNKNOWN && perfOptions.pageLoadTransactionName) {
        tr.name = perfOptions.pageLoadTransactionName
      }
    }
    /**
     * Start observing for long tasks for all managed transactions
     */
    if (!isRedefined && this._config.get('monitorLongtasks')) {
      this.recorder.start(LONG_TASK)
    }
    /**
     * For unsampled transactions, avoid capturing various timing information
     * as spans since they are dropped before sending to the server
     */
    if (tr.sampled) {
      tr.captureTimings = true
    }

    return tr
  }

  startTransaction(name, type, options) {
    const perfOptions = this.createOptions(options)
    let tr
    /**
     * Flag that decides whether we have to fire the `onstart`
     * hook for a given transaction
     */
    let fireOnstartHook = true
    if (perfOptions.managed) {
      const current = this.currentTransaction
      tr = this.startManagedTransaction(name, type, perfOptions)
      /**
       * If the current transaction remains the same since the
       * transaction could be reused, we should not fire the hook
       */
      if (current === tr) {
        fireOnstartHook = false
      }
    } else {
      tr = new Transaction(name, type, perfOptions)
    }

    tr.onEnd = () => this.handleTransactionEnd(tr)

    if (fireOnstartHook) {
      if (__DEV__) {
        this._logger.debug(`startTransaction(${tr.id}, ${tr.name}, ${tr.type})`)
      }
      this._config.events.send(TRANSACTION_START, [tr])
    }

    return tr
  }

  handleTransactionEnd(tr) {
    /**
     * Stop the observer once the transaction ends as we would like to
     * get notified only when transaction is happening instead of observing
     * all the time
     */
    this.recorder.stop()

    /**
     * Capturing it here before scheduling the transaction end
     * as to avoid capture different location when routed
     */
    const currentUrl = window.location.href

    return Promise.resolve().then(
      () => {
        const { name, type } = tr
        let { lastHiddenStart } = state

        if (lastHiddenStart >= tr._start) {
          if (__DEV__) {
            this._logger.debug(
              `transaction(${tr.id}, ${name}, ${type}) was discarded! The page was hidden during the transaction!`
            )
          }
          return
        }

        if (this.shouldIgnoreTransaction(name) || type === TEMPORARY_TYPE) {
          if (__DEV__) {
            this._logger.debug(
              `transaction(${tr.id}, ${name}, ${type}) is ignored`
            )
          }
          return
        }

        if (type === PAGE_LOAD) {
          /**
           * Setting the pageLoadTransactionName via configService.setConfig after
           * transaction has started should also reflect the correct name.
           */
          const pageLoadTransactionName = this._config.get(
            'pageLoadTransactionName'
          )
          if (name === NAME_UNKNOWN && pageLoadTransactionName) {
            tr.name = pageLoadTransactionName
          }
          /**
           * Capture the TBT as span after observing for all long task entries
           * and once performance observer is disconnected
           */
          if (tr.captureTimings) {
            const { cls, fid, tbt, longtask } = metrics
            if (tbt.duration > 0) {
              tr.spans.push(createTotalBlockingTimeSpan(tbt))
            }

            tr.experience = {}
            if (isPerfTypeSupported(LONG_TASK)) {
              tr.experience.tbt = tbt.duration
            }

            if (isPerfTypeSupported(LAYOUT_SHIFT)) {
              tr.experience.cls = cls
            }

            if (fid > 0) {
              tr.experience.fid = fid
            }

            if (longtask.count > 0) {
              tr.experience.longtask = {
                count: longtask.count,
                sum: longtask.duration,
                max: longtask.max
              }
            }
          }
        }
        /**
         * Categorize the transaction based on the current location
         */
        if (tr.name === NAME_UNKNOWN) {
          tr.name = slugifyUrl(currentUrl)
        }

        captureNavigation(tr)

        /**
         * Adjust transaction start time with span timings and
         * truncate spans that goes beyond transaction timeframe
         */
        this.adjustTransactionTime(tr)
        /**
         * Capture breakdown metrics once the transaction is completed
         */
        const breakdownMetrics = this._config.get('breakdownMetrics')
        if (breakdownMetrics) {
          tr.captureBreakdown()
        }
        const configContext = this._config.get('context')
        addTransactionContext(tr, configContext)

        this._config.events.send(TRANSACTION_END, [tr])
        if (__DEV__) {
          this._logger.debug(
            `end transaction(${tr.id}, ${tr.name}, ${tr.type})`,
            tr
          )
        }
      },
      err => {
        if (__DEV__) {
          this._logger.debug(
            `error ending transaction(${tr.id}, ${tr.name})`,
            err
          )
        }
      }
    )
  }

  adjustTransactionTime(transaction) {
    /**
     * Adjust start time of the transaction
     */
    const spans = transaction.spans
    const earliestSpan = getEarliestSpan(spans)

    if (earliestSpan && earliestSpan._start < transaction._start) {
      transaction._start = earliestSpan._start
    }

    /**
     * Adjust end time of the transaction to match the latest
     * span end time
     */
    const latestSpan = getLatestNonXHRSpan(spans)
    if (latestSpan && latestSpan._end > transaction._end) {
      transaction._end = latestSpan._end
    }

    /**
     * Set all spans that are longer than the transaction to
     * be truncated spans
     */
    const transactionEnd = transaction._end
    for (let i = 0; i < spans.length; i++) {
      const span = spans[i]
      if (span._end > transactionEnd) {
        span._end = transactionEnd
        span.type += TRUNCATED_TYPE
      }
      if (span._start > transactionEnd) {
        span._start = transactionEnd
      }
    }
  }

  shouldIgnoreTransaction(transactionName) {
    var ignoreList = this._config.get('ignoreTransactions')
    if (ignoreList && ignoreList.length) {
      for (var i = 0; i < ignoreList.length; i++) {
        var element = ignoreList[i]
        if (typeof element.test === 'function') {
          if (element.test(transactionName)) {
            return true
          }
        } else if (element === transactionName) {
          return true
        }
      }
    }
    return false
  }

  startSpan(name, type, options) {
    let tr = this.getCurrentTransaction()
    if (!tr) {
      tr = this.createCurrentTransaction(
        undefined,
        TEMPORARY_TYPE,
        this.createOptions({
          canReuse: true,
          managed: true
        })
      )
    }

    const span = tr.startSpan(name, type, options)
    if (__DEV__) {
      this._logger.debug(
        `startSpan(${name}, ${span.type})`,
        `on transaction(${tr.id}, ${tr.name})`
      )
    }
    return span
  }

  endSpan(span, context) {
    if (!span) {
      return
    }
    if (__DEV__) {
      const tr = this.getCurrentTransaction()
      tr &&
        this._logger.debug(
          `endSpan(${span.name}, ${span.type})`,
          `on transaction(${tr.id}, ${tr.name})`
        )
    }
    span.end(null, context)
  }
}

export default TransactionService
