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

/**
 * shims are required for enzyme to work on older browsers.
 */

import 'airbnb-js-shims/target/es2015'
import React from 'react'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

import { MemoryRouter as Router, Route } from 'react-router-dom'
import { ApmBase } from '@elastic/apm-rum'
import { createServiceFactory } from '@elastic/apm-rum-core'
import { getApmRoute } from '../../src/get-apm-route'
import { getGlobalConfig } from '../../../../dev-utils/test-config'

function Component(props) {
  return <h1>Testing, {props.name}</h1>
}

describe('ApmRoute', function() {
  const { serverUrl, serviceName } = getGlobalConfig().agentConfig
  let serviceFactory, apmBase

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

  it('should work Route component', function() {
    const ApmRoute = getApmRoute(apmBase)

    const rendered = mount(
      <Router initialEntries={['/']}>
        <ApmRoute path="/" component={Component} />
      </Router>
    )

    var apmRoute = rendered.find(ApmRoute)
    var route = rendered.find(Route)
    var component = rendered.find(Component)
    expect(apmRoute.name()).toBe('ApmRoute')
    expect(route.name()).toBe('Route')
    expect(route.props()).toEqual(
      jasmine.objectContaining({ path: '/', component: jasmine.any(Function) })
    )
    expect(component.text()).toBe('Testing, ')
  })

  it('should work with Route render and log warning', function() {
    const loggingService = serviceFactory.getService('LoggingService')
    const ApmRoute = getApmRoute(apmBase)

    spyOn(loggingService, 'warn')

    const rendered = mount(
      <Router initialEntries={['/']}>
        <ApmRoute path="/" render={() => <Component name={'render-test'} />} />
      </Router>
    )

    var apmRoute = rendered.find(ApmRoute)
    var route = rendered.find(Route)
    var component = rendered.find(Component)
    expect(apmRoute.name()).toBe('ApmRoute')
    expect(route.name()).toBe('Route')
    expect(route.props()).toEqual(
      jasmine.objectContaining({ path: '/', render: jasmine.any(Function) })
    )
    expect(component.text()).toBe('Testing, render-test')
    expect(loggingService.warn).toHaveBeenCalledWith(
      '/ is not instrumented since component property is not provided'
    )
  })

  it('should not trigger full rerender on query change', function() {
    const ApmRoute = getApmRoute(apmBase)
    const transactionService = serviceFactory.getService('TransactionService')
    spyOn(transactionService, 'startTransaction')

    const rendered = mount(
      <Router initialEntries={['/home', '/new']}>
        <>
          <ApmRoute path="/home" component={Component} />
          <ApmRoute path="/new" component={() => <h1>New</h1>} />
        </>
      </Router>
    )

    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      '/home',
      'route-change',
      {
        canReuse: true,
        managed: true
      }
    )
    const HomeComponent = rendered.find(Component)

    const history = HomeComponent.props().history
    // Move to new route
    history.push({ pathname: '/new' })
    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      '/new',
      'route-change',
      {
        canReuse: true,
        managed: true
      }
    )

    /**
     * Update query on existing route
     * do not trigger a new transaction
     */
    history.push({ pathname: '/new', search: '?test=foo' })
    expect(transactionService.startTransaction).toHaveBeenCalledTimes(2)
  })
})
