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
  getInstrumentationFlags,
  PAGE_LOAD_DELAY,
  PAGE_LOAD,
  ERROR,
  CONFIG_SERVICE,
  LOGGING_SERVICE,
  TRANSACTION_SERVICE,
  PERFORMANCE_MONITORING,
  ERROR_LOGGING,
  APM_SERVER,
  EVENT_TARGET,
  CLICK,
  observePageVisibility,
  observePageClicks,
  observeUserInteractions
} from '@elastic/apm-rum-core'

export default class ApmBase {
  constructor(serviceFactory, disable) {
    this._disable = disable
    this.serviceFactory = serviceFactory
    this._initialized = false
  }

  isEnabled() {
    return !this._disable
  }

  isActive() {
    const configService = this.serviceFactory.getService(CONFIG_SERVICE)
    return this.isEnabled() && this._initialized && configService.get('active')
  }

  init(config) {
    if (this.isEnabled() && !this._initialized) {
      this._initialized = true
      const [
        configService,
        loggingService,
        transactionService
      ] = this.serviceFactory.getService([
        CONFIG_SERVICE,
        LOGGING_SERVICE,
        TRANSACTION_SERVICE
      ])
      /**
       * Set Agent version to be sent as part of metadata to the APM Server
       */
      configService.setVersion('5.16.1')
      this.config(config)
      /**
       * Set level here to account for both active and inactive cases
       */
      const logLevel = configService.get('logLevel')
      loggingService.setLevel(logLevel)
      /**
       * Deactive agent when the active config flag is set to false
       */
      const isConfigActive = configService.get('active')
      if (isConfigActive) {
        this.serviceFactory.init()

        const flags = getInstrumentationFlags(
          configService.get('instrument'),
          configService.get('disableInstrumentations')
        )

        const performanceMonitoring = this.serviceFactory.getService(
          PERFORMANCE_MONITORING
        )
        performanceMonitoring.init(flags)

        if (flags[ERROR]) {
          const errorLogging = this.serviceFactory.getService(ERROR_LOGGING)
          errorLogging.registerListeners()
        }

        if (configService.get('session')) {
          let localConfig = configService.getLocalConfig()
          if (localConfig && localConfig.session) {
            configService.setConfig({
              session: localConfig.session
            })
          }
        }

        const sendPageLoad = () =>
          flags[PAGE_LOAD] && this._sendPageLoadMetrics()

        if (configService.get('centralConfig')) {
          /**
           * Waiting for the remote config before sending the page load transaction
           */
          this.fetchCentralConfig().then(sendPageLoad)
        } else {
          sendPageLoad()
        }

        observePageVisibility(configService, transactionService)
        if (flags[EVENT_TARGET] && flags[CLICK]) {
          observePageClicks(transactionService)
        }
        observeUserInteractions()
      } else {
        this._disable = true
        loggingService.warn('RUM agent is inactive')
      }
    }
    return this
  }

  /**
   * `fetchCentralConfig` returns a promise that will always resolve
   * if the internal config fetch fails the the promise resolves to `undefined` otherwise
   * it resolves to the fetched config.
   */
  fetchCentralConfig() {
    const [
      apmServer,
      loggingService,
      configService
    ] = this.serviceFactory.getService([
      APM_SERVER,
      LOGGING_SERVICE,
      CONFIG_SERVICE
    ])

    return apmServer
      .fetchConfig(
        configService.get('serviceName'),
        configService.get('environment')
      )
      .then(config => {
        var transactionSampleRate = config['transaction_sample_rate']
        if (transactionSampleRate) {
          transactionSampleRate = Number(transactionSampleRate)
          const config = { transactionSampleRate }
          const { invalid } = configService.validate(config)
          if (invalid.length === 0) {
            configService.setConfig(config)
          } else {
            const { key, value, allowed } = invalid[0]
            loggingService.warn(
              `invalid value "${value}" for ${key}. Allowed: ${allowed}.`
            )
          }
        }
        return config
      })
      .catch(error => {
        loggingService.warn('failed fetching config:', error)
      })
  }

