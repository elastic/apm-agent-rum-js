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
import { ERRORS, TRANSACTIONS } from './constants'
import { noop } from './utils'
import { Promise } from './polyfills'
import {
  compressMetadata,
  compressTransaction,
  compressError,
  compressPayload
} from './compress'
import { __DEV__ } from '../state'

/**
 * Throttling interval defaults to 60 seconds
 */
const THROTTLE_INTERVAL = 60000

class ApmServer {
  constructor(configService, loggingService) {
    this._configService = configService
    this._loggingService = loggingService
    this.queue = undefined
    this.throttleEvents = noop
  }

  init() {
    const queueLimit = this._configService.get('queueLimit')
    const flushInterval = this._configService.get('flushInterval')
    const limit = this._configService.get('eventsLimit')

    const onFlush = events => {
      const promise = this.sendEvents(events)
      if (promise) {
        promise.catch(reason => {
          this._loggingService.warn(
            'Failed sending events!',
            this._constructError(reason)
          )
        })
      }
    }
    this.queue = new Queue(onFlush, { queueLimit, flushInterval })

    this.throttleEvents = throttle(
      this.queue.add.bind(this.queue),
      () => this._loggingService.warn('Dropped events due to throttling!'),
      { limit, interval: THROTTLE_INTERVAL }
    )
  }

  _postJson(endPoint, payload) {
    const headers = {
      'Content-Type': 'application/x-ndjson'
    }
    return compressPayload(payload, headers)
      .catch(error => {
        if (__DEV__) {
          this._loggingService.debug(
            'Compressing the payload using CompressionStream API failed',
            error.message
          )
        }
        return { payload, headers }
      })
      .then(result => this._makeHttpRequest('POST', endPoint, result))
      .then(({ responseText }) => responseText)
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

  _makeHttpRequest(method, url, { timeout = 10000, payload, headers } = {}) {
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

  fetchConfig(serviceName, environment) {
    const serverUrl = this._configService.get('serverUrl')
    var configEndpoint = `${serverUrl}/config/v1/rum/agents`
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

  createMetaData() {
    const cfg = this._configService
    const metadata = {
      service: {
        name: cfg.get('serviceName'),
        version: cfg.get('serviceVersion'),
        agent: {
          name: 'rum-js',
          version: cfg.version
        },
        language: {
          name: 'javascript'
        },
        environment: cfg.get('environment')
      },
      labels: cfg.get('context.tags')
    }
    return truncateModel(METADATA_MODEL, metadata)
  }

  addError(error) {
    this.throttleEvents({ [ERRORS]: error })
  }

  addTransaction(transaction) {
    this.throttleEvents({ [TRANSACTIONS]: transaction })
  }

  ndjsonErrors(errors, compress) {
    const key = compress ? 'e' : 'error'
    return errors.map(error =>
      NDJSON.stringify({
        [key]: compress ? compressError(error) : error
      })
    )
  }

  ndjsonMetricsets(metricsets) {
    return metricsets.map(metricset => NDJSON.stringify({ metricset })).join('')
  }

  ndjsonTransactions(transactions, compress) {
    const key = compress ? 'x' : 'transaction'

    return transactions.map(tr => {
      let spans = '',
        breakdowns = ''

      if (!compress) {
        if (tr.spans) {
          spans = tr.spans.map(span => NDJSON.stringify({ span })).join('')
          delete tr.spans
        }
        if (tr.breakdown) {
          breakdowns = this.ndjsonMetricsets(tr.breakdown)
          delete tr.breakdown
        }
      }

      return (
        NDJSON.stringify({ [key]: compress ? compressTransaction(tr) : tr }) +
        spans +
        breakdowns
      )
    })
  }

  sendEvents(events) {
    if (events.length === 0) {
      return
    }
    const transactions = []
    const errors = []
    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      if (event[TRANSACTIONS]) {
        transactions.push(event[TRANSACTIONS])
      }
      if (event[ERRORS]) {
        errors.push(event[ERRORS])
      }
    }
    if (transactions.length === 0 && errors.length === 0) {
      return
    }

    const cfg = this._configService
    const payload = {
      [TRANSACTIONS]: transactions,
      [ERRORS]: errors
    }
    const filteredPayload = cfg.applyFilters(payload)
    if (!filteredPayload) {
      this._loggingService.warn('Dropped payload due to filtering!')
      return
    }

    const apiVersion = cfg.get('apiVersion')
    /**
     * Enable payload compression only when API version is > 2
     */
    const compress = apiVersion > 2

    let ndjson = []
    const metadata = this.createMetaData()
    const metadataKey = compress ? 'm' : 'metadata'

    ndjson.push(
      NDJSON.stringify({
        [metadataKey]: compress ? compressMetadata(metadata) : metadata
      })
    )

    ndjson = ndjson.concat(
      this.ndjsonErrors(filteredPayload[ERRORS], compress),
      this.ndjsonTransactions(filteredPayload[TRANSACTIONS], compress)
    )
    const ndjsonPayload = ndjson.join('')
    const endPoint = cfg.get('serverUrl') + `/intake/v${apiVersion}/rum/events`
    return this._postJson(endPoint, ndjsonPayload)
  }
}

export default ApmServer
