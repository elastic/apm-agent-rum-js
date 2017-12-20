var apmCore = require('elastic-apm-js-core')
require('elastic-apm-js-zone')
apmCore.patchCommon()

class ApmBase {
  constructor (serviceFactory) {
    this.serviceFactory = serviceFactory || apmCore.createServiceFactory()
    this.configService = this.serviceFactory.getService('ConfigService')
  }

  init (config) {
    var configService = this.serviceFactory.getService('ConfigService')
    configService.setConfig({
      agentName: 'elastic-apm-js-base',
      agentVersion: '%%agent-version%%'
    })
    configService.setConfig(config)
    var errorLogging = this.serviceFactory.getService('ErrorLogging')
    errorLogging.registerGlobalEventListener()

    // this.serviceFactory.registerServiceInstance('ApmBase', this)
    // var enabled
    // if (!inBrowser()) {
    //   logger.warn('APM: Only enabled in browser.')
    //   enabled = false
    // } else if (!configService.isPlatformSupported()) {
    //   logger.warn('APM: Browser is not supported.')
    //   enabled = false
    // } else {
    //   enabled = true
    //   require('opbeat-zone')
    // }

    // if (!enabled) {
    //   return false
    // }

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

    return this
  }

  config (config) {
    this.configService.setConfig(config)
  }
  // Should call this method before 'load' event on window is fired
  setInitialPageLoadName (name) {
    var transactionService = this.serviceFactory.getService('TransactionService')
    transactionService.initialPageLoadName = name
  }
}

// function inBrowser () {
//   return typeof window !== 'undefined'
// }

module.exports = ApmBase
