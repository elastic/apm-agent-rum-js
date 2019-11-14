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

import { Promise } from 'es6-promise'
import Queue from './queue'
import throttle from './throttle'
import NDJSON from './ndjson'
import { XHR_IGNORE } from './patching/patch-utils'
import { truncateModel, METADATA_MODEL } from './truncate'
import { __DEV__ } from '../env'

class ApmServer {
  constructor(configService, loggingService) {
    this._configService = configService
    this._loggingService = loggingService

    this.errorQueue = undefined
    this.transactionQueue = undefined

    this.throttleAddError = undefined
    this.throttleAddTransaction = undefined

    this.initialized = false
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
    return this._makeHttpRequest('POST', endPoint, {
      payload,
      headers: {
        'Content-Type': 'application/x-ndjson'
      }
    }).then(({ responseText }) => responseText)
  }

  _constructError(reason) {
    const { url, status, responseText } = reason
    /**
     * The `reason` could be a different type, e.g. an Error
     */
    if (typeof status == 'undefined') {
      return reason
    }
    let message = url + ' HTTP status: ' + status
    if (__DEV__ && responseText) {
      try {
        const serverErrors = []
        const response = JSON.parse(responseText)
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(err => serverErrors.push(err.message))
          message += ' ' + serverErrors.join(',')
        }
      } catch (e) {
        this._loggingService.debug('Error parsing response from APM server', e)
      }
    }
    return new Error(message)
  }

  _makeHttpRequest(
    method,
    url,
    { timeout, payload, headers } = { timeout: 10000 }
  ) {
    return new Promise(function(resolve, reject) {
      var xhr = new window.XMLHttpRequest()
      xhr[XHR_IGNORE] = true
      xhr.open(method, url, true)
      xhr.timeout = timeout

      if (headers) {
        for (var header in headers) {
          if (headers.hasOwnProperty(header)) {
            xhr.setRequestHeader(header, headers[header])
          }
        }
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          const { status, responseText } = xhr
          // An http 4xx or 5xx error. Signal an error.
          if (status === 0 || (status > 399 && status < 600)) {
            reject({ url, status, responseText })
          } else {
            resolve(xhr)
          }
        }
      }

      xhr.onerror = () => {
        const { status, responseText } = xhr
        reject({ url, status, responseText })
      }
      xhr.send(payload)
    })
  }

  _createQueue(onFlush) {
    var queueLimit = this._configService.get('queueLimit')
    var flushInterval = this._configService.get('flushInterval')
    return new Queue(onFlush, { queueLimit, flushInterval })
  }

  fetchConfig(serviceName, environment) {
    const serverUrl = this._configService.get('serverUrl')
    var configEndpoint = `${serverUrl}/config/v1/agents`
    if (!serviceName) {
      return Promise.reject(
        'serviceName is required for fetching central config.'
      )
    }
    configEndpoint += `?service.name=${serviceName}`
    if (environment) {
      configEndpoint += `&service.environment=${environment}`
    }

    let localConfig = this._configService.getLocalConfig()
    if (localConfig) {
      configEndpoint += `&ifnonematch=${localConfig.etag}`
    }

    return this._makeHttpRequest('GET', configEndpoint, { timeout: 5000 })
      .then(xhr => {
        const { status, responseText } = xhr
        if (status === 304) {
          return localConfig
        } else {
          let remoteConfig = JSON.parse(responseText)
          const etag = xhr.getResponseHeader('etag')
          if (etag) {
            remoteConfig.etag = etag.replace(/["]/g, '')
            this._configService.setLocalConfig(remoteConfig)
          }
          return remoteConfig
        }
      })
      .catch(reason => {
        const error = this._constructError(reason)
        return Promise.reject(error)
      })
  }

  initErrorQueue() {
    if (this.errorQueue) {
      this.errorQueue.flush()
    }
    this.errorQueue = this._createQueue(errors => {
      var p = this.sendErrors(errors)
      if (p) {
        p.catch(reason => {
          this._loggingService.warn(
            'Failed sending errors!',
            this._constructError(reason)
          )
        })
      }
    })

    var limit = this._configService.get('errorThrottleLimit')
    var interval = this._configService.get('errorThrottleInterval')

    this.throttleAddError = throttle(
      this.errorQueue.add.bind(this.errorQueue),
      () => this._loggingService.warn('Dropped error due to throttling!'),
      { limit, interval }
    )
  }

  initTransactionQueue() {
    if (this.transactionQueue) {
      this.transactionQueue.flush()
    }
    this.transactionQueue = this._createQueue(transactions => {
      var p = this.sendTransactions(transactions)
      if (p) {
        p.catch(reason => {
          this._loggingService.warn(
            'Failed sending transactions!',
            this._constructError(reason)
          )
        })
      }
    })

    var limit = this._configService.get('transactionThrottleLimit')
    var interval = this._configService.get('transactionThrottleInterval')

    this.throttleAddTransaction = throttle(
      this.transactionQueue.add.bind(this.transactionQueue),
      () => this._loggingService.warn('Dropped transaction due to throttling!'),
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

  ndjsonErrors(errors) {
    return errors.map(error => NDJSON.stringify({ error }))
  }

  ndjsonMetricsets(metricsets) {
    return metricsets.map(metricset => NDJSON.stringify({ metricset })).join('')
  }

  ndjsonTransactions(transactions) {
    return transactions.map(tr => {
      let spans = ''
      if (tr.spans) {
        spans = tr.spans.map(span => NDJSON.stringify({ span })).join('')
        delete tr.spans
      }
      let breakdowns = ''
      if (tr.breakdown) {
        breakdowns = this.ndjsonMetricsets(tr.breakdown)
        delete tr.breakdown
      }

      return NDJSON.stringify({ transaction: tr }) + spans + breakdowns
    })
  }

  _send(data = [], type = 'transaction') {
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

    let ndjson
    if (type === 'errors') {
      ndjson = this.ndjsonErrors(filteredPayload.data)
    } else if (type === 'transaction') {
      ndjson = this.ndjsonTransactions(filteredPayload.data)
    } else {
      if (__DEV__) {
        this._loggingService.debug('Dropped payload due to unknown data type')
      }
      return
    }
    ndjson.unshift(
      NDJSON.stringify({ metadata: { service: filteredPayload.service } })
    )
    const ndjsonPayload = ndjson.join('')
    const endPoint = this._configService.getEndpointUrl()
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
