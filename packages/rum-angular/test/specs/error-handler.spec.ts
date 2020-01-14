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

import { ApmErrorHandler } from '../../src/error-handler'
import { TestBed } from '@angular/core/testing'
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing'
import { ErrorHandler } from '@angular/core'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory } from '@elastic/apm-rum-core'

describe('ApmErrorHandler', () => {
  let errorHandler: ApmErrorHandler
  let apm

  function setUpApm() {
    apm = new ApmBase(createServiceFactory(), false)
    ApmErrorHandler.apm = apm
  }

  function setUpAppModule() {
    TestBed.resetTestEnvironment()
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    )
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ErrorHandler,
          useClass: ApmErrorHandler
        }
      ]
    })
    errorHandler = TestBed.get(ErrorHandler)
  }

  beforeEach(() => {
    setUpApm()
    setUpAppModule()
  })

  it('should capture errors on app', () => {
    expect(errorHandler).toBeInstanceOf(ApmErrorHandler)
    spyOn(apm, 'captureError')
    /**
     * We extend the angular default error handler which logs
     * the error to console, so we fake that in this test
     * to avoids logs in stdout
     */
    spyOn(ErrorHandler.prototype, 'handleError').and.callFake(() => undefined)
    const testError = new Error('Test')
    errorHandler.handleError(testError)

    expect(apm.captureError).toHaveBeenCalledWith(testError)
    expect(ErrorHandler.prototype.handleError).toHaveBeenCalled()
  })
})
