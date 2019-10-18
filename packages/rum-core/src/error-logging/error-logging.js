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
import {
  getPageMetadata,
  generateRandomId,
  merge,
  extend
} from '../common/utils'
import { truncateModel, ERROR_MODEL } from '../common/truncate'

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
    const frames = createStackTraces(errorEvent)
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
      errorContext = this._getErrorProperties(error)
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
    const configContext = this._configService.get('context')
    const pageMetadata = getPageMetadata()

    const context = merge(
      {},
      pageMetadata,
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

  logErrorEvent(errorEvent, sendImmediately) {
    if (typeof errorEvent === 'undefined') {
      return
    }
    var errorObject = this.createErrorDataModel(errorEvent)
    if (typeof errorObject.exception.message === 'undefined') {
      return
    }
    if (sendImmediately) {
      return this._apmServer.sendErrors([errorObject])
    } else {
      return this._apmServer.addError(errorObject)
    }
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
    const prefix = 'Unhandled promise rejection: '
    const { reason } = promiseRejectionEvent

    if (reason == null) {
      this.logError(prefix + '<no reason specified>')
    } else if (typeof reason.message === 'string') {
      /**
       * Promise is rejected with an error or error like object
       */
      this.logError({
        message: prefix + reason.message,
        stack: reason.stack ? reason.stack : null
      })
    } else if (typeof reason !== 'object') {
      this.logError(prefix + reason)
    }
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

  _getErrorProperties(error) {
    const properties = {}
    Object.keys(error).forEach(function(key) {
      if (key === 'stack') return
      let val = error[key]
      if (val === null) return // null is typeof object and well break the switch below
      switch (typeof val) {
        case 'function':
          return
        case 'object':
          // ignore all objects except Dates
          if (typeof val.toISOString !== 'function') return
          val = val.toISOString()
      }
      properties[key] = val
    })
    return properties
  }
}

export default ErrorLogging
