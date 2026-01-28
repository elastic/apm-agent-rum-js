---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/custom-transactions.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
---

# Custom Transactions [custom-transactions]

Elastic APM uses the concept of transactions and spans to collect performance data: Spans measure a unit of operation and are grouped into transactions.

By default, the Elastic APM JS agent creates transactions for all [supported technologies](/reference/supported-technologies.md) and sends them to the apm-server. However, if the current instrumentation doesn’t provide all the insights, you can create custom transactions to fill the gaps.

Here is an example of using custom transactions and spans:

```js
const transaction = apm.startTransaction('Application start', 'custom')
const url = 'http://example.com/data.json'
const httpSpan = transaction.startSpan('GET ' + url, 'external.http')
fetch(url)
  .then((resp) => {
    if (!resp.ok) {
      apm.captureError(new Error(`fetch failed with status ${resp.status} ${resp.statusText}`))
    }
    httpSpan.end()
    transaction.end()
  })
```

::::{note}
Custom transactions are not managed by the agent, and therefore the agent does not capture spans and other timing information shown in [automatic instrumentation](/reference/supported-technologies.md), like XHR, resource timing, etc.
::::



## Creating a Managed transaction [custom-managed-transactions]

If the user is interested in associating all the other timing information and spans in the custom transactions based on the [supported technologies](/reference/supported-technologies.md), they can pass the `managed` flag to `true` while creating the transaction and will be controlled by the agent. However, the transaction might get closed automatically once all the associated spans are completed. If the user wants to control this behavior, they can create a blocking span that will hold the transaction until `span.end` is called.

```js
const transaction = apm.startTransaction('custom managed', 'custom', { managed: true })
const span = transaction.startSpan('async-task', 'app', { blocking: true })

setTimeout(() => {
  span.end()
  /**
   * This would also end the managed transaction once all the blocking spans are completed and
   * transaction would also contain other timing information and spans similar to auto
   * instrumented transactions like `page-load` and `route-change`.
   */
}, 1000)
```

::::{note}
Both custom and managed transactions are queued and sent together automatically at configured intervals after `transaction.end` is called.
::::


