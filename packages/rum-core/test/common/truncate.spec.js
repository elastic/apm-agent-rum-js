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

const {
  truncate,
  truncateMetadata,
  truncateTransaction,
  truncateSpan,
  truncateError
} = require('../../src/common/truncate')

describe('Truncate', () => {
  function generateStr(ch, length) {
    return new Array(length + 1).join(ch)
  }

  it('truncate values with options', () => {
    expect(truncate('', undefined, true)).toEqual('N/A')
    expect(truncate(generateStr('ab', 5), 2)).toEqual('ab')
    const placeHolder = 'dummyplaceholder'
    expect(truncate('', undefined, true, placeHolder)).toEqual(placeHolder)
  })

  it('truncate metadata', () => {
    const metadata = {
      service: {
        name: '',
        version: 2.0,
        agent: {
          name: generateStr('a', 5),
          version: 3
        },
        environment: 'dev'
      }
    }

    const filtered = truncateMetadata(metadata, {
      stringLimit: 3
    })

    expect(filtered).toEqual({
      service: {
        name: 'N/A',
        version: 2.0,
        agent: {
          name: 'aaa',
          version: 3
        },
        environment: 'dev'
      }
    })
  })

  it('truncate transaction', () => {
    const keywordLen = 11
    const transaction = {
      id: 'abc123',
      trace_id: generateStr('a', keywordLen),
      name: generateStr('b', keywordLen),
      type: generateStr('c', keywordLen),
      duration: 200.5,
      spans: [],
      context: {
        user: {
          id: generateStr('d', keywordLen),
          email: generateStr('e', keywordLen),
          username: generateStr('f', keywordLen)
        },
        tags: {
          pageload: true,
          key: generateStr('g', keywordLen)
        }
      },
      marks: {
        agent: {
          timeToFirstByte: 100,
          domInteractive: 150,
          domComplete: 200
        }
      },
      span_count: {
        started: 10
      },
      sampled: true
    }

    const stringLimit = 5
    const filtered = truncateTransaction(transaction, { stringLimit })

    expect(filtered).toEqual({
      id: 'abc12',
      trace_id: generateStr('a', stringLimit),
      name: generateStr('b', stringLimit),
      type: generateStr('c', stringLimit),
      duration: 200.5,
      spans: [],
      context: {
        user: {
          id: generateStr('d', stringLimit),
          email: generateStr('e', stringLimit),
          username: generateStr('f', stringLimit)
        },
        tags: {
          pageload: true,
          key: generateStr('g', stringLimit)
        }
      },
      marks: {
        agent: {
          timeToFirstByte: 100,
          domInteractive: 150,
          domComplete: 200
        }
      },
      span_count: {
        started: 10
      },
      sampled: true
    })
  })

  it('truncate spans', () => {
    const keywordLen = 11
    const span = {
      id: '123abc',
      transaction_id: generateStr('a', keywordLen),
      parent_id: generateStr('b', keywordLen),
      trace_id: generateStr('c', keywordLen),
      name: generateStr('d', keywordLen),
      type: generateStr('e', keywordLen),
      sync: false,
      start: 500,
      duration: 700.02,
      context: {
        user: {
          id: generateStr('f', keywordLen),
          email: generateStr('g', keywordLen),
          username: generateStr('h', keywordLen)
        },
        page: {
          referer: 'blah',
          url: 'http://a.com/script.js'
        }
      }
    }

    const stringLimit = 7
    const filtered = truncateSpan(span, { stringLimit })
    expect(filtered).toEqual({
      id: '123abc',
      transaction_id: generateStr('a', stringLimit),
      parent_id: generateStr('b', stringLimit),
      trace_id: generateStr('c', stringLimit),
      name: generateStr('d', stringLimit),
      type: generateStr('e', stringLimit),
      sync: false,
      start: 500,
      duration: 700.02,
      context: {
        user: {
          id: generateStr('f', stringLimit),
          email: generateStr('g', stringLimit),
          username: generateStr('h', stringLimit)
        },
        page: {
          referer: 'blah',
          url: 'http://a.com/script.js'
        }
      }
    })
  })

  it('truncate error', () => {
    const keywordLen = 15

    const error = {
      id: '',
      culprit: generateStr('a', keywordLen),
      exception: {
        message: generateStr('b', keywordLen),
        stacktrace: [
          {
            filename: generateStr('c', keywordLen),
            lineno: 123
          },
          {
            filename: generateStr('d', keywordLen),
            lineno: 200
          }
        ],
        type: generateStr('e', keywordLen)
      },
      context: {
        user: {
          id: generateStr('f', keywordLen),
          email: generateStr('g', keywordLen),
          username: generateStr('h', keywordLen)
        },
        tags: {
          foo: generateStr('i', keywordLen)
        }
      }
    }

    const stringLimit = 10
    const filtered = truncateError(error, { stringLimit })

    expect(filtered).toEqual({
      id: 'N/A',
      culprit: generateStr('a', stringLimit),
      exception: {
        message: generateStr('b', keywordLen),
        stacktrace: [
          {
            filename: generateStr('c', keywordLen),
            lineno: 123
          },
          {
            filename: generateStr('d', keywordLen),
            lineno: 200
          }
        ],
        type: generateStr('e', stringLimit)
      },
      context: {
        user: {
          id: generateStr('f', stringLimit),
          email: generateStr('g', stringLimit),
          username: generateStr('h', stringLimit)
        },
        tags: {
          foo: generateStr('i', stringLimit)
        }
      }
    })
  })
})
