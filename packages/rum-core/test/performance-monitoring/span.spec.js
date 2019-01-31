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

var Span = require('../../src/performance-monitoring/span')
describe('Span', function () {
  it('should return null for duration if not ended', function () {
    var s = new Span('test', 'test')
    expect(s.duration()).toBe(null)
  })

  it('should support dot delimiter in span types', function () {
    var s1 = new Span('test1', 'db.mysql.query')
    expect(s1.type).toBe('db')
    expect(s1.subType).toBe('mysql')
    expect(s1.action).toBe('query')

    var s2 = new Span('test2', 'db-query')
    expect(s2.type).toBe('db-query')
    expect(s2.subType).toBe(undefined)
    expect(s2.action).toBe(undefined)
  })
})
