---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/configuration.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
---

# Configuration [configuration]

While initializing the agent you can provide the following configuration options:


## `serviceName` [service-name]

* **Type:** String
* **Required**

The Elastic APM service name is used to differentiate data from each of your services. Can only contain alphanumeric characters, spaces, underscores, and dashes (must match `^[a-zA-Z0-9 _-]+$`).


## `serverUrl` [server-url]

* **Type:** String
* **Default:** `http://localhost:8200`

The URL used to make requests to the APM Server.


## `serverUrlPrefix` [server-url-prefix]

* **Type:** String
* **Default** `/intake/v${apiVersion}/rum/events`

The server prefix URL used to make requests to the APM Server. Some ad blockers block outgoing requests from the browser if the default server prefix URL is being used. Using a custom server prefix URL can be used to evade the ad blocker.

::::{note}
If the default server prefix URL is overwritten, the reverse proxy that sits between the APM Server and the rum agent must reroute traffic to `/intake/v${apiVersion}/rum/events` so the APM Server knows what intake API to use.
::::



## `serviceVersion` [service-version]

* **Type:** String

The version of the app. This could be the version from your `package.json` file, a git commit reference, or any other string that might help you reference a specific version. This option is used on the APM Server to find the right sourcemap file to apply to the stack trace.


## `active` [active]

* **Type:** Boolean
* **Default:** `true`

A Boolean value that specifies if the agent should be active or not. If active, the agent will send APM transactions and track errors. This option can be used to deactivate the agent in your staging environment. It can also be used to sample a number of clients. Below is an example to sample 10% of the page loads:

```js
var options = {
  active: Math.random() < 0.1
}
```


## `instrument` [instrument]

* **Type:** Boolean
* **Default:** `true`

A Boolean value that specifies if the agent should automatically instrument the application to collect performance metrics for the application.

::::{note}
Both active and instrument needs to be true for instrumentation to be running.
::::



## `disableInstrumentations` [disable-instrumentations]

* **Type:** Array
* **Default:** `[]`

A list of instrumentations which can be disabled. When disabled, no transactions or spans will be created for that type. The valid options are:

* `page-load`
* `history`
* `eventtarget`
* `click`
* `xmlhttprequest`
* `fetch`
* `error`

::::{note}
To disable all `http-request` transactions, add both `fetch` and `xmlhttprequest`. to this config.
::::


::::{note}
To disable `user-interaction` transactions,  add `eventtarget` or `click` to this config. The option `eventtarget` is deprecated and will be removed in the future releases.
::::



## `environment` [environment]

* **Type:** String
* **Default:** `''`

The environment where the service being monitored is deployed, e.g. "production", "development", "test", etc.

