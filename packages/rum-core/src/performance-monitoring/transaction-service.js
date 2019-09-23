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
import { extend } from '../common/utils'
import { PAGE_LOAD, NAME_UNKNOWN, ROUTE_CHANGE } from '../common/constants'
import { captureNavigation } from './capture-navigation'
import { __DEV__ } from '../env'
import { TRANSACTION_START, TRANSACTION_END } from '../common/constants'

class TransactionService {
  constructor(logger, config) {
    if (__DEV__ && typeof config === 'undefined') {
      logger.debug('TransactionService: config is not provided')
    }
    this._config = config
    this._logger = logger
    this.currentTransaction = undefined
  }

  ensureCurrentTransaction(options) {
    if (!options) {
      options = this.createPerfOptions()
    }
    var tr = this.getCurrentTransaction()
    if (tr) {
      return tr
    } else {
      options.canReuse = true
      return this.createTransaction(undefined, undefined, options)
    }
  }

  getCurrentTransaction() {
    if (this.currentTransaction && !this.currentTransaction.ended) {
      return this.currentTransaction
    }
  }

  setCurrentTransaction(value) {
    this.currentTransaction = value
  }

  createTransaction(name, type, options) {
    var tr = new Transaction(name, type, options)
    this.setCurrentTransaction(tr)
    if (options.checkBrowserResponsiveness) {
      this.startCounter(tr)
    }
    return tr
  }

  startCounter(transaction) {
    transaction.browserResponsivenessCounter = 0
    var interval = this._config.get('browserResponsivenessInterval')
    if (typeof interval === 'undefined') {
      if (__DEV__) {
        this._logger.debug('browserResponsivenessInterval is undefined!')
      }
      return
    }

    const id = setInterval(function() {
      if (transaction.ended) {
        window.clearInterval(id)
      } else {
        transaction.browserResponsivenessCounter++
      }
    }, interval)
  }

  createPerfOptions(options) {
    const config = this._config.config
    return extend(
      {
        pageLoadTraceId: config.pageLoadTraceId,
        pageLoadSampled: config.pageLoadSampled,
        pageLoadSpanId: config.pageLoadSpanId,
        pageLoadTransactionName: config.pageLoadTransactionName,
        transactionSampleRate: config.transactionSampleRate,
        checkBrowserResponsiveness: config.checkBrowserResponsiveness
      },
      options
    )
  }

  startTransaction(name, type, options) {
    const perfOptions = this.createPerfOptions(options)

    let tr = this.getCurrentTransaction()

    if (!tr) {
      tr = this.createTransaction(name, type, perfOptions)
    } else if (tr.canReuse() && perfOptions.canReuse) {
      /*
       * perfOptions could also have `canReuse:true` in which case we
       * allow a redefinition until there's a call that doesn't have that
       * or the threshold is exceeded.
       */
      if (__DEV__) {
        this._logger.debug(
          'Redefining the current transaction',
          tr,
          name,
          type,
          perfOptions
        )
      }
      /**
       * We want to keep the type in it's original value, therefore,
       * passing undefined as type. For example, in the case of a page-load
       * we want to keep the type but redefine the name to the first route.
       */
      tr.redefine(name, undefined, perfOptions)
    } else {
      if (__DEV__) {
        this._logger.debug('Ending old transaction', tr)
      }
      tr.end()
      tr = this.createTransaction(name, type, perfOptions)
    }

    if (type === PAGE_LOAD) {
      tr.captureTimings = true

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
    } else if (type === ROUTE_CHANGE) {
      tr.captureTimings = true
    }

    if (__DEV__) {
      this._logger.debug('TransactionService.startTransaction', tr)
    }
    this._config.events.send(TRANSACTION_START, [tr])

    tr.onEnd = () => {
      return Promise.resolve().then(
        () => {
          if (__DEV__) {
            this._logger.debug('TransactionService transaction finished', tr)
          }
          if (this.shouldIgnoreTransaction(tr.name)) {
            return
          }
          /**
           * Capture breakdown metrics once the transaction is completed
           */
          const breakdownMetrics = this._config.get('breakdownMetrics')
          if (breakdownMetrics) {
            tr.captureBreakdown()
          }

          if (tr.type === PAGE_LOAD) {
            /**
             * Setting the pageLoadTransactionName via configService.setConfig after
             * transaction has started should also reflect the correct name.
             */
            const pageLoadTransactionName = this._config.get(
              'pageLoadTransactionName'
            )
            if (tr.name === NAME_UNKNOWN && pageLoadTransactionName) {
              tr.name = pageLoadTransactionName
            }
          }
          captureNavigation(tr)
          this.add(tr)
        },
        err => {
          if (__DEV__) {
            this._logger.debug('TransactionService transaction onEnd', err)
          }
        }
      )
    }
    return tr
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
    var trans = this.ensureCurrentTransaction()

    if (trans) {
      if (__DEV__) {
        this._logger.debug('TransactionService.startSpan', name, type)
      }
      var span = trans.startSpan(name, type, options)
      return span
    }
  }

  add(transaction) {
    this._config.events.send(TRANSACTION_END, [transaction])
    if (__DEV__) {
      this._logger.debug('TransactionService.add', transaction)
    }
  }

  addTask(taskId) {
    var tr = this.ensureCurrentTransaction()
    if (tr) {
      var taskId = tr.addTask(taskId)
      if (__DEV__) {
        this._logger.debug('TransactionService.addTask', taskId)
      }
    }
    return taskId
  }

  removeTask(taskId) {
    var tr = this.getCurrentTransaction()
    if (tr) {
      tr.removeTask(taskId)
      if (__DEV__) {
        this._logger.debug('TransactionService.removeTask', taskId)
      }
    }
  }

  detectFinish() {
    var tr = this.getCurrentTransaction()
    if (tr) {
      tr.detectFinish()
      if (__DEV__) {
        this._logger.debug('TransactionService.detectFinish')
      }
    }
  }
}

export default TransactionService
