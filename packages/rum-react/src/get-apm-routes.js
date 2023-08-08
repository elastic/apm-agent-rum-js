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
import { useFinishTransactionEffect } from './finish-transaction-effect'
import {
  Routes,
  useLocation,
  useNavigationType,
  matchRoutes,
  createRoutesFromChildren
} from 'react-router-dom'
import hoistNonReactStatics from 'hoist-non-react-statics'

function getApmRoutes(apm) {
  function ApmRoutes(props) {
    const location = useLocation()
    const navigationType = useNavigationType()

    // This effect makes sure the route-change transaction starts before the underlying components are painted
    // It's essential for POP navigations (when the user clicks the back or forward buttons in the browser)
    // When using useEffect, the agent was not associating ajax requests to
    // the route-change transaction. Instead, it was creating a http-request transaction and discarding
    // the route-change transaction for lack of spans.
    React.useLayoutEffect(
      () => {
        const routes = createRoutesFromChildren(props.children)
        handleRouteChange(apm, routes, location)
      },
      // query param changes should not trigger this effect
      // that's why we use `location.pathname` instead of `location`
      [location.pathname, navigationType, props.children]
    )

    useFinishTransactionEffect(apm.getCurrentTransaction())

    return <Routes {...props} />
  }

  hoistNonReactStatics(ApmRoutes, Routes)

  return ApmRoutes
}

function handleRouteChange(apm, routes, location) {
  if (!apm.isActive()) {
    return
  }

  // all the navigation types start a transaction, including REPLACE since we want to capture redirections
  const name = getRouteFromLocation(routes, location)
  apm.startTransaction(name, 'route-change', {
    managed: true,
    canReuse: true
  })
}

export function getRouteFromLocation(routes, location) {
  if (!routes || routes.length === 0) {
    return location.pathname
  }

  // There are cases where we can have more than one matchedRoute.
  // For instance, when using Nested Routes with a configuration such as `/user`, `/user/profile` and `/user/account`
  // if a user clicks on the link '/user/profile'
  // matchRoutes will return two results, a `route.path` with `/user` and the another one with `profile`
  const branches = matchRoutes(routes, location)
  let builtPath = ''
  if (branches) {
    for (let index = 0; index < branches.length; index++) {
      const branch = branches[index]
      const route = branch.route
      if (route) {
        if (route.index) {
          // this cover the cases where an index route has been defined. They don't have a `route.path` property
          // E.g. <Route index element={<Home />} />
          return branch.pathname
        }

        let path = route.path
        if (path) {
          // make sure we don't add an extra slash when concatenating
          const hasSlash =
            path[0] === '/' || builtPath[builtPath.length - 1] === '/'
          path = hasSlash ? path : `/${path}`
          builtPath += path

          // E.g `to` property from `<Link>` component matches to window.location.pathname
          if (branch.pathname === location.pathname) {
            // make sure wildcard routes are also handled
            const isWildcardRoute = builtPath.slice(-2) === '/*'

            // One case where the number of / can differ is if we have an element like
            // <Route path="/users/:userId/?:extraID?" element={<Users />}/>
            if (
              getNumberOfUrlSegments(builtPath) !==
                getNumberOfUrlSegments(branch.pathname) &&
              !isWildcardRoute
            ) {
              return path
            }

            // This contains each of the `route.path` found concatenated
            return builtPath
          }
        }
      }
    }
  }

  return location.pathname
}

export function getNumberOfUrlSegments(url) {
  return url.split('/').filter(currentSegment => currentSegment.length > 0)
    .length
}

export { getApmRoutes }
