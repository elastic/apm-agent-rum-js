---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/span-api.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
products:

  - id: observability
  - id: apm
---

# Span API [span-api]

A span measures the duration of a single event. When a span is created it will measure the time until [`span.end()`](#span-end) is called.

To get a `Span` object, you need to call [`apm.startSpan()`](/reference/agent-api.md#apm-start-span).


## `span.name` [span-name]

* **Type:** String
* **Default:** `Unknown`

The name of the span. This can also be set via [`apm.startSpan()`](/reference/agent-api.md#apm-start-span).


## `span.type` [span-type]

* **Type:** String
* **Default:** `custom`

The type of span. This can also be set via [`apm.startSpan()`](/reference/agent-api.md#apm-start-span).

The type is a hierarchical string used to group similar spans together. For instance, all outgoing AJAX requests are given the type `external.http`.

In the above example, `external` is considered the type prefix. Though there are no naming restrictions for this prefix, the following are standardized across all Elastic APM agents: `app`, `db`, `cache`, `template`, and `external`.


## `span.addLabels()` [span-add-labels]

```js
span.addLabels({ [name]: value })
```

Add several labels on the span. If an error happens during the span, it will also get tagged with the same labels.

Arguments:

* `name` - Any string. All periods (.), asterisks (*), and double quotation marks (") will be replaced by underscores (_), as those characters have special meaning in Elasticsearch
* `value` - Any string, boolean, or number. All other data types will be converted to a string before being sent to the APM Server.


## `span.end()` [span-end]

```js
span.end()
```

Ends the span. If the span has already ended, nothing happens.

