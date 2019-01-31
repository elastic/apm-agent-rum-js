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

var ConfigService = require('../../src/common/config-service')

describe('ConfigService', function () {
  var configService
  beforeEach(function () {
    configService = new ConfigService()
    configService.init()
  })
  it('should merge configs with already set configs', function () {
    expect(configService.get('debug')).toBe(false)
    expect(configService.get('serviceName')).toBe('')

    configService.setConfig({
      serviceName: 'serviceName'
    })

    expect(configService.get('debug')).toBe(false)
    expect(configService.get('serviceName')).toBe('serviceName')

    configService.setConfig({
      debug: true
    })

    expect(configService.get('debug')).toBe(true)
    expect(configService.get('serviceName')).toBe('serviceName')

    configService.setConfig({
      debug: false,
      serviceName: null
    })

    expect(configService.get('debug')).toBe(false)
    expect(configService.get('serviceName')).toBe(null)
  })

  it('should return undefined if the config does not exists', function () {
    expect(configService.get('context')).toEqual({})
    expect(configService.get('context.user')).toBe(undefined)
    configService.set('context.user', { test: 'test' })
    expect(configService.get('context.user')).toEqual({ test: 'test' })
    expect(configService.get('nonexisting.nonexisting')).toBe(undefined)
    expect(configService.get('context.nonexisting.nonexisting')).toBe(undefined)
  })

  it('should addFilter correctly', function () {
    expect(function () {
      configService.addFilter('test')
    }).toThrow()

    configService.addFilter(function (testArg) {
      expect(testArg).toBe('hamid-test')
      return 'hamid-test-1'
    })

    configService.addFilter(function (testArg) {
      expect(testArg).toBe('hamid-test-1')
      return 'hamid-test-2'
    })

    var result = configService.applyFilters('hamid-test')
    expect(result).toBe('hamid-test-2')

    configService.addFilter(function () {})
    configService.addFilter(function () {
      throw new Error('Out of reach!')
    })

    result = configService.applyFilters('hamid-test')
    expect(result).toBeUndefined()
  })

  it('should set userContext and customContext', function () {
    configService.setCustomContext({ test: 'test' })
    var customContext = configService.get('context.custom')
    expect(customContext).toEqual({ test: 'test' })

    configService.setUserContext({
      test: 'test',
      id: 'userId',
      username: 'username',
      email: 'email'
    })
    var userContext = configService.get('context.user')
    expect(userContext).toEqual({ id: 'userId', username: 'username', email: 'email' })

    configService.setUserContext({ test: 'test', id: 1, username: 1, email: 'email' })
    userContext = configService.get('context.user')
    expect(userContext).toEqual({ id: 1, email: 'email' })

    configService.setUserContext({ test: 'test', username: {} })
    userContext = configService.get('context.user')
    expect(userContext).toEqual({})
  })

  it('should check config validity', function () {
    var result = configService.isValid()
    expect(result).toBe(false)

    configService.setConfig({ serviceName: 'serviceName' })
    result = configService.isValid()
    expect(result).toBe(true)

    configService.setConfig({ serverUrl: undefined })
    result = configService.isValid()
    expect(result).toBe(false)

    configService.setConfig({ serverUrl: 'test' })
    result = configService.isValid()
    expect(result).toBe(true)
  })

  it('should setTag', function () {
    configService.setTag('', 'test')
    configService.setTag('test', 'test')
    configService.setTag('test.key', 'test value')
    configService.setTag('newKey', '')
    var tags = configService.get('context.tags')
    expect(tags).toEqual({ test: 'test', test_key: 'test value', newKey: '' })
  })

  it('should addTags', function () {
    var date = new Date()
    configService.addTags({
      test: 'test',
      no: 1,
      'test.test': 'test',
      obj: { just: 'object' },
      date: date
    })
    var tags = configService.get('context.tags')
    expect(tags).toEqual({
      test: 'test',
      no: '1',
      test_test: 'test',
      obj: '[object Object]',
      date: String(date)
    })

    configService.addTags({
      test: undefined,
      no: 1,
      'test.test': 'test',
      obj: { just: 'object' },
      date: date
    })
    tags = configService.get('context.tags')
    expect(tags).toEqual({
      test: undefined,
      no: '1',
      test_test: 'test',
      obj: '[object Object]',
      date: String(date)
    })
  })

  it('should set config from script data attributes', () => {
    const script = document.createElement('script')
    script.src = './elastic-script.js'
    script.setAttribute('data-service-name', 'js-core')
    script.setAttribute('data-capture-page-load', 'false')
    document.head.appendChild(script)

    const configServiceFromScript = new ConfigService()
    configServiceFromScript.init()
    expect(configServiceFromScript.get('serviceName')).toBe('js-core')
    expect(configServiceFromScript.get('capturePageLoad')).toBe('false')
  })
})
