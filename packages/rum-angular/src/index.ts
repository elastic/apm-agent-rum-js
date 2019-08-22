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
  Router,
  Event,
  NavigationStart,
  NavigationEnd,
  NavigationError
} from '@angular/router'
import { Injectable } from '@angular/core'
import { init as apmInit, apm } from '@elastic/apm-rum'

@Injectable({
  providedIn: 'root'
})
export class ApmService {
  constructor(public router: Router) {}

  init(config) {
    apmInit(config)
    /**
     * Start listening to route change once we
     * intiailize to set the correct transaction names
     */
    this.observe()
  }

  observe() {
    let transaction
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        const name = event.url
        transaction = apm.startTransaction(name, 'route-change', {
          canReuse: true
        })
      } else if (event instanceof NavigationError) {
        transaction && transaction.detectFinish()
      } else if (event instanceof NavigationEnd) {
        if (transaction) {
          /**
           * If there are any redirects, take care of changing the
           * transaction name on Navigation End
           */
          const { url, urlAfterRedirects } = event
          if (url !== urlAfterRedirects) {
            transaction.name = urlAfterRedirects
          }
          /**
           * Schedule the transaction finish logic on the next
           * micro task since most of the angular components wait for
           * Observables resolution on ngInit to fetch the neccessary
           * data for mounting
           */
          Promise.resolve(() => transaction.detectFinish())
        }
      }
    })
  }
}
