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

import React from 'react'
import { afterFrame } from '@elastic/apm-rum-core'

function useFinishTransactionEffect(transaction) {
  /**
   * React guarantees the parent component effects are run after the child components effects
   * So once all the child components effects are run, we run the detectFinish logic
   * which ensures if the transaction can be completed or not.
   */
  React.useEffect(() => {
    afterFrame(() => {
      transaction && transaction.detectFinish()
    })
    return () => {
      /**
       * Incase the transaction is never ended, we check if the transaction
       * can be closed during unmount phase
       *
       * We call detectFinish instead of forcefully ending the transaction
       * since it could be a redirect route and we might prematurely close
       * the currently running transaction
       */
      transaction && transaction.detectFinish()
    }
  }, [])
}

export { useFinishTransactionEffect }
