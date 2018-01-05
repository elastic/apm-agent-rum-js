class ApmBase {
  constructor (serviceFactory, disable) {
    this._disable = disable
    this.serviceFactory = serviceFactory
  }

  init (config) {
    if (this.isEnabled()) {
      var configService = this.serviceFactory.getService('ConfigService')
      configService.setConfig({
        agentName: 'elastic-apm-js-base',
        agentVersion: '%%agent-version%%'
      })
      configService.setConfig(config)
      var errorLogging = this.serviceFactory.getService('ErrorLogging')
      errorLogging.registerGlobalEventListener()

      var performanceMonitoring = this.serviceFactory.getService('PerformanceMonitoring')
      performanceMonitoring.init()

      var transactionService = this.serviceFactory.getService('TransactionService')
      window.addEventListener('load', function (event) {
        // to make sure PerformanceTiming.loadEventEnd has a value
        setTimeout(function () {
          // need to delegate sending navigation timing to the router liberay
          if (!configService.get('hasRouterLibrary')) {
            transactionService.sendPageLoadMetrics()
          }
        })
      })
    }
    return this
  }

  isEnabled () {
    return !this._disable
  }

  config (config) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.setConfig(config)
  }

  // Should call this method before 'load' event on window is fired
  setInitialPageLoadName (name) {
    if (this.isEnabled()) {
      var transactionService = this.serviceFactory.getService('TransactionService')
      transactionService.initialPageLoadName = name
    }
  }

  captureError (error) {
    if (this.isEnabled()) {
      var errorLogging = this.serviceFactory.getService('ErrorLogging')
      return errorLogging.logError(error)
    }
  }
}

module.exports = ApmBase