  _sendPageLoadMetrics() {
    /**
     * Name of the transaction is set in transaction service to
     * avoid duplicating the logic at multiple places
     */
    const tr = this.startTransaction(undefined, PAGE_LOAD, {
      managed: true,
      canReuse: true
    })

    if (!tr) {
      return
    }

    tr.addTask(PAGE_LOAD)
    const sendPageLoadMetrics = () => {
      // The reasons of this timeout are:
      // 1. to make sure PerformanceTiming.loadEventEnd has a value.
      // 2. to make sure the agent intercepts all the LCP entries triggered by the browser (adding a delay in the timeout).
      // The browser might need more time after the pageload event to render other elements (e.g. images).
      // That's important because a LCP is only triggered when the related element is completely rendered.
      // https://w3c.github.io/largest-contentful-paint/#sec-add-lcp-entry
      setTimeout(() => tr.removeTask(PAGE_LOAD), PAGE_LOAD_DELAY)
    }

    if (document.readyState === 'complete') {
      sendPageLoadMetrics()
    } else {
      window.addEventListener('load', sendPageLoadMetrics)
    }
  }

  observe(name, fn) {
    const configService = this.serviceFactory.getService(CONFIG_SERVICE)
    configService.events.observe(name, fn)
  }

  /**
   * When the required config keys are invalid, the agent is deactivated with
   * logging error to the console
   *
   * validation error format
   * {
   *  missing: [ 'key1', 'key2'],
   *  invalid: [{
   *    key: 'a',
   *    value: 'abcd',
   *    allowed: 'string'
   *  }],
   *  unknown: ['key3', 'key4']
   * }
   */
  config(config) {
    const [configService, loggingService] = this.serviceFactory.getService([
      CONFIG_SERVICE,
      LOGGING_SERVICE
    ])
    const { missing, invalid, unknown } = configService.validate(config)
    if (unknown.length > 0) {
      const message =
        'Unknown config options are specified for RUM agent: ' +
        unknown.join(', ')
      loggingService.warn(message)
    }

    if (missing.length === 0 && invalid.length === 0) {
      configService.setConfig(config)
    } else {
      const separator = ', '
      let message = "RUM agent isn't correctly configured. "

      if (missing.length > 0) {
        message += missing.join(separator) + ' is missing'
        if (invalid.length > 0) {
          message += separator
        }
      }

      invalid.forEach(({ key, value, allowed }, index) => {
        message +=
          `${key} "${value}" contains invalid characters! (allowed: ${allowed})` +
          (index !== invalid.length - 1 ? separator : '')
      })
      loggingService.error(message)
      configService.setConfig({ active: false })
    }
  }

  setUserContext(userContext) {
    var configService = this.serviceFactory.getService(CONFIG_SERVICE)
    configService.setUserContext(userContext)
  }

  setCustomContext(customContext) {
    var configService = this.serviceFactory.getService(CONFIG_SERVICE)
    configService.setCustomContext(customContext)
  }

  addLabels(labels) {
    var configService = this.serviceFactory.getService(CONFIG_SERVICE)
    configService.addLabels(labels)
  }

  // Should call this method before 'load' event on window is fired
  setInitialPageLoadName(name) {
    const configService = this.serviceFactory.getService(CONFIG_SERVICE)
    configService.setConfig({
      pageLoadTransactionName: name
    })
  }

  startTransaction(name, type, options) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(
        TRANSACTION_SERVICE
      )
      return transactionService.startTransaction(name, type, options)
    }
  }

  startSpan(name, type, options) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(
        TRANSACTION_SERVICE
      )
      return transactionService.startSpan(name, type, options)
    }
  }

  getCurrentTransaction() {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService(
        TRANSACTION_SERVICE
      )
      return transactionService.getCurrentTransaction()
    }
  }

  captureError(error) {
    if (this.isEnabled()) {
      var errorLogging = this.serviceFactory.getService(ERROR_LOGGING)
      return errorLogging.logError(error)
    }
  }

  addFilter(fn) {
    var configService = this.serviceFactory.getService(CONFIG_SERVICE)
    configService.addFilter(fn)
  }
}
