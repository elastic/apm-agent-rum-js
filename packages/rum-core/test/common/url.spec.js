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

const Url = require('../../src/common/url')

describe('Url parser', function () {
  it('should parse relative url', function () {
    var result = new Url(
      '/path?param=value&param2=value2&0=zero&foo&empty=&key=double=double&undefined'
    )
    expect(result).toEqual(
      jasmine.objectContaining({
        protocol: 'http:',
        path: '/path',
        query:
          '?param=value&param2=value2&0=zero&foo&empty=&key=double=double&undefined',
        hash: ''
      })
    )
  })

  it('should parse absolute url', function () {
    var result = new Url('http://test.com/path.js?param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        protocol: 'http:',
        path: '/path.js',
        query: '?param=value',
        hash: '',
        host: 'test.com',
        origin: 'http://test.com'
      })
    )
  })

  it('should parse url with fragment part', function () {
    var result = new Url('http://test.com/path?param=value#fragment')
    expect(result).toEqual(
      jasmine.objectContaining({
        hash: '#fragment',
        query: '?param=value',
        path: '/path'
      })
    )
  })

  it('should parse url with fragment before query string', function () {
    var result = new Url('http://test.com/path#fragment?param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        hash: '#fragment?param=value',
        query: '',
        path: '/path'
      })
    )
  })

  it('should parse url with leading &', function () {
    var result = new Url('/path/?&param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        path: '/path/',
        query: '?&param=value'
      })
    )
  })

  it('should parse url with not querystring', function () {
    var result = new Url('/path')
    expect(result).toEqual(
      jasmine.objectContaining({
        path: '/path',
        query: ''
      })
    )
  })

  it('should parse url with only the querystring', function () {
    var result = new Url('?param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        path: '',
        query: '?param=value'
      })
    )
  })
})
