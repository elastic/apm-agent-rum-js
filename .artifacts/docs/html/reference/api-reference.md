---
title: API reference
description: The API reference documentation is divided into three parts: The Agent API - All functions and properties on the Agent object. An instance of the Agent...
url: https://docs-v3-preview.elastic.dev/reference/api-reference
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# API reference

The API reference documentation is divided into three parts:
- [The `Agent` API](https://docs-v3-preview.elastic.dev/reference/agent-api) - All functions and properties on the `Agent` object. An instance of the `Agent` object is acquired by calling the `init method` the agent either via script element on the page or require the `elastic-apm-rum` module in Node.js. The `Agent` instance is usually referred to by the variable `apm` in this documentation.
- [The `Transaction` API](https://docs-v3-preview.elastic.dev/reference/transaction-api) - All functions and properties on the `Transaction` object. An instance of the `Transaction` object is acquired by calling `apm.startTransaction()`.
- [The `Span` API](https://docs-v3-preview.elastic.dev/reference/span-api) - All functions and properties on the `Span` object. An instance of the `Span` object is acquired by calling `apm.startSpan()`.
