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

import ApmServer from './apm-server'
import ConfigService from './config-service'
import LoggingService from './logging-service'
import {
  CONFIG_CHANGE,
  CONFIG_SERVICE,
  LOGGING_SERVICE,
  APM_SERVER
} from './constants'

class ServiceFactory {
  constructor() {
    this._creators = {
      [CONFIG_SERVICE]: () => new ConfigService(),
      [LOGGING_SERVICE]: () =>
        new LoggingService({
          prefix: '[Elastic APM] '
        }),
      [APM_SERVER]: () => {
        return new ApmServer(
          this.getService(CONFIG_SERVICE),
          this.getService(LOGGING_SERVICE)
        )
      }
    }
    this._instances = {}
    this.initialized = false
  }

  init() {
    if (this.initialized) {
      return
    }
    this.initialized = true
    const configService = this.getService(CONFIG_SERVICE)
    configService.init()
    const loggingService = this.getService(LOGGING_SERVICE)

    function setLogLevel(loggingService, configService) {
      const logLevel = configService.get('logLevel')
      loggingService.setLevel(logLevel)
    }

    setLogLevel(loggingService, configService)
    configService.events.observe(CONFIG_CHANGE, function() {
      setLogLevel(loggingService, configService)
    })

    const apmServer = this.getService(APM_SERVER)
    apmServer.init()
  }

  registerServiceCreator(name, creator) {
    this._creators[name] = creator
  }

  registerServiceInstance(name, instance) {
    this._instances[name] = instance
  }

  getService(name) {
    if (!this._instances[name]) {
      if (typeof this._creators[name] === 'function') {
        this._instances[name] = this._creators[name](this)
      } else {
        throw new Error('Can not get service, No creator for: ' + name)
      }
    }
    return this._instances[name]
  }
}

export default ServiceFactory
