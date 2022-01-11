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

import { bootstrap } from '../src/bootstrap'
import * as patcher from '../src/common/patching'
import * as pageVisibility from '../src/common/page-visibility'
import * as utils from '../src/common/utils'
import { initializeState, state } from '../src/state'
import { createServiceFactory } from '../src'
import { TRANSACTION_SERVICE, CONFIG_SERVICE } from '../src/common/constants'
import { spyOnFunction } from '../../../dev-utils/jasmine'

describe('bootstrap', function () {
  let serviceFactory
  let configService
  let transactionService

  beforeEach(() => {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService(CONFIG_SERVICE)
    transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
  })

  describe('on unsupported environments', () => {
    let nowFn

    beforeEach(() => {
      nowFn = window.performance.now
      window.performance.now = undefined
    })

    afterEach(() => {
      window.performance.now = nowFn
    })

    it('should log warning', () => {
      spyOn(console, 'log')
      bootstrap(configService, transactionService)

      expect(console.log).toHaveBeenCalledWith(
        '[Elastic APM] platform is not supported!'
      )
    })

    it('should return false', () => {
      expect(bootstrap(configService, transactionService)).toBe(false)
    })
  })

  describe('on supported environments', () => {
    afterEach(() => {
      // Since the flow of bootstrap mutates the global state
      // it should be restored
      initializeState()
      // Remove the added listener when bootstraping since window object is shared among all tests
      pageVisibility.unobservePageVisibility()
    })

    it('should return true', () => {
      expect(bootstrap(configService, transactionService)).toBe(true)
    })

    it('should call patchAll', () => {
      const patchAllSpy = spyOnFunction(patcher, 'patchAll')
      console.log(patchAllSpy)

      bootstrap(configService, transactionService)

      expect(patchAllSpy).toHaveBeenCalledTimes(1)
    })

    it('should call observePageVisibility', () => {
      const observeSpy = spyOnFunction(pageVisibility, 'observePageVisibility')

      bootstrap(configService, transactionService)

      expect(observeSpy).toHaveBeenCalledTimes(1)
      expect(observeSpy).toHaveBeenCalledWith(configService, transactionService)
    })

    it('should set a bootstrap time', () => {
      const anyTime = 123456789
      spyOnFunction(utils, 'now').and.returnValue(anyTime)

      bootstrap(configService, transactionService)
      expect(state.bootstrapTime).toBe(anyTime)
    })
  })
})
