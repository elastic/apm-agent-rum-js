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

import { registerServices as registerErrorServices } from './error-logging'
import { registerServices as registerPerfServices } from './performance-monitoring'
import { ServiceFactory } from './common/service-factory'
import {
  isPlatformSupported,
  scheduleMicroTask,
  scheduleMacroTask,
  isBrowser
} from './common/utils'
import { patchAll, patchEventHandler } from './common/patching'
import {
  PAGE_LOAD,
  ERROR,
  CONFIG_SERVICE,
  LOGGING_SERVICE,
  APM_SERVER
} from './common/constants'
import { getInstrumentationFlags } from './common/instrument'
import afterFrame from './common/after-frame'
import { bootstrap } from './bootstrap'
import { createTracer } from './opentracing'

function createServiceFactory() {
  registerPerfServices()
  registerErrorServices()
  const serviceFactory = new ServiceFactory()
  return serviceFactory
}

export {
  createServiceFactory,
  ServiceFactory,
  patchAll,
  patchEventHandler,
  isPlatformSupported,
  isBrowser,
  getInstrumentationFlags,
  createTracer,
  scheduleMicroTask,
  scheduleMacroTask,
  afterFrame,
  ERROR,
  PAGE_LOAD,
  CONFIG_SERVICE,
  LOGGING_SERVICE,
  APM_SERVER,
  bootstrap
}
