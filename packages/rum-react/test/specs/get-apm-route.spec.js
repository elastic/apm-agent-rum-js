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

function Component(props) {
  return <h1>Testing, {props.name}</h1>
}

describe('ApmRoute', function() {
  it('should work Route component', function() {
    const ApmRoute = getApmRoute(new ApmBase(createServiceFactory()))

    const rendered = mount(
      <div>
        <Router initialEntries={['/']}>
          <ApmRoute path="/" component={Component} />
        </Router>
      </div>
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
    const serviceFactory = createServiceFactory()
    const apmBase = new ApmBase(serviceFactory)
    const loggingService = serviceFactory.getService('LoggingService')
    const ApmRoute = getApmRoute(apmBase)

    spyOn(loggingService, 'warn')

    const rendered = mount(
      <div>
        <Router initialEntries={['/']}>
          <ApmRoute
            path="/"
            render={() => <Component name={'render-test'} />}
          />
        </Router>
      </div>
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
})
