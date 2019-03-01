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

import "@babel/polyfill"
import 'whatwg-fetch'
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import MainComponent from './main-component.jsx'

import { apm } from './rum'

var tr = apm.startTransaction('App Load', 'page-load')
tr.isHardNavigation = true


class App extends React.Component {
  render() {
    return (
      <div>

        <div>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/about'>About</Link>
            </li>
            <li>
              <Link to='/topics'>Topics</Link>
            </li>
            <li>
              <Link to='/topic/10'>Topic 10</Link>
            </li>
          </ul>

          <hr />
          <Route exact path='/' component={MainComponent} />
          <Route path='/about' component={MainComponent} />
          <Route path='/topics' component={MainComponent} />
          <Route path='/topic/:id' component={MainComponent} />
        </div>
        <div id='test-element'>Passed</div>
      </div>
    )
  }
}

App = withRouter(App)

function render() {
  ReactDOM.render(
    (
      <Router basename='/test/e2e/react/'>
        <App />
      </Router>
    ),
    document.getElementById('app')
  )
}
var span = tr.startSpan('Render', 'app')
render()
span.end()

tr.detectFinish()
