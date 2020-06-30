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

import slugifyUrl from '../../src/common/slugify'

describe('Slug URL', () => {
  const validate = (before, after, depth) => {
    expect(slugifyUrl(before, depth)).toBe(after)
  }

  it('accept depth parameter', () => {
    validate('/a/b/c/d', '/a/b/**')
    validate('/a/b/c/d', '/a/**', 1)
  })

  it('handle trailing slash', () => {
    validate('/a/', '/a')
    validate('/a', '/a')
    validate('/', '/')
  })

  it('handle query param', () => {
    validate('/a/b/?id=hello', '/a/b?{query}')
    validate('/?foo=bar&bar=baz', '/?{query}')
  })

  it('redact digits', () => {
    validate('/a/123', '/a/123')
    validate('/a/12312bcdd23', '/a/:id')
    validate('/a/B00I8BIC9E', '/a/:id')
    // uuid
    validate('/a/786c1883-dc0b-495f-a16b-6c53fb20b272', '/a/:id')
  })

  it('redact special characters', () => {
    validate('/a-b-c-d', '/:id')
    validate('/a~b-c', '/:id')
    validate('/a~b-c/d/e/f', '/:id/**')
    validate('/b%c%d-ef', '/:id')
  })

  it('react mix of lower-uppercase characters', () => {
    validate('/abcDEF', '/:id')
    validate('/a1W9FtW5DnkyP3Bucng4aLvqT/edit', '/:id/**')
  })
})
