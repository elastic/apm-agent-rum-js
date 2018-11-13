class ApmBase {
  constructor (serviceFactory, disable) {
    this._disable = disable
    this.serviceFactory = serviceFactory
    this._initialized = false
  }

  init (config) {
    if (this.isEnabled() && !this._initialized) {
      this._initialized = true
      var configService = this.serviceFactory.getService('ConfigService')
      configService.setConfig({
        agentName: 'js-base',
        agentVersion: '%%agent-version%%'
      })
      configService.setConfig(config)
      this.serviceFactory.init()
      var errorLogging = this.serviceFactory.getService('ErrorLogging')
      errorLogging.registerGlobalEventListener()

      var performanceMonitoring = this.serviceFactory.getService('PerformanceMonitoring')
      performanceMonitoring.init()

      if (configService.get('sendPageLoadTransaction')) {
        this._sendPageLoadMetrics()
      }
    }
    return this
  }

  _sendPageLoadMetrics () {
    var transactionService = this.serviceFactory.getService('TransactionService')
    var configService = this.serviceFactory.getService('ConfigService')

    var tr = transactionService.startTransaction(
      configService.get('pageLoadTransactionName'),
      'page-load'
    )
    var sendPageLoadMetrics = function sendPageLoadMetrics () {
      // to make sure PerformanceTiming.loadEventEnd has a value
      setTimeout(function () {
        if (tr) {
          tr.detectFinish()
        }
      })
    }

    if (document.readyState === 'complete') {
      sendPageLoadMetrics()
    } else {
      window.addEventListener('load', sendPageLoadMetrics)
    }
  }

  isEnabled () {
    return !this._disable
  }

  config (config) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.setConfig(config)
  }

  setUserContext (userContext) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.setUserContext(userContext)
  }

  setCustomContext (customContext) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.setCustomContext(customContext)
  }

  setTags (tags) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.setTags(tags)
  }

  // Should call this method before 'load' event on window is fired
  setInitialPageLoadName (name) {
    if (this.isEnabled()) {
      var configService = this.serviceFactory.getService('ConfigService')
      configService.setConfig({
        pageLoadTransactionName: name
      })
    }
  }

  startTransaction (name, type) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService('TransactionService')
      return transactionService.startTransaction(name, type)
    }
  }

  startSpan (name, type) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService('TransactionService')
      return transactionService.startSpan(name, type)
    }
  }

  getCurrentTransaction () {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService('TransactionService')
      return transactionService.getCurrentTransaction()
    }
  }

  getTransactionService () {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService('TransactionService')
      return transactionService
    }
  }

  captureError (error) {
    if (this.isEnabled()) {
      var errorLogging = this.serviceFactory.getService('ErrorLogging')
      return errorLogging.logError(error)
    }
  }

  addFilter (fn) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.addFilter(fn)
  }
}

module.exports = ApmBase
