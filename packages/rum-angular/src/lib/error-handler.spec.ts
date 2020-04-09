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

import { ErrorHandler } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory } from '@elastic/apm-rum-core'
import { APM, ApmModule } from './apm.module'
import { ApmErrorHandler } from './error-handler'

describe('ApmErrorHandler', () => {
  let errorHandler: ApmErrorHandler

  function setUpApm() {
    TestBed.overrideProvider(APM, {
      useValue: new ApmBase(createServiceFactory(), false)
    })
  }

  function setUpAppModule() {
    TestBed.configureTestingModule({
      imports: [ApmModule],
      providers: [
        {
          provide: ErrorHandler,
          useClass: ApmErrorHandler
        }
      ]
    })
    setUpApm()
    errorHandler = TestBed.inject(ErrorHandler) as ApmErrorHandler
  }

  beforeEach(() => {
    setUpAppModule()
  })

  it('should capture errors on app', () => {
    expect(errorHandler).toBeInstanceOf(ApmErrorHandler)
    spyOn(errorHandler.apm, 'captureError')
    /**
     * We extend the angular default error handler which logs
     * the error to console, so we fake that in this test
     * to avoids logs in stdout
     */
    spyOn(ErrorHandler.prototype, 'handleError').and.callFake(() => undefined)
    const testError = new Error('Test')
    errorHandler.handleError(testError)

    expect(errorHandler.apm.captureError).toHaveBeenCalledWith(testError)
    expect(ErrorHandler.prototype.handleError).toHaveBeenCalled()
  })
})
