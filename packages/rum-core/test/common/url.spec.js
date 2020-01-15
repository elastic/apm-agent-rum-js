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

import Url from '../../src/common/url'

describe('Url parser', function() {
  it('should parse relative url', function() {
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

  it('should parse absolute url', function() {
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

  it('should parse url with fragment part', function() {
    var result = new Url('http://test.com/path?param=value#fragment')
    expect(result).toEqual(
      jasmine.objectContaining({
        hash: '#fragment',
        query: '?param=value',
        path: '/path'
      })
    )
  })

  it('should parse url with fragment before query string', function() {
    var result = new Url('http://test.com/path#fragment?param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        hash: '#fragment?param=value',
        query: '',
        path: '/path'
      })
    )
  })

  it('should parse url with leading &', function() {
    var result = new Url('/path/?&param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        path: '/path/',
        query: '?&param=value'
      })
    )
  })

  it('should parse url with not querystring', function() {
    var result = new Url('/path')
    expect(result).toEqual(
      jasmine.objectContaining({
        path: '/path',
        query: ''
      })
    )
  })

  it('should parse url with only the querystring', function() {
    var result = new Url('?param=value')
    expect(result).toEqual(
      jasmine.objectContaining({
        path: '/',
        query: '?param=value'
      })
    )
  })

  it('should parse url correctly without /', () => {
    expect(new Url('api/foo')).toEqual(
      jasmine.objectContaining({
        path: '/api/foo',
        query: '',
        hash: '',
        relative: true,
        protocol: 'http:'
      })
    )

    expect(new Url('api/foo?a=b')).toEqual(
      jasmine.objectContaining({
        path: '/api/foo',
        query: '?a=b',
        hash: ''
      })
    )

    expect(new Url('api/foo#fragment')).toEqual(
      jasmine.objectContaining({
        path: '/api/foo',
        hash: '#fragment'
      })
    )
  })

  it('should inherit protocol for relative urls with protocols', () => {
    expect(new Url('//foo.com/bar')).toEqual(
      jasmine.objectContaining({
        path: '/bar',
        host: 'foo.com',
        protocol: 'http:'
      })
    )
  })

  it('should parse auth in the URL', function() {
    expect(new Url('http://a:b@c')).toEqual(
      jasmine.objectContaining({
        auth: 'a:b',
        hash: '',
        host: 'c',
        href: 'http://[REDACTED]:[REDACTED]@c',
        origin: 'http://c',
        path: '',
        protocol: 'http:',
        query: ''
      })
    )
    expect(new Url('http://a@b@c/')).toEqual(
      jasmine.objectContaining({
        auth: 'a@b',
        hash: '',
        host: 'c',
        href: 'http://[REDACTED]@c/',
        origin: 'http://c',
        path: '/',
        protocol: 'http:',
        query: ''
      })
    )
    expect(new Url('http://a@b?@c')).toEqual(
      jasmine.objectContaining({
        auth: 'a',
        hash: '',
        host: 'b',
        href: 'http://[REDACTED]@b?@c',
        origin: 'http://b',
        path: '',
        protocol: 'http:',
        query: '?@c'
      })
    )
    expect(
      new Url(
        'http://user:pass@mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s='
      )
    ).toEqual(
      jasmine.objectContaining({
        auth: 'user:pass',
        hash: '',
        host: 'mt0.google.com',
        href:
          'http://[REDACTED]:[REDACTED]@mt0.google.com/vt/lyrs=m@114???&hl=en&src=api&x=2&y=2&z=3&s=',
        origin: 'http://mt0.google.com',
        path: '/vt/lyrs=m@114',
        protocol: 'http:',
        query: '???&hl=en&src=api&x=2&y=2&z=3&s='
      })
    )
    expect(new Url('http://user:pass@-lovemonsterz.tumblr.com/rss')).toEqual(
      jasmine.objectContaining({
        auth: 'user:pass',
        hash: '',
        host: '-lovemonsterz.tumblr.com',
        href: 'http://[REDACTED]:[REDACTED]@-lovemonsterz.tumblr.com/rss',
        origin: 'http://-lovemonsterz.tumblr.com',
        path: '/rss',
        protocol: 'http:',
        query: ''
      })
    )
    expect(new Url('http://a@b/c@d')).toEqual(
      jasmine.objectContaining({
        auth: 'a',
        hash: '',
        host: 'b',
        href: 'http://[REDACTED]@b/c@d',
        origin: 'http://b',
        path: '/c@d',
        protocol: 'http:',
        query: ''
      })
    )
  })

  it('should parse port and hostname correctly for different schemes', () => {
    expect(new Url('http://test.com')).toEqual(
      jasmine.objectContaining({
        port: '',
        host: 'test.com',
        hostname: 'test.com'
      })
    )
    expect(new Url('https://test.com')).toEqual(
      jasmine.objectContaining({
        port: '',
        host: 'test.com',
        hostname: 'test.com'
      })
    )
    expect(new Url('https://test.com:443')).toEqual(
      jasmine.objectContaining({
        port: '',
        host: 'test.com',
        hostname: 'test.com'
      })
    )
    expect(new Url('https://test.com:80')).toEqual(
      jasmine.objectContaining({
        port: '80',
        host: 'test.com:80',
        hostname: 'test.com'
      })
    )
    expect(new Url('http://[::1]/')).toEqual(
      jasmine.objectContaining({
        port: '',
        host: '[::1]',
        hostname: '[::1]'
      })
    )
    expect(new Url('https://[::1]:8080/')).toEqual(
      jasmine.objectContaining({
        port: '8080',
        host: '[::1]:8080',
        hostname: '[::1]'
      })
    )
  })
})

