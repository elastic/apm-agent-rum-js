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

// export public core APIs.

import ErrorLogging from './error-logging'
import PerformanceMonitoring from './performance-monitoring'
import ServiceFactory from './common/service-factory'
import {
  isPlatformSupported,
  scheduleMicroTask,
  scheduleMacroTask
} from './common/utils'
import { patchAll, patchEventHandler } from './common/patching'
import { PAGE_LOAD, ERROR } from './common/constants'
import { getInstrumentationFlags } from './common/instrument'
import { createTracer } from './opentracing'

function createServiceFactory() {
  const serviceFactory = new ServiceFactory()
  serviceFactory.registerCoreServices()
  ErrorLogging.registerServices(serviceFactory)
  PerformanceMonitoring.registerServices(serviceFactory)
  return serviceFactory
}

export {
  createServiceFactory,
  ServiceFactory,
  patchAll,
  patchEventHandler,
  isPlatformSupported,
  ERROR,
  PAGE_LOAD,
  getInstrumentationFlags,
  createTracer,
  scheduleMicroTask,
  scheduleMacroTask
}
