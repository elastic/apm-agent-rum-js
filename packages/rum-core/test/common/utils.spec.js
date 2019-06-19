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

import * as utils from '../../src/common/utils'
import Span from '../../src/performance-monitoring/span'
import Url from '../../src/common/url'

describe('lib/utils', function() {
  it('should merge objects', function() {
    var result = utils.merge({ a: 'a' }, { b: 'b', a: 'b' })
    expect(result).toEqual(Object({ a: 'b', b: 'b' }))

    var deepMerged = utils.merge({ a: { c: 'c' } }, { b: 'b', a: { d: 'd' } })
    expect(deepMerged).toEqual(
      Object({ a: Object({ c: 'c', d: 'd' }), b: 'b' })
    )

    var a = { a: { c: 'c' } }
    deepMerged = utils.merge({}, a, { b: 'b', a: { d: 'd' } })
    expect(deepMerged).toEqual(
      Object({ a: Object({ c: 'c', d: 'd' }), b: 'b' })
    )
    expect(a).toEqual(Object({ a: Object({ c: 'c' }) }))

    deepMerged = utils.merge({ a: { c: 'c' } }, { b: 'b', a: 'b' })
    expect(deepMerged).toEqual(Object({ a: 'b', b: 'b' }))

    deepMerged = utils.merge({ a: { c: 'c' } }, { b: 'b', a: null })
    expect(deepMerged).toEqual(Object({ a: null, b: 'b' }))

    deepMerged = utils.merge({ a: null }, { b: 'b', a: null })
    expect(deepMerged).toEqual(Object({ a: null, b: 'b' }))
  })

  it('should get elastic script', function() {
    var script = window.document.createElement('script')
    script.src = './elastic-hamid.js'
    script.setAttribute('data-service-name', 'serviceName')
    var html = document.getElementsByTagName('html')[0]
    // html.appendChild(script)
    var theFirstChild = html.firstChild
    html.insertBefore(script, theFirstChild)

    var result = utils.getElasticScript()
    expect(result).toBe(script)
    expect(result.getAttribute('data-service-name')).toBe('serviceName')

    html.removeChild(script)
  })

  it('should getNavigationTimingMarks', function() {
    var marks = utils.getNavigationTimingMarks()
    expect(marks.fetchStart).toBeGreaterThanOrEqual(0)
    expect(marks.domInteractive).toBeGreaterThanOrEqual(0)
    expect(marks.domComplete).toBeGreaterThanOrEqual(0)
    expect(marks.loadEventEnd).toBeGreaterThanOrEqual(0)
  })

  it('should getPaintTimingMarks', function() {
    var marks = utils.getPaintTimingMarks()
    expect(marks).toEqual({})
  })

  it('should generate random ids', function() {
    var result = utils.bytesToHex(utils.rng())
    expect(result.length).toBe(32)

    result = utils.generateRandomId()
    expect(result.length).toBe(32)
    result = utils.generateRandomId(16)
    expect(result.length).toBe(16)

    var array = [
      252,
      192,
      107,
      62,
      0,
      43,
      190,
      201,
      129,
      49,
      251,
      159,
      243,
      81,
      153,
      192
    ]
    result = utils.bytesToHex(array)
    expect(result).toBe('fcc06b3e002bbec98131fb9ff35199c0')
  })

  it('should identify same origin urls', function() {
    const currentOrigin = new Url(window.location.href).origin
    const relOrigin = new Url('/test/new').origin
    const absOrigin = new Url('http://test.com/test/new').origin
    console.log(relOrigin, currentOrigin)
    expect(utils.checkSameOrigin(relOrigin, currentOrigin)).toBe(true)
    expect(utils.checkSameOrigin(absOrigin, currentOrigin)).toBe(false)
    expect(
      utils.checkSameOrigin(absOrigin, [currentOrigin, 'http://test.com'])
    ).toBe(true)
    expect(
      utils.checkSameOrigin(absOrigin, [
        currentOrigin,
        'http://test1.com',
        'not-url:3000'
      ])
    ).toBe(false)

    expect(utils.checkSameOrigin(absOrigin, undefined)).toBe(false)
    expect(utils.checkSameOrigin(new Url(undefined), absOrigin)).toBe(false)
    expect(utils.checkSameOrigin(new Url({}), 'http://test.com/')).toBe(false)
    expect(
      utils.checkSameOrigin(new Url('test test'), 'http://test.com/')
    ).toBe(false)
    expect(utils.checkSameOrigin(new Url('/test'), 'http://test.com/')).toBe(
      false
    )
    expect(utils.checkSameOrigin(new Url(''), 'http://test.com/')).toBe(false)
  })

  it('should generate correct DT headers', function() {
    var span = new Span('test', 'test', {
      sampled: true,
      traceId: 'traceId',
      parentId: 'transcationId'
    })
    span.id = 'spanId'
    var headerValue = utils.getDtHeaderValue(span)
    expect(headerValue).toBe('00-traceId-spanId-01')
    span.sampled = false
    headerValue = utils.getDtHeaderValue(span)
    expect(headerValue).toBe('00-traceId-transcationId-00')
  })

  it('should validate DT header', function() {
    var result = utils.isDtHeaderValid(
      '00-a1bc6db567095621cdc01dd11359217b-0b5a9e8b3c8fd252-01'
    )
    expect(result).toBe(true)

    result = utils.isDtHeaderValid(
      '00-a1bc6db567095621cdc01dd11359217b-null-01'
    )
    expect(result).toBe(false)

    result = utils.isDtHeaderValid('00-null-0b5a9e8b3c8fd252-01')
    expect(result).toBe(false)

    result = utils.isDtHeaderValid(
      '00-00000000000000000000000000000000-0b5a9e8b3c8fd252-00'
    )
    expect(result).toBe(false)

    result = utils.isDtHeaderValid(
      '00-a1bc6db567095621cdc01dd11359217b-0000000000000000-00'
    )
    expect(result).toBe(false)

    result = utils.isDtHeaderValid(
      '00-12345678901234567890123456789012-.234567890123456-01'
    )
    expect(result).toBe(false)

    result = utils.isDtHeaderValid(
      '00-12345678901234567890123456789012-1234567890123456-01-what-the-future-will-be-like'
    )
    expect(result).toBe(false)
  })

  it('should parse dt header', function() {
    var result = utils.parseDtHeaderValue(
      '00-a1bc6db567095621cdc01dd11359217b-0b5a9e8b3c8fd252-01'
    )
    expect(result).toEqual({
      traceId: 'a1bc6db567095621cdc01dd11359217b',
      id: '0b5a9e8b3c8fd252',
      sampled: true
    })

    result = utils.parseDtHeaderValue('00-null-0b5a9e8b3c8fd252-01')
    expect(result).toBe(undefined)

    result = utils.parseDtHeaderValue(undefined)
    expect(result).toBe(undefined)

    result = utils.parseDtHeaderValue(null)
    expect(result).toBe(undefined)

    result = utils.parseDtHeaderValue({})
    expect(result).toBe(undefined)

    result = utils.parseDtHeaderValue(1)
    expect(result).toBe(undefined)

    result = utils.parseDtHeaderValue('test')
    expect(result).toBe(undefined)
  })

  it('should getTimeOrigin', function() {
    var now = Date.now()
    var result = utils.getTimeOrigin()
    expect(typeof result).toBe('number')
    expect(result).toBeLessThanOrEqual(now)
  })

  it('should setLabel', function() {
    var date = new Date()
    var labels = {}
    utils.setLabel('key', 'value', undefined)
    utils.setLabel(undefined, 'value', labels)
    utils.setLabel('test', 'test', labels)
    utils.setLabel('no', 1, labels)
    utils.setLabel('test.test', 'passed', labels)
    utils.setLabel('date', date, labels)
    utils.setLabel()
    utils.setLabel('removed', undefined, labels)
    utils.setLabel('obj', {}, labels)
    expect(labels).toEqual({
      test: 'test',
      no: '1',
      test_test: 'passed',
      date: String(date),
      removed: undefined,
      obj: '[object Object]'
    })
  })

  it('should remove query strings from url', () => {
    const urls = [
      'http://test.com/fetch?a=1&b=2',
      '/fetch?c=3&d=4',
      null,
      undefined,
      ''
    ]
    const results = ['http://test.com/fetch', '/fetch', null, undefined, '']

    urls.forEach((url, index) => {
      expect(utils.stripQueryStringFromUrl(url)).toEqual(results[index])
    })
  })

  it('should find', function() {
    var result = utils.find([1, 2, 3, 4, 5], function(n) {
      return n > 3
    })
    expect(result).toBe(4)

    expect(function() {
      utils.find()
    }).toThrow()

    result = utils.find(2, function() {})
    expect(result).toBe(undefined)
  })

  it('should remove invalid characters', () => {
    expect(utils.removeInvalidChars('invalid*')).toEqual('invalid_')
    expect(utils.removeInvalidChars('invalid1.invalid2')).toEqual(
      'invalid1_invalid2'
    )
    expect(utils.removeInvalidChars('invalid"')).toEqual('invalid_')
  })
})
