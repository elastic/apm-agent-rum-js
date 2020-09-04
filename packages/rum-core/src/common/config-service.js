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

import { getCurrentScript, setLabel, merge, extend } from './utils'
import EventHandler from './event-handler'
import { CONFIG_CHANGE, LOCAL_CONFIG_KEY } from './constants'

function getConfigFromScript() {
  var script = getCurrentScript()
  var config = getDataAttributesFromNode(script)
  return config
}

function getDataAttributesFromNode(node) {
  if (!node) {
    return {}
  }
  var dataAttrs = {}
  var dataRegex = /^data-([\w-]+)$/
  var attrs = node.attributes
  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i]
    if (dataRegex.test(attr.nodeName)) {
      var key = attr.nodeName.match(dataRegex)[1]

      // camelCase key
      var camelCasedkey = key
        .split('-')
        .map((value, index) => {
          return index > 0
            ? value.charAt(0).toUpperCase() + value.substring(1)
            : value
        })
        .join('')

      dataAttrs[camelCasedkey] = attr.value || attr.nodeValue
    }
  }

  return dataAttrs
}

class Config {
  constructor() {
    this.config = {
      serviceName: '',
      serviceVersion: '',
      environment: '',
      serverUrl: 'http://localhost:8200',
      active: true,
      instrument: true,
      disableInstrumentations: [],
      logLevel: 'warn',
      breakdownMetrics: false,
      ignoreTransactions: [],
      eventsLimit: 80,
      queueLimit: -1,
      flushInterval: 500,
      distributedTracing: true,
      distributedTracingOrigins: [],
      distributedTracingHeaderName: 'traceparent',
      pageLoadTraceId: '',
      pageLoadSpanId: '',
      pageLoadSampled: false,
      pageLoadTransactionName: '',
      transactionSampleRate: 1.0,
      centralConfig: false,
      monitorLongtasks: true,
      apiVersion: 2,
      context: {}
    }

    this.events = new EventHandler()
    this.filters = []
    /**
     * Packages that uses rum-core under the hood must override
     * the version via setVersion
     */
    this.version = ''
  }

  init() {
    var scriptData = getConfigFromScript()
    this.setConfig(scriptData)
  }

  setVersion(version) {
    this.version = version
  }

  addFilter(cb) {
    if (typeof cb !== 'function') {
      throw new Error('Argument to must be function')
    }
    this.filters.push(cb)
  }

  applyFilters(data) {
    for (var i = 0; i < this.filters.length; i++) {
      data = this.filters[i](data)
      if (!data) {
        return
      }
    }
    return data
  }

  get(key) {
    return key.split('.').reduce((obj, objKey) => {
      return obj && obj[objKey]
    }, this.config)
  }

  setUserContext(userContext = {}) {
    const context = {}
    const { id, username, email } = userContext

    if (typeof id === 'number' || typeof id === 'string') {
      context.id = id
    }
    if (typeof username === 'string') {
      context.username = username
    }
    if (typeof email === 'string') {
      context.email = email
    }
    this.config.context.user = extend(this.config.context.user || {}, context)
  }

  setCustomContext(customContext = {}) {
    this.config.context.custom = extend(
      this.config.context.custom || {},
      customContext
    )
  }

  addLabels(tags) {
    if (!this.config.context.tags) {
      this.config.context.tags = {}
    }
    var keys = Object.keys(tags)
    keys.forEach(k => setLabel(k, tags[k], this.config.context.tags))
  }

  setConfig(properties = {}) {
    /**
     * Normalize config
     *
     * Remove all trailing slash for serverUrl since SERVER_URL_PREFIX
     * already includes a forward slash for the path
     */
    if (properties.serverUrl) {
      properties.serverUrl = properties.serverUrl.replace(/\/+$/, '')
    }

    merge(this.config, properties)
    this.events.send(CONFIG_CHANGE, [this.config])
  }

  /**
   * Validate the config aganist the required parameters and
   * generates error messages with missing and invalid keys
   */
  validate(properties = {}) {
    const requiredKeys = ['serviceName', 'serverUrl']
    const errors = {
      missing: [],
      invalid: []
    }
    /**
     * Check when required keys are missing
     */
    Object.keys(properties).forEach(key => {
      if (requiredKeys.indexOf(key) !== -1 && !properties[key]) {
        errors.missing.push(key)
      }
    })
    /**
     * Invalid values on the config
     */
    if (
      properties.serviceName &&
      !/^[a-zA-Z0-9 _-]+$/.test(properties.serviceName)
    ) {
      errors.invalid.push({
        key: 'serviceName',
        value: properties.serviceName,
        allowed: 'a-z, A-Z, 0-9, _, -, <space>'
      })
    }

    const sampleRate = properties.transactionSampleRate
    if (
      typeof sampleRate !== 'undefined' &&
      (typeof sampleRate !== 'number' ||
        isNaN(sampleRate) ||
        sampleRate < 0 ||
        sampleRate > 1)
    ) {
      errors.invalid.push({
        key: 'transactionSampleRate',
        value: sampleRate,
        allowed: 'Number between 0 and 1'
      })
    }

    return errors
  }

  getLocalConfig() {
    let config = sessionStorage.getItem(LOCAL_CONFIG_KEY)
    if (config) {
      return JSON.parse(config)
    }
  }

  setLocalConfig(config) {
    if (config) {
      sessionStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(config))
    }
  }
}

export default Config
