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

import { afterFrame } from '@elastic/apm-rum-core'

export function routeHooks(router, apm) {
  let transaction

  router.beforeEach((to, from, next) => {
    const matched = to.matched || []
    let path = to.path
    /**
     * Get the last matched route record which acts as stack when
     * route changes are pushed and popped out of the stack
     *
     * Also account for the slug pattern on the routes, to.path always
     * resolves the current slug param, but we need need to
     * use the slug pattern for the transaction name
     */
    if (matched.length > 0) {
      path = matched[matched.length - 1].path || path
    }
    transaction = apm.startTransaction(path, 'route-change', {
      managed: true,
      canReuse: true
    })
    next()
  })

  router.afterEach(() => {
    afterFrame(() => transaction && transaction.detectFinish())
  })
  /**
   * handle when the navigation is cancelled in `beforeEach` hook of components
   * where `next(error)` is called
   */
  router.onError(() => {
    transaction && transaction.end()
  })
}
