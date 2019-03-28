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
  sanitizeObjectStrings,
  sanitizeString,
  checkSameOrigin,
  isDtHeaderValid,
  getDtHeaderValue,
  merge,
  stripQueryStringFromUrl,
  parseDtHeaderValue
} = require('../common/utils')
const patchingSub = require('../common/patching').subscription
const { globalState } = require('../common/patching/patch-utils')
const {
  SCHEDULE,
  INVOKE,
  XMLHTTPREQUEST_SOURCE,
  FETCH_SOURCE
} = require('../common/constants')

class PerformanceMonitoring {
  constructor(server, config, logger, transactionService) {
    this._server = server
    this._config = config
    this._logger = logger
    this._transactionService = transactionService
  }

  init() {
    var performanceMonitoring = this
    this._transactionService.subscribe(function(tr) {
      var payload = performanceMonitoring.createTransactionPayload(tr)
      if (payload) {
        performanceMonitoring._server.addTransaction(payload)
      }
    })

    var patchSubFn = this.getXhrPatchSubFn(
      this._config,
      this._transactionService
    )
    this.cancelPatchSub = patchingSub.subscribe(patchSubFn)
  }

  getXhrPatchSubFn() {
    return (event, task) => {
      if (
        (task.source === XMLHTTPREQUEST_SOURCE &&
          !globalState.fetchInProgress) ||
        task.source === FETCH_SOURCE
      ) {
        if (event === SCHEDULE && task.data) {
          var spanName =
            task.data.method + ' ' + stripQueryStringFromUrl(task.data.url)
          var span = this._transactionService.startSpan(
            spanName,
            'external.http'
          )
          var taskId = this._transactionService.addTask()

          if (span) {
            var isDtEnabled = this._config.get('distributedTracing')
            var origins = this._config.get('distributedTracingOrigins')
            var isSameOrigin =
              checkSameOrigin(task.data.url, window.location.href) ||
              checkSameOrigin(task.data.url, origins)
            var target = task.data.target
            if (isDtEnabled && isSameOrigin && target) {
              this.injectDtHeader(span, target)
            }
            span.addContext({
              http: {
                method: task.data.method,
                url: task.data.url
              }
            })
            span.sync = task.data.sync
            task.data.span = span
            task.id = taskId
          }
        }
        if (event === INVOKE && task.data && task.data.span) {
          if (typeof task.data.target.status !== 'undefined') {
            task.data.span.addContext({
              http: { status_code: task.data.target.status }
            })
          } else if (task.data.response) {
            task.data.span.addContext({
              http: { status_code: task.data.response.status }
            })
          }
          task.data.span.end()
        }

        if (event === INVOKE && task.id) {
          this._transactionService.removeTask(task.id)
        }
      }
    }
  }

  injectDtHeader(span, target) {
    var headerName = this._config.get('distributedTracingHeaderName')
    var headerValueCallback = this._config.get(
      'distributedTracingHeaderValueCallback'
    )
    if (typeof headerValueCallback !== 'function') {
      headerValueCallback = getDtHeaderValue
    }

    var headerValue = headerValueCallback(span)
    var isHeaderValid = isDtHeaderValid(headerValue)
    if (headerName && headerValue && isHeaderValid) {
      if (typeof target.setRequestHeader === 'function') {
        target.setRequestHeader(headerName, headerValue)
      } else if (
        target.headers &&
        typeof target.headers.append === 'function'
      ) {
        target.headers.append(headerName, headerValue)
      } else {
        target[headerName] = headerValue
      }
    }
  }

  extractDtHeader(target) {
    var headerName = this._config.get('distributedTracingHeaderName')
    if (target) {
      return parseDtHeaderValue(target[headerName])
    }
  }

  setTransactionContext(transaction) {
    var context = this._config.get('context')
    if (context) {
      transaction.addContext(context)
    }
  }

  filterTransaction(tr) {
    var transactionDurationThreshold = this._config.get(
      'transactionDurationThreshold'
    )
    var duration = tr.duration()
    if (
      !duration ||
      duration > transactionDurationThreshold ||
      !tr.spans.length
    ) {
      return false
    }

    /**
     * In case of unsampled transaction, send only the transaction to apm server
     *  without any spans to reduce the payload size
     */
    if (!tr.sampled) {
      tr.resetSpans()
    }

    var browserResponsivenessInterval = this._config.get(
      'browserResponsivenessInterval'
    )
    var checkBrowserResponsiveness = this._config.get(
      'checkBrowserResponsiveness'
    )

    if (checkBrowserResponsiveness && !tr.isHardNavigation) {
      var buffer = this._config.get('browserResponsivenessBuffer')

      var wasBrowserResponsive = this.checkBrowserResponsiveness(
        tr,
        browserResponsivenessInterval,
        buffer
      )
      if (!wasBrowserResponsive) {
        this._logger.debug(
          'Transaction was discarded! browser was not responsive enough during the transaction.',
          ' duration:',
          duration,
          ' browserResponsivenessCounter:',
          tr.browserResponsivenessCounter,
          'interval:',
          browserResponsivenessInterval
        )
        return false
      }
    }
    return true
  }

