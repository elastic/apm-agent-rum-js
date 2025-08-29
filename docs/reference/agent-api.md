---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/agent-api.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
products:
  - id: cloud-serverless
  - id: observability
  - id: apm
---

# Agent API [agent-api]

You can access agent API after initializing the agent:

```js
var apm = require('@elastic/apm-rum').init(...)
```


## `apm.init([config])` [apm-init]

Initializes the agent with the given [configuration](/reference/configuration.md) and returns itself. Under the hood init does the following

* Registers a global `error` listener to track JavaScript errors on the page.
* Adds a `onload` event listener to collect the page load metrics.

::::{note}
When the agent is inactive, both `error` and `onload` listeners will not be registered on the page
::::


::::{note}
Both XHR and Fetch API are patched as soon as the agent script is executed on the page and does not get changed even if the agent is inactive. The reason is to allow users to initialize the agent asynchronously on the page.
::::



## `apm.setUserContext()` [apm-set-user-context]

```js
apm.setUserContext(context)
```

Call this method to enrich collected performance data and errors with information about the user.

The given `context` argument must be an object and can contain the following properties (all optional):

* `id` - The users ID
* `username` - The users username
* `email` - The users e-mail

The provided user context is stored under `context.user` in Elasticsearch on both errors and transactions.

It’s possible to call this function multiple times within the scope of the same active transaction. For each call, the properties of the context argument are shallow merged with the context previously given.


## `apm.setCustomContext()` [apm-set-custom-context]

```js
apm.setCustomContext(context)
```

Call this to enrich collected errors and transactions with any information that you think will help you debug performance issues or errors.

The provided custom context is stored under `context.custom` in Elasticsearch on both errors and transactions.

It’s possible to call this function multiple times within the scope of the same active transaction. For each call, the properties of the context argument are shallow merged with the context previously given.

The given `context` argument must be an object and can contain any property that can be JSON encoded.

