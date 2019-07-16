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

/*
    Usage:
        - Pure function: `withTransaction('name','route-change')(Component)`
        - As a decorator: `@withTransaction('name','route-change')`
 */

import React from 'react'
import hoistStatics from 'hoist-non-react-statics'

function getWithTransaction(apm) {
  return function withTransaction(name, type) {
    return function(WrappedComponent) {
      if (!WrappedComponent) {
        return WrappedComponent
      }
      class ApmComponent extends React.Component {
        constructor(props) {
          super(props)
          /**
           * We need to start the transaction in constructor because otherwise,
           * we won't be able to capture what happens in componentDidMount of child components.
           */
          this.transaction = apm.startTransaction(name, type, {
            canReuse: true
          })
        }

        componentDidMount() {
          if (this.transaction) {
            this.transaction.detectFinish()
          }
        }

        componentWillUnmount() {
          /**
           * It is possible that the transaction has ended before this unmount event,
           * in that case this is a noop.
           */
          if (this.transaction) {
            this.transaction.detectFinish()
          }
        }

        render() {
          // todo: should we pass the transaction down (could use react context provider instead)
          return (
            <WrappedComponent transaction={this.transaction} {...this.props} />
          )
        }
      }

      ApmComponent.displayName = `withTransaction(${WrappedComponent.displayName ||
        WrappedComponent.name})`
      ApmComponent.WrappedComponent = WrappedComponent

      return hoistStatics(ApmComponent, WrappedComponent)
    }
  }
}

export { getWithTransaction }
