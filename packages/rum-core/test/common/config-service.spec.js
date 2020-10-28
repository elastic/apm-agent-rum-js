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

import ConfigService from '../../src/common/config-service'
import { LOCAL_CONFIG_KEY } from '../../src/common/constants'

describe('ConfigService', function() {
  var configService
  beforeEach(function() {
    configService = new ConfigService()
  })
  it('should merge configs with already set configs', function() {
    expect(configService.get('instrument')).toBe(true)
    expect(configService.get('serviceName')).toBe('')

    configService.setConfig({
      serviceName: 'serviceName'
    })

    expect(configService.get('instrument')).toBe(true)
    expect(configService.get('serviceName')).toBe('serviceName')

    configService.setConfig({
      instrument: false
    })

    expect(configService.get('instrument')).toBe(false)
    expect(configService.get('serviceName')).toBe('serviceName')

    configService.setConfig({
      instrument: false,
      serviceName: null
    })

    expect(configService.get('instrument')).toBe(false)
    expect(configService.get('serviceName')).toBe(null)
  })

  it('should return undefined if the config does not exists', function() {
    expect(configService.get('context')).toEqual({})
    expect(configService.get('context.user')).toBe(undefined)
    configService.setUserContext({ id: 'test' })
    expect(configService.get('context.user')).toEqual({ id: 'test' })
    expect(configService.get('nonexisting.nonexisting')).toBe(undefined)
    expect(configService.get('context.nonexisting.nonexisting')).toBe(undefined)
  })

  it('should addFilter correctly', function() {
    expect(function() {
      configService.addFilter('test')
    }).toThrow()

    configService.addFilter(function(testArg) {
      expect(testArg).toBe('hamid-test')
      return 'hamid-test-1'
    })

    configService.addFilter(function(testArg) {
      expect(testArg).toBe('hamid-test-1')
      return 'hamid-test-2'
    })

    var result = configService.applyFilters('hamid-test')
    expect(result).toBe('hamid-test-2')

    configService.addFilter(function() {})
    configService.addFilter(function() {
      throw new Error('Out of reach!')
    })

    result = configService.applyFilters('hamid-test')
    expect(result).toBeUndefined()
  })

  it('should set userContext and customContext', function() {
    configService.setCustomContext({ test: 'test' })
    expect(configService.get('context.custom')).toEqual({ test: 'test' })

    configService.setCustomContext({ test: 'test2', foo: 'bar', bar: 'baz' })
    expect(configService.get('context.custom')).toEqual({
      test: 'test2',
      foo: 'bar',
      bar: 'baz'
    })

    configService.setUserContext({ test: 'test', username: {} })
    expect(configService.get('context.user')).toEqual({})

    configService.setUserContext({
      test: 'test',
      id: 'userId',
      username: 'username',
      email: 'email'
    })
    expect(configService.get('context.user')).toEqual({
      id: 'userId',
      username: 'username',
      email: 'email'
    })

    configService.setUserContext({
      foo: 'bar',
      id: 1,
      username: 1,
      email: 'email'
    })
    expect(configService.get('context.user')).toEqual({
      id: 1,
      email: 'email',
      username: 'username'
    })
  })

  it('should validate required config options', () => {
    // Valid
    const errors1 = configService.validate({ serviceName: 'name' })
    expect(errors1).toEqual({
      missing: [],
      invalid: []
    })

    // missing required key serviceName
    const errors2 = configService.validate({ serviceName: undefined })
    expect(errors2).toEqual({
      missing: ['serviceName'],
      invalid: []
    })

    // missing required key serviceName & serverUrl
    const errors3 = configService.validate({
      serviceName: undefined,
      serverUrl: ''
    })
    expect(errors3).toEqual({
      missing: ['serviceName', 'serverUrl'],
      invalid: []
    })

    // Invalid characters in serviceName
    const errors4 = configService.validate({ serviceName: 'abc.def' })
    expect(errors4).toEqual({
      missing: [],
      invalid: [
        {
          key: 'serviceName',
          value: 'abc.def',
          allowed: 'a-z, A-Z, 0-9, _, -, <space>'
        }
      ]
    })

    // transactionSampleRate validation
    var sampleRateErrors = configService.validate({ transactionSampleRate: 2 })
    expect(sampleRateErrors.invalid).toEqual([
      {
        key: 'transactionSampleRate',
        value: 2,
        allowed: 'Number between 0 and 1'
      }
    ])

    sampleRateErrors = configService.validate({ transactionSampleRate: 'test' })
    expect(sampleRateErrors.invalid).toEqual([
      {
        key: 'transactionSampleRate',
        value: 'test',
        allowed: 'Number between 0 and 1'
      }
    ])

    sampleRateErrors = configService.validate({ transactionSampleRate: -1 })
    expect(sampleRateErrors.invalid).toEqual([
      {
        key: 'transactionSampleRate',
        value: -1,
        allowed: 'Number between 0 and 1'
      }
    ])

    sampleRateErrors = configService.validate({ transactionSampleRate: NaN })
    expect(sampleRateErrors.invalid).toEqual([
      {
        key: 'transactionSampleRate',
        value: NaN,
        allowed: 'Number between 0 and 1'
      }
    ])
  })

  it('should addLabels', function() {
    var date = new Date()
    const labels = {
      test: 'test',
      no: 1,
      'test.test': 'test',
      obj: { just: 'object' },
      date
    }
    configService.addLabels(labels)
    const contextLabels = configService.get('context.tags')
    expect(contextLabels).toEqual({
      test: 'test',
      no: 1,
      test_test: 'test',
      obj: '[object Object]',
      date: String(date)
    })
  })

  it('should set config from script data attributes', () => {
    const script = document.createElement('script')
    script.src = './elastic-script.js'
    script.setAttribute('data-service-name', 'js-core')
    script.setAttribute('data-distributed-tracing', 'false')
    document.head.appendChild(script)

    const configServiceFromScript = new ConfigService()
    configServiceFromScript.init()
    expect(configServiceFromScript.get('serviceName')).toBe('js-core')
    expect(configServiceFromScript.get('distributedTracing')).toBe('false')
  })

  it('should remove trailing slash from serverUrl', () => {
    configService.setConfig({
      serviceName: 'aabc',
      serverUrl: 'http://localhost:8080/////'
    })
    expect(configService.get('serverUrl')).toEqual('http://localhost:8080')
  })

  it('should store configuration in sessionConfig', () => {
    let config = configService.getLocalConfig()
    expect(config).toBe(undefined)
    configService.setLocalConfig({ key: 'value' })

    config = configService.getLocalConfig()
    expect(config).toEqual({ key: 'value' })
    sessionStorage.removeItem(LOCAL_CONFIG_KEY)
  })

  it('should consider transactionSampleRate precision', () => {
    configService.setConfig({ transactionSampleRate: 0.55554 })
    expect(configService.config.transactionSampleRate).toBe(0.5555)
    configService.setConfig({ transactionSampleRate: 0.55556 })
    expect(configService.config.transactionSampleRate).toBe(0.5556)
    configService.setConfig({ transactionSampleRate: 0.00001 })
    expect(configService.config.transactionSampleRate).toBe(0.0001)
  })
})
