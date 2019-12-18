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
  parseDtHeaderValue,
  stripQueryStringFromUrl,
  getDtHeaderValue
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
  XMLHTTPREQUEST,
  HTTP_REQUEST_TYPE,
  BROWSER_RESPONSIVENESS_INTERVAL,
  BROWSER_RESPONSIVENESS_BUFFER,
  SIMILAR_SPAN_TO_TRANSACTION_RATIO
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
      const data = task.data
      const requestUrl = new Url(data.url)
      const spanName =
        data.method +
        ' ' +
        (requestUrl.relative
          ? requestUrl.path
          : stripQueryStringFromUrl(requestUrl.href))

      if (!transactionService.getCurrentTransaction()) {
        transactionService.startTransaction(spanName, HTTP_REQUEST_TYPE, {
          managed: true
        })
      }

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
      const target = data.target
      if (isDtEnabled && isSameOrigin && target) {
        this.injectDtHeader(span, target)
      }
      span.sync = data.sync
      data.span = span
      task.id = taskId
    } else if (event === INVOKE) {
      if (task.data && task.data.span) {
        task.data.span.end(null, task.data)
      }
      if (task.id) {
        transactionService.removeTask(task.id)
      }
    }
  }

  injectDtHeader(span, target) {
    var configService = this._configService
    var headerName = configService.get('distributedTracingHeaderName')
    var headerValue = getDtHeaderValue(span)
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
          `transaction(${tr.id}, ${tr.name}) was discarded! Transaction duration (${duration}) is greater than the transactionDurationThreshold configuration (${transactionDurationThreshold})`
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

    if (tr.options.checkBrowserResponsiveness) {
      const wasBrowserResponsive = this.checkBrowserResponsiveness(
        tr,
        BROWSER_RESPONSIVENESS_INTERVAL,
        BROWSER_RESPONSIVENESS_BUFFER
      )

      if (!wasBrowserResponsive) {
        if (__DEV__) {
          this._logginService.debug(
            `transaction(${tr.id}, ${tr.name}) was discarded! Browser was not responsive enough during the transaction.`,
            ' duration:',
            duration,
            ' browserResponsivenessCounter:',
            tr.browserResponsivenessCounter
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
      transaction.spans = this.groupSmallContinuouslySimilarSpans(
        transaction,
        SIMILAR_SPAN_TO_TRANSACTION_RATIO
      )
    }

    transaction.spans = transaction.spans.filter(function(span) {
      return (
        span.duration() > 0 &&
        span._start >= transaction._start &&
        span._end <= transaction._end
      )
    })
  }

  createTransactionDataModel(transaction) {
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

    const transactionData = {
      id: transaction.id,
      trace_id: transaction.traceId,
      name: transaction.name,
      type: transaction.type,
      duration: transaction.duration(),
      spans,
      context: transaction.context,
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
    const counter = transaction.browserResponsivenessCounter
    const duration = transaction.duration()
    const expectedCount = Math.floor(duration / interval)

    return counter + buffer >= expectedCount
  }
}

export default PerformanceMonitoring
