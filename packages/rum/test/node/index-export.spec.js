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

const elasticApm = require('@elastic/apm-rum')
const { init: namedInit, apm, apmBase, ApmBase } = require('@elastic/apm-rum')

describe('apm base', () => {
  it('should have default and named exports', () => {
    expect(elasticApm.init).toEqual(jasmine.any(Function))
    expect(namedInit).toEqual(jasmine.any(Function))
    expect(apm).toEqual(jasmine.any(Object))
    expect(apmBase).toEqual(jasmine.any(Object))
    expect(apmBase.init).toEqual(jasmine.any(Function))
    expect(ApmBase).toEqual(jasmine.any(Function))
  })

  it('should not log platform message on Node.js', () => {
    spyOn(console, 'log')
    /**
     * Delete module cache and run bootstrap again
     */
    let cache = require.cache
    for (let moduleId in cache) {
      delete cache[moduleId]
    }
    require('@elastic/apm-rum')

    expect(console.log).not.toHaveBeenCalled()
  })
})
