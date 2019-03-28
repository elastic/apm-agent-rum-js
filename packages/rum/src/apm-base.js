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

class ApmBase {
  constructor({
    enabled,
    config,
    server,
    logger,
    transactionService,
    performance,
    errorLogger
  }) {
    this.enabled = enabled
    this._initialized = false
    this._config = config
    this._loggger = logger
    this._server = server
    this._transactionService = transactionService
    this._performance = performance
    this._errorLogger = errorLogger
  }

  init(config) {
    if (this.enabled && !this._initialized) {
      this.config(config)
      /**
       * Set the config that is sent via script attributes
       */
      this._config.init()
      /**
       * logger should reflect log level based on
       * config changes
       */
      const setLogLevel = () => {
        const { logLevel, debug } = this._config.config

        if (debug === true && logLevel !== 'trace') {
          this._loggger.setLevel('debug', false)
        } else {
          this._loggger.setLevel(logLevel, false)
        }
      }
      setLogLevel()
      this._config.subscribeToChange(() => setLogLevel())
      /**
       * Initialize the APM Server
       */
      this._server.init()
      /**
       * Register for window onerror to capture browser errors
       */
      this._errorLogger.registerGlobalEventListener()
      /**
       * Initialize the performance monitoring
       */
      this._performance.init()

      if (this._config.get('sendPageLoadTransaction')) {
        this._sendPageLoadMetrics()
      }
      this._initialized = true
    }
    return this
  }

  _sendPageLoadMetrics() {
    const pageLoadTransactionName = this._config.get('pageLoadTransactionName')

    const pageLoadTaskId = 'page-load'
    const transaction = this._transactionService.startTransaction(
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
    this._config.setConfig(config)
  }

  setUserContext(userContext) {
    this._config.setUserContext(userContext)
  }

  setCustomContext(customContext) {
    this._config.setCustomContext(customContext)
  }

  addTags(tags) {
    this._config.addTags(tags)
  }

  // Should call this method before 'load' event on window is fired
  setInitialPageLoadName(name) {
    if (this.enabled) {
      this._config.setConfig({
        pageLoadTransactionName: name
      })
    }
  }

  startTransaction(name, type) {
    if (this.enabled) {
      return this._transactionService.startTransaction(name, type)
    }
  }

  startSpan(name, type) {
    if (this.enabled) {
      return this._transactionService.startSpan(name, type)
    }
  }

  getCurrentTransaction() {
    if (this.enabled) {
      return this._transactionService.getCurrentTransaction()
    }
  }

  captureError(error) {
    if (this.enabled && this._initialized) {
      return this._errorLogger.logError(error)
    }
  }

  addFilter(fn) {
    this._config.addFilter(fn)
  }
}

module.exports = ApmBase
