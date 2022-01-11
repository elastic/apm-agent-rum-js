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

import {
  BYTE_LIMIT,
  shouldUseFetchWithKeepAlive
} from '../../../src/common/http/fetch'
import { describeIf } from '../../../../../dev-utils/jasmine'

describe('shouldUseFetchWithKeepAlive', () => {
  function generatePayload(payloadSize) {
    return ''.padEnd(payloadSize)
  }

  describeIf(
    'browsers not supporting fetch API',
    () => {
      it('should return false', () => {
        const payloadSize = BYTE_LIMIT - 1
        const payload = generatePayload(payloadSize)

        expect(shouldUseFetchWithKeepAlive('POST', payload)).toBe(false)
      })
    },
    !window.fetch
  )

  describeIf(
    'browsers supporting fetch API',
    () => {
      it('should return true for a POST request whose payload size is lower than BYTE_LIMIT', () => {
        const payloadSize = BYTE_LIMIT - 1
        const payload = generatePayload(payloadSize)

        expect(shouldUseFetchWithKeepAlive('POST', payload)).toBe(true)
      })

      it('should return false for a POST request whose payload size is equal to BYTE_LIMIT', () => {
        const payloadSize = BYTE_LIMIT
        const payload = generatePayload(payloadSize)

        expect(shouldUseFetchWithKeepAlive('POST', payload)).toBe(false)
      })

      it('should return false for a POST request whose payload size is greater than BYTE_LIMIT', () => {
        const payloadSize = BYTE_LIMIT + 1
        const payload = generatePayload(payloadSize)

        expect(shouldUseFetchWithKeepAlive('POST', payload)).toBe(false)
      })

      it('should return false for a GET request', () => {
        expect(shouldUseFetchWithKeepAlive('GET')).toBe(false)
      })
    },
    window.fetch
  )
})

describe('sendFetchRequest', () => {})
