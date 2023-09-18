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

import { createStackTraces, filterInvalidFrames } from './stack-trace'
import { generateRandomId, merge, extend } from '../common/utils'
import { getPageContext } from '../common/context'
import { truncateModel, ERROR_MODEL } from '../common/truncate'
import stackParser from 'error-stack-parser'

/**
 * List of keys to be ignored from getting added to custom error properties
 */
const IGNORE_KEYS = ['stack', 'message']
const PROMISE_REJECTION_PREFIX = 'Unhandled promise rejection: '

function getErrorProperties(error) {
  /**
   * Flag which is used to eliminate the empty object
   * check on context.custom
   */
  let propertyFound = false
  const properties = {}
  Object.keys(error).forEach(function (key) {
    if (IGNORE_KEYS.indexOf(key) >= 0) {
      return
    }
    /**
     * ignore null, undefined, function values
     */
    let val = error[key]
    if (val == null || typeof val === 'function') {
      return
    }

    if (typeof val === 'object') {
      if (typeof val.toISOString !== 'function') return
      val = val.toISOString()
    }
    properties[key] = val
    propertyFound = true
  })

  if (propertyFound) {
    return properties
  }
}

class ErrorLogging {
  constructor(apmServer, configService, transactionService) {
    this._apmServer = apmServer
    this._configService = configService
    this._transactionService = transactionService
  }

  /**
   * errorEvent = { message, filename, lineno, colno, error }
   */
  createErrorDataModel(errorEvent) {
    const frames = createStackTraces(stackParser, errorEvent)
    const filteredFrames = filterInvalidFrames(frames)

    // If filename empty, assume inline script
    let culprit = '(inline script)'
    const lastFrame = filteredFrames[filteredFrames.length - 1]
    if (lastFrame && lastFrame.filename) {
      culprit = lastFrame.filename
    }

    const { message, error } = errorEvent
    let errorMessage = message
    let errorType = ''
    let errorContext = {}
    if (error && typeof error === 'object') {
      errorMessage = errorMessage || error.message
      errorType = error.name
      const customProperties = getErrorProperties(error)
      if (customProperties) {
        errorContext.custom = customProperties
      }
    }

    if (!errorType) {
      /**
       * Try to extract type from message formatted like
       * 'ReferenceError: Can't find variable: initHighlighting'
       */
      if (errorMessage && errorMessage.indexOf(':') > -1) {
        errorType = errorMessage.split(':')[0]
      }
    }
    const currentTransaction = this._transactionService.getCurrentTransaction()
    const transactionContext = currentTransaction
      ? currentTransaction.context
      : {}
    // eslint-disable-next-line no-unused-vars
    const { tags, ...configContext } = this._configService.get('context')
    const pageContext = getPageContext()

    const context = merge(
      {},
      pageContext,
      transactionContext,
      configContext,
      errorContext
    )

    let errorObject = {
      id: generateRandomId(),
      culprit,
      exception: {
        message: errorMessage,
        stacktrace: filteredFrames,
        type: errorType
      },
      context
    }

    if (currentTransaction) {
      errorObject = extend(errorObject, {
        trace_id: currentTransaction.traceId,
        parent_id: currentTransaction.id,
        transaction_id: currentTransaction.id,
        transaction: {
          type: currentTransaction.type,
          sampled: currentTransaction.sampled
        }
      })
    }
    return truncateModel(ERROR_MODEL, errorObject)
  }

  logErrorEvent(errorEvent) {
    if (typeof errorEvent === 'undefined') {
      return
    }
    var errorObject = this.createErrorDataModel(errorEvent)
    if (typeof errorObject.exception.message === 'undefined') {
      return
    }

    this._apmServer.addError(errorObject)
  }

  registerListeners() {
    window.addEventListener('error', errorEvent =>
      this.logErrorEvent(errorEvent)
    )
    window.addEventListener('unhandledrejection', promiseRejectionEvent =>
      this.logPromiseEvent(promiseRejectionEvent)
    )
  }

  logPromiseEvent(promiseRejectionEvent) {
    let { reason } = promiseRejectionEvent
    if (reason == null) {
      reason = '<no reason specified>'
    }
    let errorEvent

    if (typeof reason.message === 'string') {
      /**
       * Promise is rejected with an error or error like object
       */
      const name = reason.name ? reason.name + ': ' : ''
      errorEvent = {
        error: reason,
        message: PROMISE_REJECTION_PREFIX + name + reason.message
      }
    } else {
      errorEvent = this._parseRejectReason(reason)
    }
    this.logErrorEvent(errorEvent)
  }

  logError(messageOrError) {
    let errorEvent = {}
    if (typeof messageOrError === 'string') {
      errorEvent.message = messageOrError
    } else {
      errorEvent.error = messageOrError
    }
    return this.logErrorEvent(errorEvent)
  }

  _parseRejectReason(reason) {
    const errorEvent = {
      message: PROMISE_REJECTION_PREFIX
    }

    if (Array.isArray(reason)) {
      errorEvent.message += '<object>'
    } else if (typeof reason === 'object') {
      try {
        errorEvent.message += JSON.stringify(reason)
        errorEvent.error = reason
      } catch (error) {
        // fallback. JSON.stringify can throw exceptions in different circumstances.
        // please, see this link for more info:
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#exceptions
        errorEvent.message += '<object>'
      }
    } else if (typeof reason === 'function') {
      errorEvent.message += '<function>'
    } else {
      errorEvent.message += reason
    }

    return errorEvent
  }
}

export default ErrorLogging
