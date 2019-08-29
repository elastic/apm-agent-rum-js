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

import Enzyme, { render } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import React from 'react'

Enzyme.configure({ adapter: new Adapter() })

import { getWithTransaction } from '../../src/get-with-transaction'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory } from '@elastic/apm-rum-core'
import { getGlobalConfig } from '../../../../dev-utils/test-config'

function TestComponent(apm) {
  const withTransaction = getWithTransaction(apm)
  function Component(props) {
    return <h1>Testing, {props.name}</h1>
  }
  const WrappedComponent = withTransaction('test-transaction', 'test-type')(
    Component
  )
  expect(typeof WrappedComponent).toBe('function')
  const rendered = render(<WrappedComponent name="withTransaction" />)
  expect(rendered.length).toBe(1)
  var node = rendered[0]
  expect(node.name).toBe('h1')
  expect(node.type).toBe('tag')
  expect(rendered.text()).toBe('Testing, withTransaction')
}

describe('withTransaction', function() {
  const { serverUrl, serviceName } = getGlobalConfig().agentConfig
  let apmBase, serviceFactory

  beforeEach(() => {
    serviceFactory = createServiceFactory()
    apmBase = new ApmBase(serviceFactory, false)
    apmBase.init({
      active: true,
      serverUrl,
      serviceName,
      disableInstrumentations: ['page-load', 'error']
    })
  })

  it('should work if apm is disabled or not initialized', function() {
    TestComponent(new ApmBase(serviceFactory, true))
    TestComponent(apmBase)
  })

  it('should start transaction for components', function() {
    const transactionService = serviceFactory.getService('TransactionService')
    spyOn(transactionService, 'startTransaction')

    TestComponent(apmBase)
    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      'test-transaction',
      'test-type',
      { canReuse: true }
    )
  })

  it('should return WrappedComponent on falsy value and log warning', function() {
    const loggingService = serviceFactory.getService('LoggingService')
    spyOn(loggingService, 'warn')

    const withTransaction = getWithTransaction(apmBase)
    const comp = withTransaction('test-name', 'test-type')(undefined)
    expect(comp).toBe(undefined)
    expect(loggingService.warn).toHaveBeenCalledWith(
      'test-name is not instrumented since component property is not provided'
    )
  })

  it('should not instrument the route when rum is inactive', () => {
    const transactionService = serviceFactory.getService('TransactionService')
    spyOn(transactionService, 'startTransaction')

    apmBase.config({ active: false })
    TestComponent(apmBase)

    function Component() {
      return <h2>Component</h2>
    }
    const withTransaction = getWithTransaction(apmBase)

    const WrappedComponent = withTransaction('test-transaction', 'test-type')(
      Component
    )
    expect(WrappedComponent).toEqual(Component)
    expect(transactionService.startTransaction).not.toHaveBeenCalled()
  })
})
