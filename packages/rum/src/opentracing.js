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

import { init, apm, apmBase, ApmBase } from './index'
import { Tracer } from 'opentracing/lib/tracer'
import { createTracer as createElasticTracer } from '@elastic/apm-rum-core'

function createTracer(apmBase) {
  /**
   * If the platform is not supported, return
   * the default tracer from OT
   */
  if (apmBase._disable) {
    return new Tracer()
  }
  return createElasticTracer(apmBase.serviceFactory)
}

if (typeof window !== 'undefined' && window.elasticApm) {
  window.elasticApm.createTracer = createTracer.bind(
    window.elasticApm,
    window.elasticApm
  )
}

export default createTracer
export { createTracer, init, apm, apmBase, ApmBase }
