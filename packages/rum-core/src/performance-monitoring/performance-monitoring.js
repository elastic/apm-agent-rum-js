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

import {
  checkSameOrigin,
  isDtHeaderValid,
  merge,
  parseDtHeaderValue,
  stripQueryStringFromUrl
} from '../common/utils'
import Url from '../common/url'
import { patchEventHandler } from '../common/patching'
import { globalState } from '../common/patching/patch-utils'
import {
  SCHEDULE,
  INVOKE,
  TRANSACTION_END,
  AFTER_EVENT,
  FETCH,
  HISTORY,
  XMLHTTPREQUEST
} from '../common/constants'
import {
  truncateModel,
  SPAN_MODEL,
  TRANSACTION_MODEL
} from '../common/truncate'
import { __DEV__ } from '../env'

class PerformanceMonitoring {
  constructor(apmServer, configService, loggingService, transactionService) {
    this._apmServer = apmServer
    this._configService = configService
    this._logginService = loggingService
    this._transactionService = transactionService
  }

  init(flags = {}) {
    /**
     * We need to run this event listener after all of user-registered listener,
     * since this event listener adds the transaction to the queue to be send to APM Server.
     */
    this._configService.events.observe(TRANSACTION_END + AFTER_EVENT, tr => {
      const payload = this.createTransactionPayload(tr)
      if (payload) {
        this._apmServer.addTransaction(payload)
      }
    })

    if (flags[HISTORY]) {
      patchEventHandler.observe(HISTORY, this.getHistorySub())
    }

    if (flags[XMLHTTPREQUEST]) {
      patchEventHandler.observe(XMLHTTPREQUEST, this.getXHRSub())
    }

    if (flags[FETCH]) {
      patchEventHandler.observe(FETCH, this.getFetchSub())
    }
  }

  getHistorySub() {
    const transactionService = this._transactionService
    return (event, task) => {
      if (task.source === HISTORY && event === INVOKE) {
        transactionService.startTransaction(task.data.title, 'route-change', {
          managed: true,
          canReuse: true
        })
      }
    }
  }

  getXHRSub() {
    return (event, task) => {
      if (task.source === XMLHTTPREQUEST && !globalState.fetchInProgress) {
        this.processAPICalls(event, task)
      }
    }
  }

  getFetchSub() {
    return (event, task) => {
      if (task.source === FETCH) {
        this.processAPICalls(event, task)
      }
    }
  }

  processAPICalls(event, task) {
    const configService = this._configService
    const transactionService = this._transactionService

    if (event === SCHEDULE && task.data) {
      const requestUrl = new Url(task.data.url)
      const spanName =
        task.data.method +
        ' ' +
        (requestUrl.relative
          ? requestUrl.path
          : stripQueryStringFromUrl(requestUrl.href))
      const span = transactionService.startSpan(spanName, 'external.http')
      const taskId = transactionService.addTask()

      if (!span) {
        return
      }
      const isDtEnabled = configService.get('distributedTracing')
      const dtOrigins = configService.get('distributedTracingOrigins')
      const currentUrl = new Url(window.location.href)
      const isSameOrigin =
        checkSameOrigin(requestUrl.origin, currentUrl.origin) ||
        checkSameOrigin(requestUrl.origin, dtOrigins)
      const target = task.data.target
      if (isDtEnabled && isSameOrigin && target) {
        this.injectDtHeader(span, target)
      }
      span.addContext({
        http: {
          method: task.data.method,
          url: requestUrl.href
        }
      })
      span.sync = task.data.sync
      task.data.span = span
      task.id = taskId
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
      transactionService.removeTask(task.id)
    }
  }

  injectDtHeader(span, target) {
    var configService = this._configService
    var headerName = configService.get('distributedTracingHeaderName')
    var headerValueCallback = configService.get(
      'distributedTracingHeaderValueCallback'
    )

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
    var configService = this._configService
    var headerName = configService.get('distributedTracingHeaderName')
    if (target) {
      return parseDtHeaderValue(target[headerName])
    }
  }

  setTransactionContext(transaction) {
    var context = this._configService.get('context')
    if (context) {
      transaction.addContext(context)
    }
  }

