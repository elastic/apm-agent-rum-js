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

const ApmServer = require('./apm-server')
const ConfigService = require('./config-service')
const LoggingService = require('./logging-service')

const patchUtils = require('./patching/patch-utils')
const utils = require('./utils')

class ServiceFactory {
  constructor () {
    this._serviceCreators = {}
    this._serviceInstances = {}
    this.initialized = false
  }

  registerCoreServices () {
    var serviceFactory = this

    this.registerServiceCreator('ConfigService', function () {
      return new ConfigService()
    })
    this.registerServiceCreator('LoggingService', function () {
      return new LoggingService()
    })
    this.registerServiceCreator('ApmServer', function () {
      return new ApmServer(
        serviceFactory.getService('ConfigService'),
        serviceFactory.getService('LoggingService')
      )
    })

    this.registerServiceInstance('PatchUtils', patchUtils)
    this.registerServiceInstance('Utils', utils)
  }
  init () {
    if (this.initialized) {
      return
    }
    this.initialized = true
    var serviceFactory = this

    var configService = serviceFactory.getService('ConfigService')
    configService.init()
    var loggingService = serviceFactory.getService('LoggingService')

    function setLogLevel (loggingService, configService) {
      if (configService.get('debug') === true && configService.config.logLevel !== 'trace') {
        loggingService.setLevel('debug', false)
      } else {
        loggingService.setLevel(configService.get('logLevel'), false)
      }
    }

    setLogLevel(loggingService, configService)
    configService.subscribeToChange(function () {
      setLogLevel(loggingService, configService)
    })

    var apmServer = serviceFactory.getService('ApmServer')
    apmServer.init()
  }

  registerServiceCreator (name, creator) {
    this._serviceCreators[name] = creator
  }

  registerServiceInstance (name, instance) {
    this._serviceInstances[name] = instance
  }

  getService (name) {
    if (!this._serviceInstances[name]) {
      if (typeof this._serviceCreators[name] === 'function') {
        this._serviceInstances[name] = this._serviceCreators[name](this)
      } else {
        throw new Error('Can not get service, No creator for: ' + name)
      }
    }
    return this._serviceInstances[name]
  }
}

module.exports = ServiceFactory
