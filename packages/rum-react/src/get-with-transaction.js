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
import hoistStatics from 'hoist-non-react-statics'

/**
 * Check if the given component is class based component
 * ex: class Component extends React.Component
 *
 * React internally uses this logic to check if it has to call new Component or Component
 * to decide between functional and class based components
 * https://github.com/facebook/react/blob/769b1f270e1251d9dbdce0fcbd9e92e502d059b8/packages/react-reconciler/src/ReactFiber.js#L297-L300
 */
function isReactClassComponent(Component) {
  const prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}

/**
 * Usage:
 *  - Pure function: `withTransaction('name','route-change')(Component)`
 *  - As a decorator: `@withTransaction('name','route-change')`
 */
function getWithTransaction(apm) {
  return function withTransaction(name, type) {
    return function(Component) {
      const configService = apm.serviceFactory.getService('ConfigService')
      if (!configService.isActive()) {
        return Component
      }

      if (!Component) {
        const loggingService = apm.serviceFactory.getService('LoggingService')
        loggingService.warn(
          `${name} is not instrumented since component property is not provided`
        )
        return Component
      }

      let ApmComponent = null
      /**
       * In react, there are two recommended ways to instantiate network requests inside components
       *  - in componentDidMount lifecycle which happens before rendering the component
       *  - useEffect hook which is supported in react > 16.7.x versions
       *
       * Since we are wrapping the underlying component that renders the route, We have to
       * account for any network effects that happens inside these two methods to capture those
       * requests as spans in the route-change transaction
       *
       * Parent component's componentDidMount and useEffect are always called after childs cDM and
       * effects are called (Ordering is preserved). So we check for our transaction finish
       * logic inside these methods to make sure we are capturing the span information
       */
      if (
        !isReactClassComponent(Component) &&
        typeof React.useEffect === 'function'
      ) {
        ApmComponent = function ApmComponent(props) {
          const transaction = apm.startTransaction(name, type, {
            canReuse: true
          })

          React.useEffect(() => {
            transaction && transaction.detectFinish()
            return () => transaction && transaction.detectFinish()
          })

          return <Component transaction={transaction} {...props} />
        }
      } else {
        ApmComponent = class ApmComponent extends React.Component {
          constructor(props) {
            super(props)
            /**
             * We need to start the transaction in constructor because otherwise,
             * we won't be able to capture what happens in componentDidMount of child
             * components since the parent component is mounted after child
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
            return <Component transaction={this.transaction} {...this.props} />
          }
        }
      }

      ApmComponent.displayName = `withTransaction(${Component.displayName ||
        Component.name})`
      ApmComponent.WrappedComponent = Component

      return hoistStatics(ApmComponent, Component)
    }
  }
}

export { getWithTransaction }