  filterTransaction(tr) {
    const transactionDurationThreshold = this._configService.get(
      'transactionDurationThreshold'
    )
    const duration = tr.duration()

    if (!duration) {
      if (__DEV__) {
        let message = `transaction(${tr.id}, ${tr.name}) was discarded! `
        if (duration === 0) {
          message += `Transaction duration is 0`
        } else {
          message += `Transaction wasn't ended`
        }
        this._logginService.debug(message)
      }
      return false
    }

    if (duration > transactionDurationThreshold) {
      if (__DEV__) {
        this._logginService.debug(
          `transaction(${tr.id}, ${
            tr.name
          }) was discarded! Transaction duration (${duration}) is greater than the transactionDurationThreshold configuration (${transactionDurationThreshold})`
        )
      }
      return false
    }

    if (tr.spans.length === 0) {
      if (__DEV__) {
        this._logginService.debug(
          `transaction(${tr.id}, ${
            tr.name
          }) was discarded! Transaction does not include any spans`
        )
      }
      return false
    }

    /**
     * In case of unsampled transaction, send only the transaction to apm server
     *  without any spans to reduce the payload size
     */
    if (!tr.sampled) {
      tr.resetSpans()
    }

    const browserResponsivenessInterval = this._configService.get(
      'browserResponsivenessInterval'
    )
    const checkBrowserResponsiveness = this._configService.get(
      'checkBrowserResponsiveness'
    )

    if (checkBrowserResponsiveness && tr.options.checkBrowserResponsiveness) {
      const buffer = this._configService.get('browserResponsivenessBuffer')

      const wasBrowserResponsive = this.checkBrowserResponsiveness(
        tr,
        browserResponsivenessInterval,
        buffer
      )

      if (!wasBrowserResponsive) {
        if (__DEV__) {
          this._logginService.debug(
            `transaction(${tr.id}, ${
              tr.name
            }) was discarded! Browser was not responsive enough during the transaction.`,
            ' duration:',
            duration,
            ' browserResponsivenessCounter:',
            tr.browserResponsivenessCounter,
            'interval:',
            browserResponsivenessInterval
          )
        }
        return false
      }
    }
    return true
  }

  prepareTransaction(transaction) {
    transaction.spans.sort(function(spanA, spanB) {
      return spanA._start - spanB._start
    })

    if (this._configService.get('groupSimilarSpans')) {
      var similarSpanThreshold = this._configService.get('similarSpanThreshold')
      transaction.spans = this.groupSmallContinuouslySimilarSpans(
        transaction,
        similarSpanThreshold
      )
    }

    transaction.spans = transaction.spans.filter(function(span) {
      return (
        span.duration() > 0 &&
        span._start >= transaction._start &&
        span._end <= transaction._end
      )
    })

    this.setTransactionContext(transaction)
  }

  createTransactionDataModel(transaction) {
    const configContext = this._configService.get('context')
    const transactionStart = transaction._start

    const spans = transaction.spans.map(function(span) {
      const spanData = {
        id: span.id,
        transaction_id: transaction.id,
        parent_id: span.parentId || transaction.id,
        trace_id: transaction.traceId,
        name: span.name,
        type: span.type,
        subType: span.subType,
        action: span.action,
        sync: span.sync,
        start: span._start - transactionStart,
        duration: span.duration(),
        context: span.context
      }
      return truncateModel(SPAN_MODEL, spanData)
    })

    const context = merge({}, configContext, transaction.context)

    const transactionData = {
      id: transaction.id,
      trace_id: transaction.traceId,
      name: transaction.name,
      type: transaction.type,
      duration: transaction.duration(),
      spans,
      context,
      marks: transaction.marks,
      breakdown: transaction.breakdownTimings,
      span_count: {
        started: spans.length
      },
      sampled: transaction.sampled
    }
    return truncateModel(TRANSACTION_MODEL, transactionData)
  }

  createTransactionPayload(transaction) {
    this.prepareTransaction(transaction)
    const filtered = this.filterTransaction(transaction)
    if (filtered) {
      return this.createTransactionDataModel(transaction)
    }
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

export default PerformanceMonitoring