::::{tip}
Before using custom context, ensure you understand the different types of [metadata](docs-content://solutions/observability/apm/elastic-apm-events-intake-api.md#apm-api-metadata-overview) that are available.
::::



## `apm.addLabels()` [apm-add-labels]

```js
apm.addLabels({ [name]: value })
```

Set labels on transactions and errors. Starting with APM Server 7.6+, the labels are added to spans as well.

Labels are key/value pairs that are indexed by Elasticsearch and therefore searchable (as opposed to data set via [`apm.setCustomContext()`](#apm-set-custom-context)). You can set multiple labels.

::::{tip}
Before using custom labels, ensure you understand the different types of [metadata](docs-content://solutions/observability/apm/elastic-apm-events-intake-api.md#apm-api-metadata-overview) that are available.
::::


Arguments:

* `name` - Any string. All periods (.), asterisks (*), and double quotation marks (") will be replaced by underscores (_), as those characters have special meaning in Elasticsearch
* `value` - Any string, boolean, or number. All other data types will be converted to a string before being sent to the APM Server.

::::{warning}
Avoid defining too many user-specified labels. Defining too many unique fields in an index is a condition that can lead to a [mapping explosion](docs-content://manage-data/data-store/mapping.md#mapping-limit-settings).
::::



## `apm.addFilter()` [apm-add-filter]

A filter can be used to modify the APM payload before it is sent to the apm-server. This can be useful in for example redacting sensitive information from the payload:

```js
apm.addFilter(function (payload) {
  if (payload.errors) {
    payload.errors.forEach(function (error) {
      error.exception.message = error.exception.message.replace('secret', '[REDACTED]')
    })
  }
  if (payload.transactions) {
    payload.transactions.forEach(function (tr) {
      tr.spans.forEach(function (span) {
        if (span.context && span.context.http && span.context.http.url) {
          var url = new URL(span.context.http.url)
          if (url.searchParams.get('token')) {
            url.searchParams.set('token', 'REDACTED')
          }
          span.context.http.url = url.toString()
        }
      })
    })
  }
  // Make sure to return the payload
  return payload
})
```

::::{note}
The payload will be dropped if one of the filters return a falsy value.
::::



## `apm.startTransaction()` [apm-start-transaction]

```js
const transaction = apm.startTransaction(name, type, options)
```

Starts and returns a new transaction.

Arguments:

* `name` - The name of the transaction (string). Defaults to `Unknown`
* `type` - The type of the transaction (string). Defaults to `custom`
* `options` - Options to modify the created transaction (object). This argument is optional. The following options are supported:

    * `managed` - Controls whether the transaction is managed by the agent or not. Defaults to `false`.


Use this method to create a custom transaction.

By default, custom transactions are not managed by the agent, however, you can start a managed transaction by passing `{ managed: true }` as the `options` argument.

There are some differences between managed and unmanaged transactions:

* For managed transactions, the agent keeps track of the relevant tasks during the lifetime of the transaction and automatically ends it once all of the tasks are finished. Unmanaged transactions need to be ended manually by calling the [`end`](/reference/transaction-api.md#transaction-end) method.
* Managed transactions include information captured via our auto-instrumentations (e.g. XHR spans). See [Supported Technologies](/reference/supported-technologies.md) for a list of instrumentations.
* There can only be one managed transaction at any given time — starting a second managed transaction will end the previous one. There are no limits for unmanaged transactions.

::::{note}
This method returns `undefined` if apm is disabled or if [active](/reference/configuration.md#active) flag is set to `false` in the config.
::::



## `apm.startSpan()` [apm-start-span]

```js
const span = apm.startSpan(name, type, options)
```

Starts and returns a new span associated with the current active transaction.

Arguments:

* `name` - The name of the span (string). Defaults to `Unknown`
* `type` - The type of the span (string). Defaults to `custom`
* `options` - The following options are supported:

    * `blocking` - Blocks the associated transaction from ending until this span is ended. Blocked spans automatically create an internal task. Defaults to false.
    * `parentId` - Parent id associated with the new span. Defaults to current transaction id
    * `sync` - Denotes if the span is synchronous or asynchronous. Defaults to null


Blocked spans allow users to control the early closing of [managed transactions](/reference/custom-transactions.md#custom-managed-transactions) in few cases when the app contains lots of async activity which cannot be tracked by the agent.

::::{note}
This method returns `undefined` if apm is disabled or if [active](/reference/configuration.md#active) flag is set to `false` in the config.
::::



## `apm.setInitialPageLoadName()` [set-initial-page-load-name]

```js
apm.setInitialPageLoadName(name)
```

Arguments:

* `name` - The name of the page-load transaction (string).

Use this method to set the name of the `page-load` transaction that is sent automatically on page load event. See the [custom initial page load transaction names](/reference/custom-transaction-name.md) documentation for more details.


## `apm.getCurrentTransaction()` [get-current-transaction]

```js
apm.getCurrentTransaction()
```

Use this method to get the current active transaction. If there is no active transaction it will return `undefined`.


## `apm.captureError()` [capture-error]

```js
apm.captureError(error, options)
```

Arguments:

* `error` - An instance of `Error`.
* `options` - The following options are supported:

  * `labels` - Add additional context with labels, these labels will be added to the error along with the labels from the current transaction.

Use this method to manually send an error to APM Server:

```js
apm.captureError(new Error('<error-message>'))
```


## `apm.observe()` [observe]

```js
apm.observe(name, callback)
```

Arguments:

* `name` - The name of the event.
* `callback` - A callback function to execute once the event is fired.

Use this method to listen for RUM agent internal events.

The following events are supported for the transaction lifecycle:

* `transaction:start` event is fired on every transaction start.
* `transaction:end` event is fired on transaction end and before it is added to the queue to be sent to APM Server.

The callback function for these events receives the corresponding transaction object as its only argument. The transaction object can be modified through methods and properties documented in [Transaction API](/reference/transaction-api.md):

```js
apm.observe('transaction:start', function (transaction) {
  if (transaction.type === 'custom') {
    transaction.name = window.document.title
    transaction.addLabels({ 'custom-label': 'custom-value' })
  }
})
```

