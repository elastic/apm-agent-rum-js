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

import { Inject, Injectable } from '@angular/core'
import { Router, NavigationStart } from '@angular/router'
import { ApmBase } from '@elastic/apm-rum'
import { afterFrame } from '@elastic/apm-rum-core'
import { APM } from './apm.module'

@Injectable({
  providedIn: 'root'
})
export class ApmService {
  constructor(@Inject(APM) public apm: ApmBase, public router: Router) {}

  init(config) {
    const apmInstance = this.apm.init(config)

    const configService = this.apm.serviceFactory.getService('ConfigService')
    if (!configService.isActive()) {
      return apmInstance
    }

    /**
     * Start listening to route change once we
     * intiailize to set the correct transaction names
     */
    this.observe()
    return apmInstance
  }

  observe() {
    let transaction
    this.router.events.subscribe(event => {
      const eventName = event.toString()
      if (eventName.indexOf('NavigationStart') >= 0) {
        const name = (event as NavigationStart).url
        transaction = this.apm.startTransaction(name, 'route-change', {
          managed: true,
          canReuse: true
        })
      } else if (eventName.indexOf('NavigationError') >= 0) {
        transaction && transaction.detectFinish()
      } else if (eventName.indexOf('NavigationEnd') >= 0) {
        if (!transaction) {
          return
        }

        /**
         * The below logic must be placed in NavigationEnd since
         * the we depend on the current route state to get the path
         *
         * Even If there are any redirects, the router state path
         * will be matched with the correct url on navigation end
         *
         * Traverse the activated route tree to figure out the nested
         * route path
         */
        const route = this.router.routerState.root.firstChild

        if (route) {
          let child = route
          let path = '/' + child.routeConfig.path
          while (child) {
            child = child.firstChild
            if (child && child.routeConfig) {
              const currentPath = child.routeConfig.path
              /**
               * Ignore empty path's in the route config
               */
              if (currentPath) {
                path += '/' + currentPath
              }
            }
          }
          transaction.name = path
        }

        afterFrame(() => transaction.detectFinish())
      }
    })
  }
}
