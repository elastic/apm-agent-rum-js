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

import Queue from './queue'
import throttle from './throttle'
import NDJSON from './ndjson'
import { XHR_IGNORE } from './patching/patch-utils'
import { truncateModel, METADATA_MODEL } from './truncate'

class ApmServer {
  constructor(configService, loggingService) {
    this._configService = configService
    this._loggingService = loggingService
    this.logMessages = {
      invalidConfig: {
        message: 'RUM agent configuration is invalid!',
        level: 'warn'
      }
    }

    this.errorQueue = undefined
    this.transactionQueue = undefined

    this.throttleAddError = undefined
    this.throttleAddTransaction = undefined

    this.initialized = false
    this.ndjsonSpan = {}
  }

  init() {
    if (this.initialized) {
      return
    }
    this.initialized = true

    this.initErrorQueue()
    this.initTransactionQueue()
  }

  createMetaData() {
    const cfg = this._configService
    const metadata = {
      service: {
        name: cfg.get('serviceName'),
        version: cfg.get('serviceVersion'),
        agent: {
          name: 'js-base',
          version: cfg.version
        },
        language: {
          name: 'javascript'
        },
        environment: cfg.get('environment')
      }
    }
    return truncateModel(METADATA_MODEL, metadata)
  }

  _postJson(endPoint, payload) {
    return this._makeHttpRequest('POST', endPoint, payload, {
      'Content-Type': 'application/x-ndjson'
    })
  }

  _makeHttpRequest(method, url, payload, headers) {
    return new Promise(function(resolve, reject) {
      var xhr = new window.XMLHttpRequest()
      xhr[XHR_IGNORE] = true
      xhr.open(method, url, true)
      xhr.timeout = 10000

      if (headers) {
        for (var header in headers) {
          if (headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header, headers[header])
          }
        }
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          var status = xhr.status
          if (status === 0 || (status > 399 && status < 600)) {
            // An http 4xx or 5xx error. Signal an error.
            var err = new Error(url + ' HTTP status: ' + status)
            err.xhr = xhr
            reject(err)
          } else {
            resolve(xhr.responseText)
          }
        }
      }

      xhr.onerror = function(err) {
        reject(err)
      }

      xhr.send(payload)
    })
  }

  _createQueue(onFlush) {
    var queueLimit = this._configService.get('queueLimit')
    var flushInterval = this._configService.get('flushInterval')
    return new Queue(onFlush, { queueLimit, flushInterval })
  }

  initErrorQueue() {
    var apmServer = this
    if (this.errorQueue) {
      this.errorQueue.flush()
    }
    this.errorQueue = this._createQueue(function(errors) {
      var p = apmServer.sendErrors(errors)
      if (p) {
        p.then(undefined, function(reason) {
          apmServer._loggingService.warn('Failed sending errors!', reason)
        })
      }
    })

    var limit = apmServer._configService.get('errorThrottleLimit')
    var interval = apmServer._configService.get('errorThrottleInterval')

    this.throttleAddError = throttle(
      this.errorQueue.add.bind(this.errorQueue),
      function() {
        apmServer._loggingService.warn('Dropped error due to throttling!')
      },
      { limit, interval }
    )
  }

  initTransactionQueue() {
    var apmServer = this
    if (this.transactionQueue) {
      this.transactionQueue.flush()
    }
    this.transactionQueue = this._createQueue(function(transactions) {
      var p = apmServer.sendTransactions(transactions)
      if (p) {
        p.then(undefined, function(reason) {
          apmServer._loggingService.warn('Failed sending transactions!', reason)
        })
      }
    })

    var limit = apmServer._configService.get('transactionThrottleLimit')
    var interval = apmServer._configService.get('transactionThrottleInterval')

    this.throttleAddTransaction = throttle(
      this.transactionQueue.add.bind(this.transactionQueue),
      function() {
        apmServer._loggingService.warn('Dropped transaction due to throttling!')
      },
      { limit, interval }
    )
  }

  addError(error) {
    if (!this.errorQueue) {
      this.initErrorQueue()
    }
    this.throttleAddError(error)
  }

  addTransaction(transaction) {
    if (!this.transactionQueue) {
      this.initTransactionQueue()
    }
    this.throttleAddTransaction(transaction)
  }

  warnOnce(logObject) {
    if (logObject.level === 'warn') {
      logObject.level = 'debug'
      this._loggingService.warn(logObject.message)
    } else {
      this._loggingService.debug(logObject.message)
    }
  }

  ndjsonErrors(errors) {
    return errors.map(function(error) {
      return NDJSON.stringify({ error })
    })
  }

  ndjsonTransactions(transactions) {
    var ndjsonSpan = this.ndjsonSpan
    return transactions.map(function(tr) {
      var spans = ''
      if (tr.spans) {
        spans = tr.spans
          .map(function(sp) {
            ndjsonSpan.span = sp
            return NDJSON.stringify(ndjsonSpan)
          })
          .join('')
        delete tr.spans
      }
      return NDJSON.stringify({ transaction: tr }) + spans
    })
  }

  _send(data = [], type = 'transaction') {
    if (!this._configService.isValid()) {
      this.warnOnce(this.logMessages.invalidConfig)
      return
    }
    if (data.length === 0) {
      return
    }
    const { service } = this.createMetaData()
    const payload = { service, data }

    const filteredPayload = this._configService.applyFilters(payload)
    if (!filteredPayload) {
      this._loggingService.warn('Dropped payload due to filtering!')
      return
    }

    const endPoint = this._configService.getEndpointUrl()
    let ndjson
    if (type === 'errors') {
      ndjson = this.ndjsonErrors(filteredPayload.data)
    } else if (type === 'transaction') {
      ndjson = this.ndjsonTransactions(filteredPayload.data)
    } else {
      this._loggingService.debug('Dropped payload due to unknown data type ')
      return
    }
    ndjson.unshift(
      NDJSON.stringify({ metadata: { service: filteredPayload.service } })
    )
    const ndjsonPayload = ndjson.join('')
    return this._postJson(endPoint, ndjsonPayload)
  }

  sendTransactions(transactions) {
    return this._send(transactions)
  }

  sendErrors(errors) {
    return this._send(errors, 'errors')
  }
}

export default ApmServer
