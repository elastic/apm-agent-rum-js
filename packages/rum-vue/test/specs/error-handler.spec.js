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

import Vue from 'vue'
import { mount } from '@vue/test-utils'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory } from '@elastic/apm-rum-core'
import { getErrorHandler } from '../../src/error-handler'

describe('Error handler', () => {
  it('should capture errors via global error handler', done => {
    const apm = new ApmBase(createServiceFactory(), false)
    const error = new Error('Component Error')
    /**
     * To prevent the logging errors to the console
     */
    spyOn(window.console, 'error')

    const original = Vue.config.errorHandler
    Vue.config.errorHandler = getErrorHandler(Vue, apm)

    const ErrorComponent = {
      name: 'Error',
      template: '<div>error</div>',
      created: () => {
        throw error
      }
    }

    spyOn(apm, 'captureError').and.callFake(err => {
      expect(err).toEqual(error)
      expect(err.component).toEqual('Error')
      expect(err.file).toEqual('')
      expect(err.lifecycleHook).toEqual('created hook')
      done()
    })

    const wrapper = mount(ErrorComponent)

    Vue.config.errorHandler = original

    wrapper.destroy()
  })
})
