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

import { getInstrumentationFlags } from '../../src/common/instrument'
import {
  PAGE_LOAD,
  XMLHTTPREQUEST,
  FETCH,
  HISTORY,
  ERROR,
  EVENT_TARGET
} from '../../src/common/constants'

describe('Instrumentation', function() {
  it('disable all instrumentations when instrument config is false', () => {
    const flags = getInstrumentationFlags(false, [])

    expect(flags).toEqual({
      [PAGE_LOAD]: false,
      [XMLHTTPREQUEST]: false,
      [FETCH]: false,
      [HISTORY]: false,
      [ERROR]: false,
      [EVENT_TARGET]: false
    })
  })

  it('disable selective instrumentations via disableInstrumentations config', () => {
    const flags = getInstrumentationFlags(true, ['xmlhttprequest', 'history'])

    expect(flags).toEqual({
      [PAGE_LOAD]: true,
      [XMLHTTPREQUEST]: false,
      [FETCH]: true,
      [HISTORY]: false,
      [ERROR]: true,
      [EVENT_TARGET]: true
    })
  })
})
