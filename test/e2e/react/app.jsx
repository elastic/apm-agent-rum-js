import React from 'react'
import ReactDOM from 'react-dom'


var initElasticApm = require('../../..').init
var createApmBase = require('../e2e')

import { BrowserRouter as Router, Route, Link } from "react-router-dom";

var elasticApm = createApmBase({
  debug: true,
  serviceName: 'apm-agent-js-base-test-e2e-react',
  serviceVersion: '0.0.1',
  hasRouterLibrary: true
})

elasticApm.setInitialPageLoadName('react-initial-page-load')

import MainComponent from './main-component.jsx'

class CompositeComponent extends React.Component {
  render() {
    return (
      <span>Composite component</span>
    )
  }
}

class ES6Component extends React.Component {
  render() {
    return (
      <span id="ES6Component" onClick={() => render()}>es6 component</span>
    )
  }
}

var handleOnEnter = () => {
  console.log('onEtner', arguments)

}

var tr = elasticApm.startTransaction('App Load', 'page-load')
tr.isHardNavigation = true

function render() {
  ReactDOM.render(
    (
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
      </div>
    ),
    document.getElementById('app')
  )
}
var span = tr.startSpan('Render', 'app')
render()
span.end()

tr.detectFinish()