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

import { isPlatformSupported, isBrowser, now } from './common/utils'
import { patchAll } from './common/patching'
import { state } from './state'

let enabled = false
export function bootstrap() {
  if (isPlatformSupported()) {
    patchAll()
    bootstrapPerf()
    state.bootstrapTime = now()
    enabled = true
  } else if (isBrowser) {
    /**
     * Print this error message only on the browser console
     * on unsupported browser versions
     */
    console.log('[Elastic APM] platform is not supported!')
  }

  return enabled
}

export function bootstrapPerf() {
  if (document.visibilityState === 'hidden') {
    state.lastHiddenStart = 0
  }

  window.addEventListener(
    'visibilitychange',
    () => {
      if (document.visibilityState === 'hidden') {
        state.lastHiddenStart = performance.now()
      }
    },
    { capture: true }
  )
}
