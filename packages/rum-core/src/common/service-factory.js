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
import { __DEV__ } from '../state'

const serviceCreators = {
  [CONFIG_SERVICE]: () => new ConfigService(),
  [LOGGING_SERVICE]: () =>
    new LoggingService({
      prefix: '[Elastic APM] '
    }),
  [APM_SERVER]: factory => {
    const [configService, loggingService] = factory.getService([
      CONFIG_SERVICE,
      LOGGING_SERVICE
    ])
    return new ApmServer(configService, loggingService)
  }
}

class ServiceFactory {
  constructor() {
    this.instances = {}
    this.initialized = false
  }

  init() {
    if (this.initialized) {
      return
    }
    this.initialized = true
    const configService = this.getService(CONFIG_SERVICE)
    configService.init()

    const [loggingService, apmServer] = this.getService([
      LOGGING_SERVICE,
      APM_SERVER
    ])
    /**
     * Reset logLevel whenever config update happens
     */
    configService.events.observe(CONFIG_CHANGE, () => {
      const logLevel = configService.get('logLevel')
      loggingService.setLevel(logLevel)
    })
    apmServer.init()
  }

  getService(name) {
    if (typeof name === 'string') {
      if (!this.instances[name]) {
        if (typeof serviceCreators[name] === 'function') {
          this.instances[name] = serviceCreators[name](this)
        } else if (__DEV__) {
          console.log('Cannot get service, No creator for: ' + name)
        }
      }
      return this.instances[name]
    } else if (Array.isArray(name)) {
      return name.map(n => this.getService(n))
    }
  }
}

export { serviceCreators, ServiceFactory }
