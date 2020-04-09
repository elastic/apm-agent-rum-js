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

import 'promise-polyfill/src/polyfill'
import { apmBase } from '@elastic/apm-rum'
import { getGlobalConfig } from '../../../../../dev-utils/test-config'
import ApmServerMock from '../../../../rum-core/test/utils/apm-server-mock'

const globalConfig = getGlobalConfig()

export function initializeApmService(service, config) {
  console.log('E2E Global Configs', JSON.stringify(globalConfig, null, 2))
  const apmServer = apmBase.serviceFactory.getService('ApmServer')
  const { serverUrl } = globalConfig.agentConfig
  config.serverUrl = serverUrl
  const serverMock = new ApmServerMock(apmServer, globalConfig.useMocks)
  apmBase.serviceFactory.registerServiceInstance('ApmServer', serverMock)

  return service.init(config)
}
