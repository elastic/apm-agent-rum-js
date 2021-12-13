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

import { apmBase } from '@elastic/apm-rum'
import { routeHooks } from './route-hooks'
import { getErrorHandler } from './error-handler'

export const ApmVuePlugin = {
  install: (app, options) => {
    const { router, apm = apmBase, config, captureErrors = true } = options
    const majorVersion = app.version.split('.').shift()

    /**
     * Initialize the APM with the config
     */
    apm.init(config)

    if (apm.isActive()) {
      /**
       * Hook router if provided
       */
      if (router) {
        routeHooks(router, apm)
      }

      if (captureErrors) {
        /**
         * Global error handler for capturing errors during
         * component renders
         */
        app.config.errorHandler = getErrorHandler(app, apm)
      }
    }
    /**
     * Provide the APM instance via $apm to be accessed in all Vue Components
     */
    if (majorVersion >= 3) app.config.globalProperties.$apm = apm
    /**
     * Backward compatibility with Vue 2
     */ else app.prototype.$apm = apm
  }
}
