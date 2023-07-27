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

import { MAX_SPAN_DURATION } from '../../common/constants'

/**
 * start, end, baseTime - unsigned long long(PerformanceTiming)
 * representing the moment, in milliseconds since the UNIX epoch
 *
 * trStart & trEnd - DOMHighResTimeStamp, measured in milliseconds.
 *
 * We have to convert the long values in milliseconds before doing the comparision
 * eg: end - baseTime <= transactionEnd
 */
function shouldCreateSpan(start, end, trStart, trEnd, baseTime = 0) {
  return (
    typeof start === 'number' &&
    typeof end === 'number' &&
    start >= baseTime &&
    end > start &&
    start - baseTime >= trStart &&
    end - baseTime <= trEnd &&
    end - start < MAX_SPAN_DURATION &&
    start - baseTime < MAX_SPAN_DURATION &&
    end - baseTime < MAX_SPAN_DURATION
  )
}

export { shouldCreateSpan }