Environments allow you to easily filter data on a global level in the APM app. It’s important to be consistent when naming environments across agents. See [environment selector](docs-content://solutions/observability/apm/filter-data.md#apm-filter-your-data-service-environment-filter) in the APM app for more information.

::::{note}
This feature is fully supported in the APM app in Kibana versions >= 7.2. You must use the query bar to filter for a specific environment in versions prior to 7.2.
::::



## `logLevel` [log-level]

* **Type:** String
* **Default:** `'warn'`

Set the verbosity level for the agent. This does not have any influence on the types of errors that are sent to the APM Server. This option is useful when you want to report an issue with the agent to us.

Possible levels are: `trace`, `debug`, `info`, `warn`, and `error`.


## `apiVersion` [api-version]

* **Type:** number
* **Default:** `2`

This denotes the version of APM Server’s intake API. Setting this value to any number above `2` will compress the events (transactions and errors) payload sent to the server.

::::{note}
This feature requires APM Server >= 7.8. Setting this flag to number > 2 with older APM server version would break the RUM payload from reaching the server.
::::



## `breakdownMetrics` [breakdown-metrics]

* **Type:** Boolean
* **Default:** `false`

Enable or disable the tracking and collection of breakdown metrics for the transaction.

::::{note}
This feature requires APM Server and Kibana >= 7.4. Setting this flag to `true` with older APM server version would break the RUM payload from reaching the server.
::::


::::{note}
Breakdown distribution for the transaction varies depending on the type of the transaction. To understand the different types, see [*Breakdown Metrics*](/reference/breakdown-metrics.md)
::::



## `flushInterval` [flush-interval]

* **Type:** Number
* **Default:** `500`

The agent maintains a single queue to record transaction and error events when they are added. This option sets the flush interval in **milliseconds** for the queue.

::::{note}
After each flush of the queue, the next flush isn’t scheduled until an item is added to the queue.
::::



## `pageLoadTraceId` [page-load-trace-id]

* **Type:** String

This option overrides the page load transactions trace ID.


## `pageLoadParentId` [page-load-parent-id]

* **Type:** String

This option allows the creation of the page load transaction as child of an existing one. By default, the agent treats it as the root transaction.


## `pageLoadSampled` [page-load-sampled]

* **Type:** Boolean

This option overrides the page load transactions sampled property. It is only applicable to `page-load` transactions.


## `pageLoadSpanId` [page-load-span-id]

* **Type:** String

This option overrides the ID of the span that is generated for receiving the initial document.


## `pageLoadTransactionName` [page-load-transaction-name]

* **Type:** String

This option sets the name for the page load transaction. By default, transaction names for hard (page load) and soft (route change) navigations are inferred by the agent based on the current URL. Check the [custom initial page load transaction names](/reference/custom-transaction-name.md) documentation for more details.


## `distributedTracing` [distributed-tracing]

* **Type:** Boolean
* **Default:** `true`

Distributed tracing is enabled by default. Use this option to disable it.


## `distributedTracingOrigins` [distributed-tracing-origins]

* **Type:** Array
* **Default:** `[]`

This option can be set to an array containing one or more Strings or RegExp objects and determines which origins should be monitored as part of distributed tracing. This option is consulted when the agent is about to add the distributed tracing HTTP header (`traceparent`) to a request. Please note that each item in the array should be a valid URL containing the origin (other parts of the url are ignored) or a RegExp object. If an item in the array is a string, an exact match will be performed. If it’s a RegExp object, its test function will be called with the request origin.

```js
var options = {
  distributedTracingOrigins: ['https://example.com', /https?:\/\/example\.com:\d{4}/]
}
```


## `propagateTracestate` [propagate-tracestate]

* **Type:** Boolean
* **Default:** `false`

When distributed tracing is enabled, this option can be used to propagate the [tracestate](https://www.w3.org/TR/trace-context/#tracestate-header) HTTP header to the configured origins. Before enabling this flag, make sure to change your [server configuration](/reference/distributed-tracing.md#server-configuration) to avoid Cross-Origin Resource Sharing errors.


## Event throttling [event-throttling]

Throttle the number of events sent to APM Server.


### `eventsLimit` [events-limit]

By default, the agent can only send up to `80` events every `60000` milliseconds (one minute).

* **Type:** Number
* **Default:** `80`


### `transactionSampleRate` [transaction-sample-rate]

* **Type:** Number
* **Default:** `1.0`

A number between `0.0` and `1.0` that specifies the sample rate of transactions. By default, all transactions are sampled.


### `centralConfig` [central-config]

* **Type:** Boolean
* **Default:** `false`

This option activates APM Agent Configuration via Kibana. When set to `true`, the agent starts fetching configurations via the APM Server during the initialization phase. These central configurations are cached in `sessionStorage`, and will not be fetched again until the session is closed and/or `sessionStorage` is cleared. In most cases, this means when the tab/window of the page is closed.

::::{note}
Currently, only [transaction sample rate](#transaction-sample-rate) can be configured via Kibana.
::::


::::{note}
This feature requires APM Server v7.5 or later. More information is available in [APM Agent configuration](docs-content://solutions/observability/apm/apm-agent-central-configuration.md).
::::



### `ignoreTransactions` [ignore-transactions]

* **Type:** Array
* **Default:** `[]`

An array containing a list of transaction names that should be ignored when sending the payload to the APM server. It can be set to an array containing one or more Strings or RegExp objects. If an element in the array is a String, an exact match will be performed. If an element in the array is a RegExp object, its test function will be called with the name of the transation.

```js
const options = {
  ignoreTransactions: [/login*/, '/app']
}
```

::::{note}
Spans that are captured as part of the ignored transactions would also be ignored.
::::



### `monitorLongtasks` [monitor-longtasks]

* **Type:** Boolean
* **Default:** `true`

Instructs the agent to start monitoring for browser tasks that block the UI thread and might delay other user inputs by affecting the overall page responsiveness. Learn more about [long task spans](/reference/longtasks.md) and how to interpret them.


### `apmRequest` [apm-request]

* **Type:** Function
* **Default:** `null`

```js
apm.init({ apmRequest: (requestParams) => true})
```

Arguments:

* `requestParams` - This is an object that contains the APM HTTP request details:

    * `url` - The full url of the APM server
    * `method` - Method of the HTTP request
    * `headers` - Headers of the HTTP request
    * `payload` - Body of the HTTP request
    * `xhr` - The `XMLHttpRequest` instance used by the agent to send the request


`apmRequest` can be used to change or reject requests that are made to the APM Server. This config can be set to a function, which is called whenever the agent needs to make a request to the APM Server.

The callback function is called with a single argument and is expected to return an output synchronously. If the return value is `true` then the agent continues with making the (potentially modified) request to the APM Server.

If this function returns a falsy value the request is discarded with a warning in the console.

The following example adds a header to the HTTP request:

```js
apm.init({
  apmRequest({ xhr }) {
    xhr.setRequestHeader('custom', 'header')
    return true
  }
})
```

This example instructs the agent to discard the request, since it’s handled by the user:

```js
apm.init({
  apmRequest({ url, method, headers, payload }) {
    // Handle the APM request here or at some later point.
    fetch(url, {
      method,
      headers,
      body: payload
    });
    return false
  }
})
```


### `sendCredentials` [send-credentials]

* **Type:** Boolean
* **Default:** `false`

This allows the agent to send cookies when making requests to the APM server. This is useful on scenarios where the APM server is behind a reverse proxy that requires requests to be authenticated.

::::{note}
If APM Server is deployed in an origin different than the page’s origin, you will need to [configure Cross-Origin Resource Sharing (CORS)](/reference/configuring-cors.md).
::::


