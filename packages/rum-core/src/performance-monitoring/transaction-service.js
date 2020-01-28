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

import { Promise } from 'es6-promise'
import Transaction from './transaction'
import { extend, getEarliestSpan, getLatestNonXHRSpan } from '../common/utils'
import { captureNavigation } from './capture-navigation'
import {
  PAGE_LOAD,
  NAME_UNKNOWN,
  TRANSACTION_START,
  TRANSACTION_END,
  BROWSER_RESPONSIVENESS_INTERVAL,
  TEMPORARY_TYPE,
  TRANSACTION_TYPE_ORDER
} from '../common/constants'
import { addTransactionContext } from '../common/context'
import { __DEV__ } from '../env'

class TransactionService {
  constructor(logger, config) {
    this._config = config
    this._logger = logger
    this.currentTransaction = undefined
    this.respIntervalId = undefined
  }

  ensureCurrentTransaction(name, type, options) {
    let tr = this.getCurrentTransaction()
    if (tr) {
      return tr
    } else {
      tr = new Transaction(name, type, options)
      this.setCurrentTransaction(tr)
    }
    return tr
  }

  getCurrentTransaction() {
    if (this.currentTransaction && !this.currentTransaction.ended) {
      return this.currentTransaction
    }
  }

  setCurrentTransaction(value) {
    this.currentTransaction = value
  }

  ensureRespInterval(checkBrowserResponsiveness) {
    const clearRespInterval = () => {
      clearInterval(this.respIntervalId)
      this.respIntervalId = undefined
    }

    if (checkBrowserResponsiveness) {
      if (typeof this.respIntervalId === 'undefined') {
        this.respIntervalId = setInterval(() => {
          let tr = this.getCurrentTransaction()
          if (tr) {
            tr.browserResponsivenessCounter++
          } else {
            clearRespInterval()
          }
        }, BROWSER_RESPONSIVENESS_INTERVAL)
      }
    } else if (typeof this.respIntervalId !== 'undefined') {
      clearRespInterval()
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
          pageLoadTransactionName: config.pageLoadTransactionName,
          checkBrowserResponsiveness: config.checkBrowserResponsiveness
        },
        perfOptions
      )
    }
    return perfOptions
  }

  startManagedTransaction(name, type, perfOptions) {
    let tr = this.getCurrentTransaction()

    if (!tr) {
      tr = this.ensureCurrentTransaction(name, type, perfOptions)
    } else if (tr.canReuse() && perfOptions.canReuse) {
      /*
       * perfOptions could also have `canReuse:true` in which case we
       * allow a redefinition until there's a call that doesn't have that
       * or the threshold is exceeded.
       */
      if (__DEV__) {
        this._logger.debug(
          `redefining transaction(${tr.id}, ${tr.name}, ${tr.type})`,
          'to',
          `(${name}, ${type})`,
          tr
        )
      }
      /**
       * We only update based precedence defined in TRANSACTION_TYPE_ORDER.
       * If either orders don't exist we also don't redefine the type.
       */

      let redefineType
      let currentTypeOrder = TRANSACTION_TYPE_ORDER.indexOf(tr.type)
      let redefineTypeOrder = TRANSACTION_TYPE_ORDER.indexOf(type)
      if (
        currentTypeOrder !== -1 &&
        redefineTypeOrder !== -1 &&
        redefineTypeOrder < currentTypeOrder
      ) {
        redefineType = type
      }

      tr.redefine(name, redefineType, perfOptions)
    } else {
      if (__DEV__) {
        this._logger.debug(
          `ending previous transaction(${tr.id}, ${tr.name})`,
          tr
        )
      }
      tr.end()
      tr = this.ensureCurrentTransaction(name, type, perfOptions)
    }

    if (tr.type === PAGE_LOAD) {
      tr.options.checkBrowserResponsiveness = false
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
     * For unsampled transactions, avoid capturing various timing information
     * as spans since they are dropped before sending to the server
     */
    if (tr.sampled) {
      tr.captureTimings = true
    }

    this.ensureRespInterval(tr.options.checkBrowserResponsiveness)

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
    return Promise.resolve().then(
      () => {
        const { name, type } = tr

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
          this._logger.debug(`end transaction(${tr.id}, ${tr.name})`, tr)
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
        span.type += '.truncated'
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
    const tr = this.ensureCurrentTransaction(
      undefined,
      TEMPORARY_TYPE,
      this.createOptions({
        canReuse: true,
        managed: true
      })
    )

    if (tr) {
      const span = tr.startSpan(name, type, options)
      if (__DEV__) {
        this._logger.debug(
          `startSpan(${name}, ${type})`,
          `on transaction(${tr.id}, ${tr.name})`
        )
      }
      return span
    }
  }

  addTask(taskId) {
    const tr = this.ensureCurrentTransaction(
      undefined,
      TEMPORARY_TYPE,
      this.createOptions({
        canReuse: true,
        managed: true
      })
    )

    if (tr) {
      var taskId = tr.addTask(taskId)
      if (__DEV__) {
        this._logger.debug(
          `addTask(${taskId})`,
          `on transaction(${tr.id}, ${tr.name})`
        )
      }
    }
    return taskId
  }

  removeTask(taskId) {
    var tr = this.getCurrentTransaction()
    if (tr) {
      tr.removeTask(taskId)
      if (__DEV__) {
        this._logger.debug(
          `removeTask(${taskId})`,
          `on transaction(${tr.id}, ${tr.name})`
        )
      }
    }
  }
}

export default TransactionService
