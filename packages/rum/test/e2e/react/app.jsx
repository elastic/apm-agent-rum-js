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

import React from 'react'
import ReactDOM from 'react-dom'
import MainComponent from './main-component.jsx'

const createApmBase = require('../')

var elasticApm = createApmBase({
  debug: true,
  serviceName: 'apm-agent-js-base-test-e2e-react',
  serviceVersion: '0.0.1',
  sendPageLoadTransaction: false
})

elasticApm.setInitialPageLoadName('react-initial-page-load')

// eslint-disable-next-line
class CompositeComponent extends React.Component {
  render() {
    return <span>Composite component</span>
  }
}

// eslint-disable-next-line
class ES6Component extends React.Component {
  render() {
    return (
      <span id="ES6Component" onClick={() => render()}>
        es6 component
      </span>
    )
  }
}

var tr = elasticApm.startTransaction('App Load', 'page-load')
tr.isHardNavigation = true

function render() {
  ReactDOM.render(
    <div>
      <Router basename="/test/e2e/react/">
        <div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/topics">Topics</Link>
            </li>
          </ul>

          <hr />

          <Route exact path="/" component={MainComponent} />
          <Route path="/about" component={MainComponent} />
          <Route path="/topics" component={MainComponent} />
        </div>
      </Router>
      {/* <MainComponent /> */}
      {/* <CompositeComponent /> */}
      {/* <ES6Component /> */}
    </div>,
    document.getElementById('app')
  )
}
var span = tr.startSpan('Render', 'app')
render()
span.end()

tr.detectFinish()
