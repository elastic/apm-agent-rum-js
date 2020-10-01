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
  getDtHeaderValue,
  stripQueryStringFromUrl
} from '../common/utils'
import { Url } from '../common/url'
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
  EVENT_TARGET,
  HTTP_REQUEST_TYPE,
  USER_INTERACTION,
  OUTCOME_FAILURE,
  OUTCOME_SUCCESS
} from '../common/constants'
import {
  truncateModel,
  SPAN_MODEL,
  TRANSACTION_MODEL
} from '../common/truncate'
import { __DEV__ } from '../state'

/**
 * Parameters used for Managed Transactions
 */
const SIMILAR_SPAN_TO_TRANSACTION_RATIO = 0.05
const TRANSACTION_DURATION_THRESHOLD = 60000

export function groupSmallContinuouslySimilarSpans(
  originalSpans,
  transDuration,
  threshold
) {
  /**
   * sort the original spans
   */
  originalSpans.sort((spanA, spanB) => spanA._start - spanB._start)

  var spans = []
  let lastCount = 1
  originalSpans.forEach(function(span, index) {
    if (spans.length === 0) {
      spans.push(span)
    } else {
      var lastSpan = spans[spans.length - 1]

      var isContinuouslySimilar =
        lastSpan.type === span.type &&
        lastSpan.subtype === span.subtype &&
        lastSpan.action === span.action &&
        lastSpan.name === span.name &&
        span.duration() / transDuration < threshold &&
        (span._start - lastSpan._end) / transDuration < threshold

      var isLastSpan = originalSpans.length === index + 1

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

export function adjustTransactionSpans(transaction) {
  if (transaction.sampled) {
    const filterdSpans = transaction.spans.filter(span => {
      return (
        span.duration() > 0 &&
        span._start >= transaction._start &&
        span._end <= transaction._end
      )
    })
    /**
     * Similar spans would be grouped automatically for all managed transactions
     */
    if (transaction.isManaged()) {
      var duration = transaction.duration()
      const similarSpans = groupSmallContinuouslySimilarSpans(
        filterdSpans,
        duration,
        SIMILAR_SPAN_TO_TRANSACTION_RATIO
      )
      transaction.spans = similarSpans
    } else {
      transaction.spans = filterdSpans
    }
  } else {
    /**
     * In case of unsampled transaction, send only the transaction to apm server
     *  without any spans to reduce the payload size
     */
    transaction.resetSpans()
  }

  return transaction
}

export default class PerformanceMonitoring {
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

    if (flags[EVENT_TARGET]) {
      patchEventHandler.observe(EVENT_TARGET, this.getEventTargetSub())
    }
  }

  getEventTargetSub() {
    const transactionService = this._transactionService
    return (event, task) => {
      if (
        event === SCHEDULE &&
        task.source === EVENT_TARGET &&
        task.eventType === 'click'
      ) {
        const target = task.target
        const name = target.getAttribute('name')

        let additionalInfo = ''
        if (name) {
          additionalInfo = `["${name}"]`
        }

        const tagName = target.tagName.toLowerCase()

        /**
         * We reduce the reusability threshold to make sure
         * we only capture async activities (e.g. network)
         * related to this interaction.
         */
        const tr = transactionService.startTransaction(
          `Click - ${tagName}${additionalInfo}`,
          USER_INTERACTION,
          {
            managed: true,
            canReuse: true,
            reuseThreshold: 100
          }
        )

        if (tr) {
          let classes = target.getAttribute('class')
          if (classes) {
            tr.addContext({ custom: { classes } })
          }
        }
      }
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

      const span = transactionService.startSpan(spanName, 'external.http', {
        blocking: true
      })
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
      } else if (__DEV__) {
        this._logginService.debug(
          `Could not inject distributed tracing header to the request origin ('${requestUrl.origin}') from the current origin ('${currentUrl.origin}')`
        )
      }
      /**
       * set sync flag only for synchronous API calls, setting the flag to
       * false would result in UI showing `async` label on non-synchronous spans
       * which creates unncessary noise for the user
       */
      if (data.sync) {
        span.sync = data.sync
      }
      data.span = span
    } else if (event === INVOKE) {
      const data = task.data
      if (data && data.span) {
        const { span, response, target } = data
        let status
        if (response) {
          status = response.status
        } else {
          status = target.status
        }

        let outcome
        if (data.status != 'abort') {
          if (status >= 400 || status == 0) {
            outcome = OUTCOME_FAILURE
          } else {
            outcome = OUTCOME_SUCCESS
          }
        }
        span.outcome = outcome
        const tr = transactionService.getCurrentTransaction()
        if (tr && tr.type === HTTP_REQUEST_TYPE) {
          tr.outcome = outcome
        }
        transactionService.endSpan(span, data)
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

    if (tr.isManaged()) {
      if (duration > TRANSACTION_DURATION_THRESHOLD) {
        if (__DEV__) {
          this._logginService.debug(
            `transaction(${tr.id}, ${tr.name}) was discarded! Transaction duration (${duration}) is greater than managed transaction threshold (${TRANSACTION_DURATION_THRESHOLD})`
          )
        }
        return false
      }

      if (tr.sampled && tr.spans.length === 0) {
        if (__DEV__) {
          this._logginService.debug(
            `transaction(${tr.id}, ${tr.name}) was discarded! Transaction does not have any spans`
          )
        }
        return false
      }
    }
    return true
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
        subtype: span.subtype,
        action: span.action,
        sync: span.sync,
        start: parseInt(span._start - transactionStart),
        duration: span.duration(),
        context: span.context,
        outcome: span.outcome
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
      sampled: transaction.sampled,
      experience: transaction.experience,
      outcome: transaction.outcome
    }
    return truncateModel(TRANSACTION_MODEL, transactionData)
  }

  createTransactionPayload(transaction) {
    const adjustedTransaction = adjustTransactionSpans(transaction)
    const filtered = this.filterTransaction(adjustedTransaction)
    if (filtered) {
      return this.createTransactionDataModel(transaction)
    }
  }
}