  prepareTransaction(transaction) {
    transaction.spans.sort(function(spanA, spanB) {
      return spanA._start - spanB._start
    })

    if (this._config.get('groupSimilarSpans')) {
      var similarSpanThreshold = this._config.get('similarSpanThreshold')
      transaction.spans = this.groupSmallContinuouslySimilarSpans(
        transaction,
        similarSpanThreshold
      )
    }

    transaction.spans = transaction.spans.filter(function(span) {
      return (
        span.duration() > 0 &&
        span._start >= transaction._start &&
        span._end > transaction._start &&
        span._start < transaction._end &&
        span._end <= transaction._end
      )
    })

    this.setTransactionContext(transaction)
  }

  createTransactionDataModel(transaction) {
    const configContext = this._config.get('context')
    const stringLimit = this._config.get('serverStringLimit')
    const transactionStart = transaction._start

    const spans = transaction.spans.map(function(span) {
      let context
      if (span.context) {
        context = sanitizeObjectStrings(span.context, stringLimit)
      }
      return {
        id: span.id,
        transaction_id: transaction.id,
        parent_id: span.parentId || transaction.id,
        trace_id: transaction.traceId,
        name: sanitizeString(span.name, stringLimit, true),
        type: sanitizeString(span.type, stringLimit, true),
        subType: sanitizeString(span.subType, stringLimit, true),
        action: sanitizeString(span.action, stringLimit, true),
        sync: span.sync,
        start: span._start - transactionStart,
        duration: span.duration(),
        context
      }
    })

    var context = merge({}, configContext, transaction.context)
    return {
      id: transaction.id,
      trace_id: transaction.traceId,
      name: sanitizeString(transaction.name, stringLimit, false),
      type: sanitizeString(transaction.type, stringLimit, true),
      duration: transaction.duration(),
      spans,
      context,
      marks: transaction.marks,
      span_count: {
        started: spans.length
      },
      sampled: transaction.sampled
    }
  }

  createTransactionPayload(transaction) {
    this.prepareTransaction(transaction)
    const filtered = this.filterTransaction(transaction)
    if (filtered) {
      return this.createTransactionDataModel(transaction)
    }
  }

  sendTransactions(transactions) {
    const payload = transactions
      .map(tr => this.createTransactionPayload(tr))
      .filter(tr => tr)

    this._logger.debug(
      'Sending Transactions to apm server.',
      transactions.length
    )

    // todo: check if transactions are already being sent
    const promise = this._server.sendTransactions(payload)
    return promise
  }

  convertTransactionsToServerModel(transactions) {
    return transactions.map(tr => this.createTransactionDataModel(tr))
  }

  groupSmallContinuouslySimilarSpans(transaction, threshold) {
    var transDuration = transaction.duration()
    var spans = []
    var lastCount = 1
    transaction.spans.forEach(function(span, index) {
      if (spans.length === 0) {
        spans.push(span)
      } else {
        var lastSpan = spans[spans.length - 1]

        var isContinuouslySimilar =
          lastSpan.type === span.type &&
          lastSpan.subType === span.subType &&
          lastSpan.action === span.action &&
          lastSpan.name === span.name &&
          span.duration() / transDuration < threshold &&
          (span._start - lastSpan._end) / transDuration < threshold

        var isLastSpan = transaction.spans.length === index + 1

        if (isContinuouslySimilar) {
          lastCount++
          lastSpan._end = span._end
        }

        if (lastCount > 1 && (!isContinuouslySimilar || isLastSpan)) {
          lastSpan.name = lastCount + 'x ' + lastSpan.name
          lastCount = 1
        }

        if (!isContinuouslySimilar) {
          spans.push(span)
        }
      }
    })
    return spans
  }

  checkBrowserResponsiveness(transaction, interval, buffer) {
    var counter = transaction.browserResponsivenessCounter
    if (typeof interval === 'undefined' || typeof counter === 'undefined') {
      return true
    }

    var duration = transaction.duration()
    var expectedCount = Math.floor(duration / interval)
    var wasBrowserResponsive = counter + buffer >= expectedCount

    return wasBrowserResponsive
  }
}

module.exports = PerformanceMonitoring
