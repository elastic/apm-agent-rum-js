---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/react-integration.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
---

# React integration [react-integration]

This document covers how to use Real User Monitoring JavaScript agent with React applications. Please see our [Getting started guide](/reference/set-up-apm-real-user-monitoring-javascript-agent.md) for configuring the Real User Monitoring agent.

## Installing Elastic APM React package [installing-react-integration]

Install the `@elastic/apm-rum-react` package as a dependency to your application:

```bash
npm install @elastic/apm-rum-react --save
```


### Instrumenting your React application [_instrumenting_your_react_application]

The React integration package provides two approaches to instrumenting your application:


#### Instrumenting application routes with @elastic/apm-rum-react >= 2.0.0 [_instrumenting_application_routes_with_elasticapm_rum_react_2_0_0]

To instrument the application routes, you can use `ApmRoutes` component provided in the package. `ApmRoutes` creates a transaction that has the path of the `Route` as its name and has `route-change` as its type.

::::{note}
`ApmRoutes` only supports applications using version `6` of the [`react-router`](https://github.com/remix-run/react-router) library.
::::


::::{note}
`RouterProvider` instrumentation is not currently supported.
::::


First import `ApmRoutes` from the `@elastic/apm-rum-react` package:

```js
import { ApmRoutes } from '@elastic/apm-rum-react'
```

Then, use the `ApmRoutes` component from the `react-router` library. Every `<Route>` wrapped by `<ApmRoutes>` will be monitored.

```js
class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <ApmRoutes>
          <Route path="/" element={<HomeComponent />} />
          <Route path="/about" element={<AboutComponent />} />
        </ApmRoutes>
      </BrowserRouter>
    )
  }
}
```


#### Instrumenting application routes with @elastic/apm-rum-react < 2.0.0 [_instrumenting_application_routes_with_elasticapm_rum_react_2_0_0_2]

To instrument the application routes, you can use `ApmRoute` component provided in the package. `ApmRoute` creates a transaction that has the path of the `Route` as its name and has `route-change` as its type.

::::{note}
`ApmRoute` only supports applications using versions `4` and `5` of the [`react-router`](https://github.com/remix-run/react-router) library.
::::


First import `ApmRoute` from the `@elastic/apm-rum-react` package:

```js
import { ApmRoute } from '@elastic/apm-rum-react'
```

Then, you should replace `Route` components from the `react-router` library with `ApmRoute`. You can use `ApmRoute` in any of the routes that you would like to monitor, therefore, you don’t have to change all of your routes:

```js
class App extends React.Component {
  render() {
    return (
      <div>
        <ApmRoute
          exact
          path="/"
          component={() => (
            <Redirect
              to={{
                pathname: '/home'
              }}
            />
          )}
        />
        <ApmRoute path="/home" component={HomeComponent} />
        <Route path="/about" component={AboutComponent} />
      </div>
    )
  }
}
```

::::{note}
`ApmRoute` only instruments the route if component property is provided, in other cases, e.g. using `render` or `children` properties, ApmRoute will only renders the route without instrumenting it, please instrument the individual component using `withTransaction` in these cases instead.
::::



#### Instrumenting individual React components [_instrumenting_individual_react_components]

First import `withTransaction` from the `@elastic/apm-rum-react` package:

```js
import { withTransaction } from '@elastic/apm-rum-react'
```

Then, you can use `withTransaction` as a function to wrap your React components:

```js
class AboutComponent extends React.Component { }
export default withTransaction('AboutComponent', 'component')(AboutComponent)
```

::::{note}
`withTransaction` accepts two parameters, "transaction name" and "transaction type". If these parameters are not provided, the defaults documented in [Transaction API](/reference/transaction-api.md) will be used.
::::



#### Instrumenting lazy loaded routes [_instrumenting_lazy_loaded_routes]

When the route is rendered lazily with components using `React.lazy` or a similar API, it is currently not possible to auto instrument the components dependencies(JavaScript bundles, API calls, etc) via `ApmRoute` because React suspends the underlying component until the required dependencies are available which means our transaction is not started till React starts rendering the underlying component. To instrument these lazy rendered routes and capture the spans associated with the components, you’ll need to manually instrument the code with the `withTransaction` API.

```js
import React, { Component, Suspense, lazy } from 'react'
import { Route, Switch } from 'react-router-dom'
import { withTransaction } from '@elastic/apm-rum-react'

const Loading = () => <div>Loading</div>
const LazyRouteComponent = lazy(() => import('./lazy-component'))

function Routes() {
  return (
    <Suspense fallback={Loading()}>
      <Switch>
        <Route path="/lazy" component={LazyRouteComponent} />
      </Switch>
    </Suspense>
  )
}

// lazy-component.jsx
class LazyComponent extends Component {}
export default withTransaction('LazyComponent', 'component')(LazyComponent)
```