/**
 * Test native URL implementation only on supported platforms
 * In IE 11 - window.URL is not supported but it exists as an object
 */
const userAgent = window.navigator.userAgent
if (window.URL.toString().indexOf('native code') !== -1) {
  describe('Native URL API Compatibility', () => {
    function commonFields(url) {
      const native = new URL(url)
      const polyfill = new Url(url)
      expect(native.href).toBe(polyfill.href)
      expect(native.origin).toBe(polyfill.origin)
      expect(native.protocol).toBe(polyfill.protocol)
      expect(native.host).toBe(polyfill.host)
      expect(native.hostname).toBe(polyfill.hostname)
      expect(native.port).toBe(polyfill.port)
      expect(native.hash).toBe(polyfill.hash)
    }

    it('should be close to native implementation for most fields', () => {
      commonFields('http://test.com/path')
      commonFields('https://test.com/path')
      commonFields('https://test.com:443/path#d')
      commonFields('https://test.com:8080/path?a=c#d')
    })

    it('field names that are different name from native', () => {
      const url = 'http://localhost:8080/a?b=c&d=e'
      const native = new URL(url)
      const polyfill = new Url(url)

      expect(native.pathname).toBe(polyfill.path)
      expect(native.search).toBe(polyfill.query)
    })

    it('relative URL parsing varies ', () => {
      let url = '/test/?a=b'
      /**
       * Native URL expects a origin parameter
       * Polyfill uses the current location by default
       */
      let native = new URL(url, window.location.origin)
      let polyfill = new Url(url)

      expect(native.href).toBe(polyfill.href)
      expect(native.origin).toBe(polyfill.origin)
      expect(native.pathname).toBe(polyfill.path)
    })

    const isMsEdge = /Edge/.test(userAgent)
    /**
     * Microsoft Edge URL parsing for IPv6  works differently
     * for `host` and `hostnames`
     */

    it('should parse IPv6 addres correctly', () => {
      const url = 'http://[::1]:8080/'

      if (isMsEdge) {
        const native = new URL(url)
        expect(native.host).toBe('::1:8080')
        expect(native.hostname).toBe('::1')
        expect(native.origin).toBe('http://::1:8080')
      } else {
        commonFields(url)
      }
    })

    /**
     * Microsoft Edge URL parsing would throw Security Error
     * when URL has a username and password fields associated.
     */
    if (!isMsEdge) {
      it('url with authentication parsing varies', () => {
        let url = 'http://a@b?@c'
        let native = new URL(url)
        let polyfill = new Url(url)

        expect(native.username).toBe(polyfill.auth)
        expect(native.host).toBe(polyfill.host)
        expect(native.search).toBe(polyfill.query)

        url = 'http://a:b@c/'
        native = new URL(url)
        polyfill = new Url(url)

        expect(`${native.username}:${native.password}`).toBe(polyfill.auth)
        expect(native.href).toBe(url)
        expect(polyfill.href).toBe('http://[REDACTED]:[REDACTED]@c/')
      })
    }
  })
}
