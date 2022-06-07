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

import { createStackTraces } from '../../src/error-logging/stack-trace'
import stackParser from 'error-stack-parser'

describe('StackTraceService', function () {
  it('should produce correct number of frames', function (done) {
    function generateError() {
      throw new Error('test error')
    }
    setTimeout(function () {
      try {
        generateError()
      } catch (error) {
        var stackTraces = createStackTraces(stackParser, { error })
        expect(stackTraces.length).toBeGreaterThan(1)
        done()
      }
    }, 1)
  })

  describe('integration error-stack-parser library', () => {
    it('should generate stack trace from errorEvent when stackParser throws an error parsing it', () => {
      const stackParserFake = {
        parse: () => {
          throw new Error()
        }
      }

      const testErrorEvent = new Error()
      testErrorEvent.error = 'error event'
      testErrorEvent.lineno = 1
      testErrorEvent.colno = 30
      testErrorEvent.filename = '(inline script)'

      const [stackTrace] = createStackTraces(stackParserFake, testErrorEvent)

      expect(stackTrace.lineno).toBe(testErrorEvent.lineno)
      expect(stackTrace.colno).toBe(testErrorEvent.colno)
      expect(stackTrace.filename).toBe(testErrorEvent.filename)
    })

    it('should generate stack trace from errorEvent when the one returned from stackParser does not contain lineNumber', () => {
      const stackParserFake = {
        parse: () => {
          return [
            {
              filename: 'malformed parsing filename'
            }
          ]
        }
      }

      const testErrorEvent = new Error()
      testErrorEvent.error = 'error event'
      testErrorEvent.lineno = 4
      testErrorEvent.colno = 23
      testErrorEvent.filename = '(inline script)'

      const [stackTrace] = createStackTraces(stackParserFake, testErrorEvent)

      expect(stackTrace.lineno).toBe(testErrorEvent.lineno)
      expect(stackTrace.colno).toBe(testErrorEvent.colno)
      expect(stackTrace.filename).toBe(testErrorEvent.filename)
    })
  })
})
