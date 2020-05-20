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

import Promise from 'promise-polyfill'
import { apmBase } from '../../src/'
import { isPlatformSupported } from '@elastic/apm-rum-core'
import { getGlobalConfig } from '../../../../dev-utils/test-config'

describe('index', function() {
  const globalConfig = getGlobalConfig()
  const { serverUrl, serviceName } = globalConfig.agentConfig
  var originalTimeout

  beforeEach(function() {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000
    let cache = require.cache
    for (let moduleId in cache) {
      delete cache[moduleId]
    }
  })

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout
  })

  it('should log only on browser environments', () => {
    // Pass unsupported check
    const nowFn = window.performance.now
    window.performance.now = undefined

    spyOn(console, 'log')

    require('../../src/')

    expect(console.log).toHaveBeenCalledWith(
      '[Elastic APM] platform is not supported!'
    )

    window.performance.now = nowFn
  })

  it('should init ApmBase', function(done) {
    var apmServer = apmBase.serviceFactory.getService('ApmServer')
    if (globalConfig.useMocks) {
      apmServer._makeHttpRequest = function() {
        return Promise.resolve()
      }
    }

    spyOn(apmServer, 'sendEvents').and.callThrough()

    apmBase.init({
      serverUrl,
      serviceName,
      flushInterval: 100
    })

    apmBase.setUserContext({
      usertest: 'usertest',
      id: 'userId',
      username: 'username',
      email: 'email'
    })
    apmBase.setCustomContext({ testContext: 'testContext' })
    apmBase.addLabels({ testTagKey: 'testTagValue' })

    try {
      throw new Error('ApmBase test error')
    } catch (error) {
      apmBase.captureError(error)
      expect(apmServer.sendEvents).not.toHaveBeenCalled()

      if (isPlatformSupported()) {
        expect(apmServer.queue.items.length).toBe(1)
        setTimeout(() => {
          expect(apmServer.sendEvents).toHaveBeenCalled()
          var callData = apmServer.sendEvents.calls.mostRecent()
          callData.returnValue.then(
            () => {
              // Wait before ending the test to make sure the result are processed by the agent.
              // Karma changes the iframe src when the tests finish and Chrome would cancel any
              // request that was made by an iframe that got removed or had it's src changed
              // and the agent would recieved http status 0
              setTimeout(() => {
                done()
              }, 100)
            },
            reason => {
              fail('Failed sending error:', reason)
              done()
            }
          )
        }, 200)
      } else {
        done()
      }
    }
  })

  it('should not throw error on global Promise patching', () => {
    window.count = 0
    window.Promise = {
      delay: () => ++window.count
    }
    window.capturedTestErrors = []
    window.onerror = function(err) {
      window.capturedTestErrors.push(err)
    }

    /**
     * execute module again to check if global promise is overriden
     */
    require('../../src/')

    /**
     * Execute the patched Promise function
     */
    window.Promise.delay()
    expect(window.count).toBe(1)
    expect(window.capturedTestErrors.length).toBe(0)
  })
})
