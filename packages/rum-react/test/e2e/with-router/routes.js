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

import '@babel/polyfill'
import 'whatwg-fetch'
import React, { Suspense } from 'react'
import { render } from 'react-dom'
import {
  BrowserRouter,
  Link,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom'
import FunctionalComponent from '../components/func-component'
import { ApmRoutes } from '../../../src'
import createApmBase from '..'

const apm = createApmBase({
  logLevel: 'debug',
  serviceName: 'apm-agent-rum-routes-e2e-react',
  serviceVersion: '0.0.1',
  pageLoadTransactionName: '/notfound'
})

const RedirectNotFoundComponent = () => {
  const location = useLocation()
  return <Navigate to={`/notfound`} replace state={{ location }} />
}

const NotFound = () => <div>Not Found</div>

function App() {
  return (
    <React.Fragment>
      <ul>
        <li>
          <Link id="functional" to="/func">
            Functional
          </Link>
        </li>
      </ul>
      <Suspense fallback={<div>Loading...</div>}>
        <ApmRoutes>
          <Route path="/notfound" element={<NotFound />} />
          <Route path="/func" element={<FunctionalComponent path="/func" />} />

          {/* when no route matches */}
          <Route path="*" element={<RedirectNotFoundComponent />} />
        </ApmRoutes>
      </Suspense>
    </React.Fragment>
  )
}

render(
  <BrowserRouter basename="/test/e2e/with-router/">
    <App />
  </BrowserRouter>,
  document.getElementById('app'),
  () => {
    apm.getCurrentTransaction().detectFinish()
  }
)
