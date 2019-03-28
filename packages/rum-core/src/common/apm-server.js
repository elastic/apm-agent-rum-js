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

const Queue = require('./queue')
const throttle = require('./throttle')
const { sanitizeString } = require('./utils')
const NDJSON = require('./ndjson')
const { XHR_IGNORE } = require('./patching/patch-utils')

class ApmServer {
  constructor(config, logger) {
    this._config = config
    this._logger = logger
    this.logMessages = {
      invalidConfig: { message: 'Configuration is invalid!', level: 'warn' }
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

  createServiceObject() {
    const cfg = this._config
    const stringLimit = cfg.get('serverStringLimit')

    const serviceObject = {
      name: sanitizeString(cfg.get('serviceName'), stringLimit, true),
      version: sanitizeString(cfg.get('serviceVersion'), stringLimit),
      agent: {
        name: sanitizeString(cfg.get('agentName'), stringLimit),
        version: sanitizeString(cfg.get('agentVersion'), stringLimit)
      },
      language: {
        name: 'javascript'
      },
      environment: sanitizeString(cfg.get('environment'), stringLimit)
    }
    return serviceObject
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
    var queueLimit = this._config.get('queueLimit')
    var flushInterval = this._config.get('flushInterval')
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
          apmServer._logger.warn('Failed sending errors!', reason)
        })
      }
    })

    var limit = apmServer._config.get('errorThrottleLimit')
    var interval = apmServer._config.get('errorThrottleInterval')

    this.throttleAddError = throttle(
      this.errorQueue.add.bind(this.errorQueue),
      function() {
        apmServer._logger.warn('Dropped error due to throttling!')
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
          apmServer._logger.warn('Failed sending transactions!', reason)
        })
      }
    })

    var limit = apmServer._config.get('transactionThrottleLimit')
    var interval = apmServer._config.get('transactionThrottleInterval')

    this.throttleAddTransaction = throttle(
      this.transactionQueue.add.bind(this.transactionQueue),
      function() {
        apmServer._logger.warn('Dropped transaction due to throttling!')
      },
      { limit, interval }
    )
  }

  addError(error) {
    if (this._config.isActive()) {
      if (!this.errorQueue) {
        this.initErrorQueue()
      }
      this.throttleAddError(error)
    }
  }

  addTransaction(transaction) {
    if (this._config.isActive()) {
      if (!this.transactionQueue) {
        this.initTransactionQueue()
      }
      this.throttleAddTransaction(transaction)
    }
  }

  warnOnce(logObject) {
    if (logObject.level === 'warn') {
      logObject.level = 'debug'
      this._logger.warn(logObject.message)
    } else {
      this._logger.debug(logObject.message)
    }
  }

  ndjsonErrors(errors) {
    return errors.map(function(error) {
      return NDJSON.stringify({ error })
    })
  }

  sendErrors(errors) {
    if (this._config.isValid() && this._config.isActive()) {
      if (errors && errors.length > 0) {
        const payload = {
          service: this.createServiceObject(),
          errors
        }
        const filteredPayload = this._config.applyFilters(payload)
        if (filteredPayload) {
          const endPoint = this._config.getEndpointUrl('errors')
          const ndjson = this.ndjsonErrors(filteredPayload.errors)
          ndjson.unshift(
            NDJSON.stringify({ metadata: { service: filteredPayload.service } })
          )
          const ndjsonPayload = ndjson.join('')
          return this._postJson(endPoint, ndjsonPayload)
        } else {
          this._logger.warn('Dropped payload due to filtering!')
        }
      }
    } else {
      this.warnOnce(this.logMessages.invalidConfig)
    }
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

  sendTransactions(transactions) {
    if (this._config.isValid() && this._config.isActive()) {
      if (transactions && transactions.length > 0) {
        const payload = {
          service: this.createServiceObject(),
          transactions
        }
        const filteredPayload = this._config.applyFilters(payload)
        if (filteredPayload) {
          const endPoint = this._config.getEndpointUrl('transactions')
          const ndjson = this.ndjsonTransactions(filteredPayload.transactions)
          ndjson.unshift(
            NDJSON.stringify({ metadata: { service: filteredPayload.service } })
          )
          const ndjsonPayload = ndjson.join('')
          return this._postJson(endPoint, ndjsonPayload)
        } else {
          this._logger.warn('Dropped payload due to filtering!')
        }
      }
    } else {
      this.warnOnce(this.logMessages.invalidConfig)
    }
  }
}

module.exports = ApmServer
