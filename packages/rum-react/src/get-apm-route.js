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
import { Route } from 'react-router-dom'
import { getWithTransaction } from './get-with-transaction'

function getApmRoute(apm) {
  const withTransaction = getWithTransaction(apm)

  return class ApmRoute extends React.Component {
    constructor(props) {
      super(props)
      const { path, component } = props
      /**
       * Having the ApmComponent on state ensures that we capture the SPA
       * navigation only when route changes/mount and not on re-renders
       * Ex: updating query params from child components
       */
      this.state = {
        apmComponent: withTransaction(path, 'route-change')(component)
      }
    }

    render() {
      return <Route {...this.props} component={this.state.apmComponent} />
    }
  }
}

export { getApmRoute }
