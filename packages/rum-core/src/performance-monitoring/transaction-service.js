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

import Transaction from './transaction'
import { extend, getPageLoadMarks } from '../common/utils'
import { PAGE_LOAD } from '../common/constants'
import Subscription from '../common/subscription'
import { captureHardNavigation } from './capture-hard-navigation'

class TransactionService {
  constructor(logger, config) {
    if (typeof config === 'undefined') {
      logger.debug('TransactionService: config is not provided')
    }

    this._config = config
    this._logger = logger
    this.marks = {}
    this.currentTransaction = undefined
    this._subscription = new Subscription()
    this._alreadyCapturedPageLoad = false
  }

  shouldCreateTransaction() {
    return this._config.isActive()
  }

  ensureCurrentTransaction(options) {
    if (!options) {
      options = this.createPerfOptions()
    }
    if (!this.shouldCreateTransaction()) {
      return
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
    if (!this.shouldCreateTransaction()) {
      return
    }

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
      this._logger.debug('browserResponsivenessInterval is undefined!')
      return
    }
    this.runOuter(function() {
      var id = setInterval(function() {
        if (transaction.ended) {
          window.clearInterval(id)
        } else {
          transaction.browserResponsivenessCounter++
        }
      }, interval)
    })
  }

  sendPageLoadMetrics(name) {
    var tr = this.startTransaction(name, PAGE_LOAD)
    tr.detectFinish()
    return tr
  }

  capturePageLoadMetrics(tr) {
    var self = this
    var capturePageLoad = self._config.get('capturePageLoad')
    if (
      capturePageLoad &&
      !self._alreadyCapturedPageLoad &&
      tr.isHardNavigation
    ) {
      tr.addMarks(self.marks)
      captureHardNavigation(tr)
      tr.addMarks(getPageLoadMarks())
      self._alreadyCapturedPageLoad = true
      return true
    }
  }

  createPerfOptions(options) {
    var config = this._config.config
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
    var self = this
    var perfOptions = this.createPerfOptions(options)

    if (!type) {
      type = 'custom'
    }

    if (!name) {
      name = 'Unknown'
    }

    var tr = this.getCurrentTransaction()

    if (tr) {
      if (tr.canReuse()) {
        /*
         * perfOptions could also have `canReuse:true` in which case we
         * allow a redefinition until there's a call that doesn't have that
         * or the threshold is exceeded.
         */

        this._logger.debug(
          'Redefining the current transaction',
          tr,
          name,
          type,
          perfOptions
        )
        tr.redefine(name, type, perfOptions)
      } else {
        this._logger.debug('Ending old transaction', tr)
        tr.end()
        tr = this.createTransaction(name, type, perfOptions)
      }
    } else {
      tr = this.createTransaction(name, type, perfOptions)
      if (!tr) {
        return
      }
    }

    if (type === PAGE_LOAD) {
      tr.isHardNavigation = true

      if (perfOptions.pageLoadTraceId) {
        tr.traceId = perfOptions.pageLoadTraceId
      }
      if (perfOptions.pageLoadSampled) {
        tr.sampled = perfOptions.pageLoadSampled
      }

      if (tr.name === 'Unknown' && perfOptions.pageLoadTransactionName) {
        tr.name = perfOptions.pageLoadTransactionName
      }
    }

    this._logger.debug('TransactionService.startTransaction', tr)
    tr.onEnd = function() {
      self.applyAsync(function() {
        self._logger.debug('TransactionService transaction finished', tr)
        if (!self.shouldIgnoreTransaction(tr.name)) {
          if (type === PAGE_LOAD) {
            if (
              tr.name === 'Unknown' &&
              self._config.get('pageLoadTransactionName')
            ) {
              tr.name = self._config.get('pageLoadTransactionName')
            }
            var captured = self.capturePageLoadMetrics(tr)
            if (captured) {
              self.add(tr)
            }
          } else {
            self.add(tr)
          }
        }
      })
    }
    return tr
  }

  applyAsync(fn, applyThis, applyArgs) {
    return this.runOuter(function() {
      return Promise.resolve().then(
        function() {
          return fn.apply(applyThis, applyArgs)
        },
        function(reason) {
          console.log(reason)
        }
      )
    })
  }

  shouldIgnoreTransaction(transactionName) {
    var ignoreList = this._config.get('ignoreTransactions')

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
    return false
  }

  startSpan(name, type, options) {
    var trans = this.ensureCurrentTransaction()

    if (trans) {
      this._logger.debug('TransactionService.startSpan', name, type)
      var span = trans.startSpan(name, type, options)
      return span
    }
  }

  add(transaction) {
    if (!this._config.isActive()) {
      return
    }

    this._subscription.applyAll(this, [transaction])
    this._logger.debug('TransactionService.add', transaction)
  }

  subscribe(fn) {
    return this._subscription.subscribe(fn)
  }

  addTask(taskId) {
    var tr = this.ensureCurrentTransaction()
    if (tr) {
      var taskId = tr.addTask(taskId)
      this._logger.debug('TransactionService.addTask', taskId)
    }
    return taskId
  }

  removeTask(taskId) {
    var tr = this.getCurrentTransaction()
    if (tr) {
      tr.removeTask(taskId)
      this._logger.debug('TransactionService.removeTask', taskId)
    }
  }

  detectFinish() {
    var tr = this.getCurrentTransaction()
    if (tr) {
      tr.detectFinish()
      this._logger.debug('TransactionService.detectFinish')
    }
  }

  runOuter(fn, applyThis, applyArgs) {
    return fn.apply(applyThis, applyArgs)
  }
}

export default TransactionService
