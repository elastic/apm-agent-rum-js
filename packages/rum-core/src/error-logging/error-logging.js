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
import { getPageMetadata, generateRandomId, merge } from '../common/utils'
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

    const message =
      errorEvent.message || (errorEvent.error && errorEvent.error.message)
    let errorType = errorEvent.error ? errorEvent.error.name : ''
    if (!errorType) {
      /**
       * Try to extract type from message formatted like
       * 'ReferenceError: Can't find variable: initHighlighting'
       */
      if (message && message.indexOf(':') > -1) {
        errorType = message.split(':')[0]
      }
    }

    const configContext = this._configService.get('context')
    let errorContext
    if (typeof errorEvent.error === 'object') {
      errorContext = this._getErrorProperties(errorEvent.error)
    }
    const browserMetadata = getPageMetadata()
    const context = merge({}, browserMetadata, configContext, errorContext)

    const errorObject = {
      id: generateRandomId(),
      culprit,
      exception: {
        message,
        stacktrace: filteredFrames,
        type: errorType
      },
      context
    }

    const currentTransaction = this._transactionService.getCurrentTransaction()
    if (currentTransaction) {
      errorObject.trace_id = currentTransaction.traceId
      errorObject.parent_id = currentTransaction.id
      errorObject.transaction_id = currentTransaction.id
      errorObject.transaction = {
        type: currentTransaction.type,
        sampled: currentTransaction.sampled
      }
    }
    return truncateModel(ERROR_MODEL, errorObject)
  }

  logErrorEvent(errorEvent, sendImmediately) {
    if (this._configService.isActive()) {
      if (typeof errorEvent === 'undefined') {
        return
      }
      const errorObject = this.createErrorDataModel(errorEvent)
      if (typeof errorObject.exception.message === 'undefined') {
        return
      }
      if (sendImmediately) {
        return this._apmServer.sendErrors([errorObject])
      } else {
        return this._apmServer.addError(errorObject)
      }
    }
  }

  registerGlobalEventListener() {
    window.onerror = (messageOrEvent, source, lineno, colno, error) => {
      let errorEvent
      if (
        typeof messageOrEvent !== 'undefined' &&
        typeof messageOrEvent !== 'string'
      ) {
        errorEvent = messageOrEvent
      } else {
        errorEvent = {
          message: messageOrEvent,
          filename: source,
          lineno,
          colno,
          error
        }
      }
      this.logErrorEvent(errorEvent)
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
