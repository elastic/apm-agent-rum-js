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

import { QUEUE_ADD_TRANSACTION, QUEUE_FLUSH } from '../constants'
import { state } from '../../state'
import { now } from '../utils'

/**
 * @param configService
 * @param transactionService
 */
export function observePageVisibility(configService, transactionService) {
  if (document.visibilityState === 'hidden') {
    state.lastHiddenStart = 0
  }

  const visibilityChangeHandler = () => {
    if (document.visibilityState === 'hidden') {
      onPageHidden(configService, transactionService)
    }
  }
  const pageHideHandler = () => onPageHidden(configService, transactionService)

  // visibilitychange and pagehide listeners are added to window and in the
  // capture phase because it executes before the target or bubble phases,
  // so adding listeners there helps ensure they run before other code can cancel them.
  // More info: https://developers.google.com/web/updates/2018/07/page-lifecycle-api

  const useCapture = true
  window.addEventListener(
    'visibilitychange',
    visibilityChangeHandler,
    useCapture
  )

  // Safari 13 does not trigger visibilityChange event when reloading page
  // due to that fact pagehide listener is also added
  window.addEventListener('pagehide', pageHideHandler, useCapture)

  return () => {
    window.removeEventListener(
      'visibilitychange',
      visibilityChangeHandler,
      useCapture
    )
    window.removeEventListener('pagehide', pageHideHandler, useCapture)
  }
}

/**
 * Ends an ongoing transaction if any and flushes the events queue
 * @param configService
 * @param transactionService
 */
function onPageHidden(configService, transactionService) {
  const tr = transactionService.getCurrentTransaction()
  if (tr) {
    const unobserve = configService.observeEvent(QUEUE_ADD_TRANSACTION, () => {
      configService.dispatchEvent(QUEUE_FLUSH)
      state.lastHiddenStart = now()

      // unsubscribe listener to execute it only once.
      // otherwise in SPAs we might be finding situations where we would be executing
      // this logic as many times as we observed to this event
      unobserve()
    })

    tr.end()
  } else {
    configService.dispatchEvent(QUEUE_FLUSH)
    state.lastHiddenStart = now()
  }
}
