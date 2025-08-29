---
title: Span API
description: A span measures the duration of a single event. When a span is created it will measure the time until span.end() is called. To get a Span object, you...
url: https://docs-v3-preview.elastic.dev/reference/span-api
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# Span API

A span measures the duration of a single event. When a span is created it will measure the time until [`span.end()`](#span-end) is called.
To get a `Span` object, you need to call [`apm.startSpan()`](/reference/agent-api#apm-start-span).

## `span.name`

- **Type:** String
- **Default:** `Unknown`

The name of the span. This can also be set via [`apm.startSpan()`](/reference/agent-api#apm-start-span).

## `span.type`

- **Type:** String
- **Default:** `custom`

The type of span. This can also be set via [`apm.startSpan()`](/reference/agent-api#apm-start-span).
The type is a hierarchical string used to group similar spans together. For instance, all outgoing AJAX requests are given the type `external.http`.
In the above example, `external` is considered the type prefix. Though there are no naming restrictions for this prefix, the following are standardized across all Elastic APM agents: `app`, `db`, `cache`, `template`, and `external`.

## `span.addLabels()`

```js
span.addLabels({ [name]: value })
```

Add several labels on the span. If an error happens during the span, it will also get tagged with the same labels.
Arguments:
- `name` - Any string. All periods (.), asterisks (*), and double quotation marks (") will be replaced by underscores (_), as those characters have special meaning in Elasticsearch
- `value` - Any string, boolean, or number. All other data types will be converted to a string before being sent to the APM Server.


## `span.end()`

```js
span.end()
```

Ends the span. If the span has already ended, nothing happens.