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

import { ServiceFactory } from '../../src/common/service-factory'

describe('ServiceFactory', function() {
  let configService
  let loggingService
  let serviceFactory
  beforeEach(function() {
    serviceFactory = new ServiceFactory()
    serviceFactory.init()
    configService = serviceFactory.getService('ConfigService')

    loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'debug')
  })

  it('should set correct log level', function() {
    expect(configService.get('logLevel')).toBe('warn')
    expect(loggingService.level).toBe('warn')

    configService.setConfig({ logLevel: 'trace' })
    expect(loggingService.level).toBe('trace')

    configService.setConfig({ logLevel: 'debug' })
    expect(loggingService.level).toBe('debug')
  })

  it('should get multiple services', function() {
    let services = serviceFactory.getService([
      'ConfigService',
      'LoggingService'
    ])
    expect(services).toEqual([configService, loggingService])
  })
})
