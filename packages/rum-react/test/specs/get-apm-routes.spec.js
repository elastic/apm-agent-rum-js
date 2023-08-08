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
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'

Enzyme.configure({ adapter: new Adapter() })

import {
  MemoryRouter as Router,
  Route,
  useNavigate,
  useLocation,
  useSearchParams,
  Navigate
} from 'react-router-dom'
import { ApmBase } from '@elastic/apm-rum'
import {
  createServiceFactory,
  TRANSACTION_SERVICE
} from '@elastic/apm-rum-core'
import { getApmRoutes } from '../../src/get-apm-routes'
import { getGlobalConfig } from '../../../../dev-utils/test-config'

let navigate
function Component(props) {
  // React-router util which allows navigating between routes
  // Cleaner than handling the history api manually
  navigate = useNavigate()

  return <h1>Testing, {props.name}</h1>
}

describe('ApmRoutes', function () {
  const { serverUrl, serviceName } = getGlobalConfig().agentConfig
  let serviceFactory, apmBase

  function createApm(active) {
    const apmBase = new ApmBase(serviceFactory, false)
    return apmBase.init({
      active,
      serverUrl,
      serviceName,
      disableInstrumentations: ['page-load', 'error']
    })
  }

  beforeEach(() => {
    serviceFactory = createServiceFactory()
    apmBase = createApm(true)
  })

  it('should display Component', function () {
    const ApmRoutes = getApmRoutes(apmBase)

    const rendered = mount(
      <Router initialEntries={['/']}>
        <ApmRoutes>
          <Route path="/" element={<Component name="Elastic" />} />
        </ApmRoutes>
      </Router>
    )

    var apmRoutes = rendered.find(ApmRoutes)
    var component = rendered.find(Component)

    expect(apmRoutes.name()).toBe('ApmRoutes')
    expect(component.text()).toBe('Testing, Elastic')
  })

  it('should not trigger full rerender on query change', function () {
    const ApmRoutes = getApmRoutes(apmBase)
    const transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    spyOn(transactionService, 'startTransaction')

    mount(
      <Router initialEntries={['/home']}>
        <ApmRoutes>
          <Route path="/home" element={<Component name="Elastic" />} />
          <Route path="/new" element={<div>new</div>} />
        </ApmRoutes>
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

    transactionService.startTransaction.calls.reset()

    // Move to new route
    navigate('/new')

    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      '/new',
      'route-change',
      {
        canReuse: true,
        managed: true
      }
    )

    transactionService.startTransaction.calls.reset()

    /**
     * Update query on existing route
     * do not trigger a new transaction
     */
    navigate('/new?test=foo')
    expect(transactionService.startTransaction).not.toHaveBeenCalled()
  })

  it('should start transaction for nested route', function () {
    const ApmRoutes = getApmRoutes(apmBase)
    const transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    spyOn(transactionService, 'startTransaction')

    mount(
      <Router initialEntries={['/company/careers']}>
        <ApmRoutes>
          <Route path="/company" element={<Component name="Elastic" />}>
            <Route path="careers" element={<Component name="Careers" />} />
          </Route>
        </ApmRoutes>
      </Router>
    )

    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      '/company/careers',
      'route-change',
      {
        canReuse: true,
        managed: true
      }
    )
  })

  it('should handle path with wildcard', function () {
    const ApmRoutes = getApmRoutes(apmBase)
    const transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    spyOn(transactionService, 'startTransaction')

    mount(
      <Router initialEntries={['/company/careers/engineering/extra']}>
        <ApmRoutes>
          <Route path="/company" element={<Component name="Elastic" />}>
            <Route path="careers/*" element={<Component name="Careers" />} />
          </Route>
        </ApmRoutes>
      </Router>
    )

    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      '/company/careers/*', // without the wildcard handling we would end up having /careers/* which is wrong
      'route-change',
      {
        canReuse: true,
        managed: true
      }
    )
  })

  it('should handle redirection', function () {
    const ApmRoutes = getApmRoutes(apmBase)
    const transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    spyOn(transactionService, 'startTransaction')

    const RedirectComponent = () => {
      const location = useLocation()
      return <Navigate to={`/home`} replace state={{ location }} />
    }

    mount(
      <Router initialEntries={['/redirect']}>
        <ApmRoutes>
          <Route path="/home" element={<Component name="Elastic" />} />
          <Route path="/redirect" element={<RedirectComponent />} />
        </ApmRoutes>
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
  })

  it('should not startTransaction when rum is inactive', function () {
    apmBase = createApm(false)
    const ApmRoutes = getApmRoutes(apmBase)
    const transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    spyOn(transactionService, 'startTransaction')

    mount(
      <Router>
        <ApmRoutes>
          <Route index element={<Component />} />
        </ApmRoutes>
      </Router>
    )

    expect(transactionService.startTransaction).not.toHaveBeenCalled()
  })

  it('should not start transaction when child changes after a queryparam update', function () {
    let navigate
    function ComponentWithChild() {
      navigate = useNavigate()
      const [searchParams] = useSearchParams()

      if (searchParams.toString() === 'test=elastic') {
        return <div>hello Elastic</div>
      }

      return (
        <div>
          <Child params={searchParams.toString()} />
        </div>
      )
    }

    function Child(props) {
      return <h1>Query params: {props.params}</h1>
    }

    const ApmRoutes = getApmRoutes(apmBase)
    const transactionService = serviceFactory.getService(TRANSACTION_SERVICE)
    spyOn(transactionService, 'startTransaction')

    const rendered = mount(
      <Router>
        <ApmRoutes initialEntries={['/', 'home']}>
          <Route path="/" element={<ComponentWithChild />}></Route>
          <Route path="/home" element={<ComponentWithChild />}></Route>
        </ApmRoutes>
      </Router>
    )

    // Navigate to home
    navigate('/home')
    expect(transactionService.startTransaction).toHaveBeenCalledWith(
      '/home',
      'route-change',
      {
        canReuse: true,
        managed: true
      }
    )

    var component = rendered.find(ComponentWithChild)
    expect(component.text()).toBe('Query params: ')

    transactionService.startTransaction.calls.reset()

    // Update query param
    navigate('?test=elastic')

    expect(transactionService.startTransaction).not.toHaveBeenCalled()
    // Confirm the component content is different than before
    expect(component.text()).toBe('hello Elastic')
  })
})
