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

export function getErrorHandler(app, apm) {
  /**
   * If the user already installed a global error handler
   * we should call them after capturing it internally
   */
  const previousErrorHandler = app.config.errorHandler

  return (error, vm, info) => {
    if (vm && vm.$options) {
      const options = vm.$options
      let component
      if (vm.$root === vm) {
        component = 'Root'
      } else {
        component = options.name || options._componentTag || 'Anonymous'
      }

      error.component = component
      error.file = options.__file || ''
    }

    /**
     * Lifecycle hook the error was thrown if available
     */
    if (info) {
      error.lifecycleHook = info
    }

    apm.captureError(error)

    if (typeof previousErrorHandler === 'function') {
      previousErrorHandler.call(this, error, vm, info)
    }
    /**
     * Logs the error to browser console similar
     * to original Vue logError
     */
    console.error(error)
  }
}
