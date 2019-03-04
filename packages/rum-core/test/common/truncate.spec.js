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

const { truncate, truncateMetadata } = require('../../src/common/truncate')

describe('Truncate', () => {
  it('truncate values with options', () => {
    expect(truncate('', undefined, true)).toEqual('N/A')
    const longString = 'a'.repeat('10')
    expect(truncate(longString, 2)).toEqual('aa')
    const placeHolder = 'dummyplaceholder'
    expect(truncate('', undefined, true, placeHolder)).toEqual(placeHolder)
  })

  it('truncate metadata with specifed limits', () => {
    const longName = '0'.repeat('10')
    const metadata = {
      service: {
        name: '',
        version: 2.0,
        agent: {
          name: longName,
          version: 3
        },
        environment: 'dev'
      }
    }

    const newMetadata = truncateMetadata(metadata, {
      stringLimit: 5
    })

    expect(newMetadata).toEqual({
      service: {
        name: 'N/A',
        version: 2.0,
        agent: {
          name: '00000',
          version: 3
        },
        environment: 'dev'
      }
    })
  })
})
