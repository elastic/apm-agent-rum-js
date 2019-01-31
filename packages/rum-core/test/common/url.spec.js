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
        query: '?param=value&param2=value2&0=zero&foo&empty=&key=double=double&undefined',
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
