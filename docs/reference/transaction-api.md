---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/transaction-api.html
---

# Transaction API [transaction-api]

A transaction groups multiple spans in a logical group.

To start a transaction, you need to call [`apm.startTransaction()`](/reference/agent-api.md#apm-start-transaction).

To see an example of using custom transactions, see the [Custom Transactions](/reference/custom-transactions.md) article.


## `transaction.name` [transaction-name]

* **Type:** String
* **Default:** `Unknown`

The name of the transaction.

Can be used to set or overwrite the name of the transaction (visible in the performance monitoring breakdown).


## `transaction.type` [transaction-type]

* **Type:** String
* **Default:** `custom`

The type of the transaction.


## `transaction.timestamp` [transaction-timestamp]

* **Type:** String
* **Default:** `undefined`

The timestamp of the transaction. If the transaction timestamp is not provided (the default behaviour), it will be set by the apm-server (v6.3+). You can, however, set the timestamp on the client (using `new Date().toISOString()`), but you should be aware that the timestamp will reflect the client’s local time which might not always be accurate.


## `transaction.startSpan([name][, type][, options])` [transaction-start-span]

```js
const span = transaction.startSpan('My custom span')
```

Start and return a new custom span associated with this transaction.

Arguments:

* `name` - The name of the span (string). Defaults to `unnamed`
* `type` - The type of span (string). Defaults to `custom`
* `options` - The following options are supported:

    * `blocking` - Blocks the associated transaction from ending until this span is ended. Blocked spans automatically create an internal task. Defaults to false.
    * `parentId` - Parent id associated with the new span. Defaults to current transaction id
    * `sync` - Denotes if the span is synchronous or asynchronous.


When a span is started it will measure the time until [`span.end()`](/reference/span-api.md#span-end) is called. Blocked spans allow users to control the early closing of [managed transactions](/reference/custom-transactions.md#custom-managed-transactions) in some cases.

See also the [Span API](/reference/span-api.md) docs for details on how to use custom spans.


## `transaction.block(flag)` [transaction-block]

```js
transaction.block(true)
```

Blocks the currently running auto-instrumented or custom transactions from getting automatically closed once the associated spans are ended.

Arguments:

* `flag` - Boolean. Defaults to false.

Most of the time, users shouldn’t need to block the running transaction as the agent tries to account for all of the async network activity and capture the required information. The block API is useful when you think auto instrumented code misses important activity and prematurely ends a transaction. An example of this might be a page that contains lots of asynchronous tasks that cannot be automatically instrumented, like web workers.

```js
// get the current active autoinstrumented transaction (page-load, route-change, etc.)
const activeTransaction = apm.getCurrentTransaction()

if (activeTransaction) {
  activeTransaction.block(true)
}

// Perform some more async tasks and unblock it
activeTransaction.block(false)
```

One can also achieve a similar action by creating blocked spans. Check the [managed transactions](/reference/custom-transactions.md#custom-managed-transactions) guide to learn more.


## `transaction.addLabels()` [transaction-add-labels]

```js
transaction.addLabels({ [name]: value })
```

Add several labels on the transaction. If an error happens during the transaction, it will also get tagged with the same labels.

Labels are key/value pairs that are indexed by Elasticsearch and therefore searchable (as opposed to data set via [`apm.setCustomContext()`](/reference/agent-api.md#apm-set-custom-context)).

::::{tip}
Before using custom labels, ensure you understand the different types of [metadata](docs-content://solutions/observability/apm/elastic-apm-events-intake-api.md#apm-api-metadata-overview) that are available.
::::


Arguments:

* `name` - Any string. All periods (.), asterisks (*), and double quotation marks (") will be replaced by underscores (_), as those characters have special meaning in Elasticsearch
* `value` - Any string, boolean, or number. All other data types will be converted to a string before being sent to the APM Server.

::::{warning}
Avoid defining too many user-specified tags. Defining too many unique fields in an index is a condition that can lead to a [mapping explosion](docs-content://manage-data/data-store/mapping.md#mapping-limit-settings).
::::



## `transaction.end()` [transaction-end]

```js
transaction.end()
```

Ends the transaction. Calling `transaction.end` on an active transaction ends all of the underlying spans and marks them as `truncated`. If the transaction has already ended, nothing happens.


## `transaction.mark(key)` [transaction-mark]

```js
transaction.mark(key)
```

Marks the current point in time relative to the start of the transaction. Use this method to mark significant events that happen while the transaction is active.

Arguments:

* `key` -  Any string. All periods (.), asterisks (*), and double quotation marks (") will be replaced by underscores (_), as those characters have special meaning in Elasticsearch

