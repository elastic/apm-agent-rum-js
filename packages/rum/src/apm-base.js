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

const {
  ApmServer,
  ErrorLogging,
  ConfigService,
  LoggingService,
  TransactionService,
  PerformanceMonitoring
} = require('@elastic/apm-rum-core')

class ApmBase {
  constructor(enabled) {
    this.enabled = enabled
    this._initialized = false
    this.configService = new ConfigService()
    /**
     * Initialize Logging service which reflects log level based on
     * config changes
     */
    this.loggingService = new LoggingService()

    const setLogLevel = () => {
      const { logLevel, debug } = this.configService.config

      if (debug === true && logLevel !== 'trace') {
        this.loggingService.setLevel('debug', false)
      } else {
        this.loggingService.setLevel(logLevel, false)
      }
    }
    setLogLevel()
    this.configService.subscribeToChange(() => setLogLevel())

    /**
     * Below instances gets assigned only after the initialization
     */
    this.transactionService = undefined
    this.errorLogging = undefined
  }

  init(config) {
    if (this.enabled && !this._initialized) {
      this.configService.setConfig(config)
      this._initialized = true
      /**
       * Set the config that is sent via script attributes
       */
      this.configService.init()

      /**
       * Initialize the APM Server
       */
      const apmServer = new ApmServer(this.configService, this.loggingService)
      apmServer.init()

      /**
       * Intialize  the transaction service
       */
      this.transactionService = new TransactionService(
        this.loggingService,
        this.configService
      )

      /**
       * Register for window onerror to capture browser errors
       */
      this.errorLogging = new ErrorLogging(
        apmServer,
        this.configService,
        this.loggingService,
        this.transactionService
      )
      this.errorLogging.registerGlobalEventListener()

      const performanceMonitoring = new PerformanceMonitoring(
        apmServer,
        this.configService,
        this.loggingService,
        this.transactionService
      )
      performanceMonitoring.init()

      if (this.configService.get('sendPageLoadTransaction')) {
        this._sendPageLoadMetrics()
      }
    }
    return this
  }

  _sendPageLoadMetrics() {
    const pageLoadTransactionName = this.configService.get(
      'pageLoadTransactionName'
    )

    const pageLoadTaskId = 'page-load'
    const transaction = this.transactionService.startTransaction(
      pageLoadTransactionName,
      pageLoadTaskId
    )

    if (transaction) {
      transaction.addTask(pageLoadTaskId)
    }
    const sendPageLoadMetrics = function sendPageLoadMetrics() {
      // to make sure PerformanceTiming.loadEventEnd has a value
      setTimeout(function() {
        if (transaction) {
          transaction.removeTask(pageLoadTaskId)
        }
      })
    }

    if (document.readyState === 'complete') {
      sendPageLoadMetrics()
    } else {
      window.addEventListener('load', sendPageLoadMetrics)
    }
  }

  config(config) {
    this.configService.setConfig(config)
  }

  setUserContext(userContext) {
    this.configService.setUserContext(userContext)
  }

  setCustomContext(customContext) {
    this.configService.setCustomContext(customContext)
  }

  addTags(tags) {
    this.configService.addTags(tags)
  }

  // Should call this method before 'load' event on window is fired
  setInitialPageLoadName(name) {
    if (this.enabled) {
      this.configService.setConfig({
        pageLoadTransactionName: name
      })
    }
  }

  startTransaction(name, type) {
    if (this.enabled) {
      return this.transactionService.startTransaction(name, type)
    }
  }

  startSpan(name, type) {
    if (this.enabled) {
      return this.transactionService.startSpan(name, type)
    }
  }

  getCurrentTransaction() {
    if (this.enabled) {
      return this.transactionService.getCurrentTransaction()
    }
  }

  captureError(error) {
    if (this.enabled && this._initialized) {
      return this.errorLogging.logError(error)
    }
  }

  addFilter(fn) {
    this.configService.addFilter(fn)
  }
}

module.exports = ApmBase
