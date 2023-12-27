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

import { addSpanContext, addTransactionContext } from '../../src/common/context'
import resourceEntries from '../fixtures/resource-entries'
import Span from '../../src/performance-monitoring/span'
import Transaction from '../../src/performance-monitoring/transaction'
import { PAGE_EXIT, PAGE_LOAD } from '../../src/common/constants'
import { mockGetEntriesByType } from '../utils/globals-mock'

describe('Context', () => {
  function createSpanWithData(url, isXHR = true) {
    const span = new Span(`GET ${url}`, 'external')
    const data = {
      url,
      method: 'GET'
    }
    /**
     * Testing for both XHR and Fetch spans
     */
    if (isXHR) {
      data.target = {
        status: 200
      }
    } else {
      data.response = {
        status: 200
      }
    }
    span.end()
    addSpanContext(span, data)
    return span
  }

  it('should add external span context with all fields', () => {
    let url = 'http://user:pass@testing.local:1234/path?query'
    let span = createSpanWithData(url)
    expect(span.context).toEqual({
      http: {
        method: 'GET',
        url: 'http://[REDACTED]:[REDACTED]@testing.local:1234/path?query',
        status_code: 200
      },
      destination: {
        service: {
          name: '',
          resource: 'testing.local:1234',
          type: ''
        },
        address: 'testing.local',
        port: 1234
      }
    })

    url = 'https://www.elastic.co:443/products/apm'
    span = createSpanWithData(url, false)
    expect(span.context).toEqual({
      http: {
        method: 'GET',
        url: 'https://www.elastic.co/products/apm',
        status_code: 200
      },
      destination: {
        service: {
          name: '',
          resource: 'www.elastic.co:443',
          type: ''
        },
        address: 'www.elastic.co',
        port: 443
      }
    })

    url = 'http://[::1]'
    span = createSpanWithData(url)
    expect(span.context).toEqual({
      http: {
        method: 'GET',
        url,
        status_code: 200
      },
      destination: {
        service: {
          name: '',
          resource: '[::1]:80',
          type: ''
        },
        address: '::1',
        port: 80
      }
    })

    /**
     * Explicit test to account for service name
     * default scheme and port
     */
    url = 'https://[::1]:80/'
    span = createSpanWithData(url)
    expect(span.context).toEqual({
      http: {
        method: 'GET',
        url,
        status_code: 200
      },
      destination: {
        service: {
          name: '',
          resource: '[::1]:80',
          type: ''
        },
        address: '::1',
        port: 80
      }
    })
  })

  it('should add resource timing span context correctly', () => {
    const url = 'http://example.com'

    const entry = resourceEntries.filter(({ name }) => name === url)[0]
    const span = new Span(url, 'resource')
    span.end()
    addSpanContext(span, { url, entry })

    expect(span.context).toEqual({
      http: {
        url,
        response: {
          transfer_size: 97918,
          encoded_body_size: 97717,
          decoded_body_size: 97717
        }
      },
      destination: {
        service: {
          name: '',
          resource: 'example.com:80',
          type: ''
        },
        address: 'example.com',
        port: 80
      }
    })
  })

  it('should add navigation timing span context', () => {
    const url = 'https://example.com'
    const span = new Span(url, 'hard-navigation')
    span.end()
    addSpanContext(span, { url })

    expect(span.context).toEqual({
      destination: {
        service: {
          name: '',
          resource: 'example.com:443',
          type: ''
        },
        address: 'example.com',
        port: 443
      }
    })
  })

  it('should enrich transaction with context info based on type', () => {
    const transaction = new Transaction('test', 'custom')
    const trContext = { tags: { tag1: 'tag1' } }
    transaction.addContext(trContext)
    transaction.end()
    const userContext = {
      user: {
        email: 'test@example.com',
        id: '123'
      }
    }
    const configContext = {
      ...userContext,
      tags: {
        message: 'test'
      }
    }
    addTransactionContext(transaction, configContext)
    expect(transaction.context).toEqual({
      page: {
        referer: jasmine.any(String),
        url: jasmine.any(String)
      },
      ...userContext,
      ...trContext
    })

    const unMock = mockGetEntriesByType()
    const pageloadTr = new Transaction('test', PAGE_LOAD)
    pageloadTr.end()
    addTransactionContext(pageloadTr, configContext)
    expect(pageloadTr.context).toEqual({
      page: {
        referer: jasmine.any(String),
        url: jasmine.any(String)
      },
      response: {
        transfer_size: 26941,
        encoded_body_size: 105297,
        decoded_body_size: 42687,
        headers: {
          'server-timing': 'edge;dur=4, cdn-cache;desc=HIT'
        }
      },
      ...userContext
    })

    unMock()
  })

  it('should make sure that the page-exit transaction page context remains as it was defined', () => {
    const tr = new Transaction(PAGE_EXIT, PAGE_EXIT)
    tr.addContext({
      page: {
        url: 'the-url-to-reuse'
      }
    })
    addTransactionContext(tr)
    expect(tr.context.page.url).toBe('the-url-to-reuse')
  })
})
