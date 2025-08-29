---
title: Distributed tracing
description: Elastic APM supports distributed tracing to enable you to analyze performance throughout your microservices architecture by tracing all requests — from...
url: https://docs-v3-preview.elastic.dev/reference/distributed-tracing
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# Distributed tracing

Elastic APM supports distributed tracing to enable you to analyze performance throughout your microservices architecture by tracing all requests — from the initial web request to your front-end service, to queries made to your back-end services — all in one view.

## Enable cross-origin requests

Distributed tracing is enabled by default in the RUM agent, however, it only includes requests made to the same origin. In order to include cross-origin requests, you must set the `distributedTracingOrigins` configuration option.
For example, consider an application that is served from: `https://example.com`. By default, all of the HTTP requests made to `https://example.com` will be included in the trace. To also include requests made to: `https://api.example.com`, you would need to add the following configuration:
```js
var apm = initApm({
  ...
  distributedTracingOrigins: ['https://api.example.com']
})
```

This effectively tells the agent to add the distributed tracing HTTP header (`traceparent`) to requests made to `https://api.example.com`.

### Propagate Tracestate

[Tracestate](https://www.w3.org/TR/trace-context/#tracestate-header) can be used to provide additional vendor specific trace information across different tracing systems and is a companion header for the `traceparent` field.
By default, the RUM agent does not propagate the `tracestate` HTTP header to the configured origins. However, the user can change that behaviour by enabling the [propagateTracestate](/reference/configuration#propagate-tracestate) flag which effectively adds `tracestate` HTTP header to the configured origins. As of today, only the sampling decision is propagated through the tracestate header. This information is then used by the APM server and the UI to calculate the service metrics like distributions and throughput (Service Maps).
<note>
  distributed tracing headers (traceparent and tracestate) are only appended to API calls. To view the full trace from a backend service, see [Dynamically-generated HTML](#dynamic-html-doc). To read more about cross-origin requests and why this process is necessary, please see the MDN page on [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
</note>


### Server configuration

The RUM agent is only one of the components in a distributed trace, so you must properly configure other components in order to use distributed tracing. In the example above, you need to make sure `https://api.example.com` can respond to requests that include the distributed tracing header. Specifically, `https://api.example.com` will receive an `OPTIONS` request with the following headers:
```text
Access-Control-Request-Headers: traceparent, tracestate
Access-Control-Request-Method: [request-method]
Origin: [request-origin]
```

And should respond to it with these headers:
```text
Access-Control-Allow-Headers: traceparent, tracestate
Access-Control-Allow-Methods: [allowed-methods]
Access-Control-Allow-Origin: [request-origin]
```

<note>
  `Access-Control-Request-Headers` might include more headers than `traceparent` and `tracestate`. The response should include all headers if the server wishes to let the browser send the original request.
</note>

<note>
  To make sure all components in a distributed trace are included, the sampling rate of backend agents might be affected by the sampling rate of the RUM agent.
</note>


## Backend Agent compatibility

Starting in version 5.0, the RUM Agent supports the official W3C tracecontext `traceparent` header, instead of the previously used `elastic-apm-traceparent` header. Use the table below to determine which versions of our backend agents also support the official W3C tracecontext headers. Compatible agents use the official tracecontext spec to propagate traces and can therefor be used with the RUM Agent version >=5.0 for distributed tracing.
<note>
  Our backend agents will support both `traceparent` and `elastic-apm-traceparent` headers until their respective major version release. Therefore, you can safely upgrade your backend agents before upgrading the RUM agent.
</note>


| Agent name                     | Agent Version |
|--------------------------------|---------------|
| **Go Agent**Go Agent           | >= `1.6`      |
| **Java Agent**Java Agent       | >= `1.14`     |
| **.NET Agent**.NET Agent       | >= `1.3`      |
| **Node.js Agent**Node.js Agent | >= `3.4`      |
| **Python Agent**Python Agent   | >= `5.4`      |
| **Ruby Agent**Ruby Agent       | >= `3.5`      |


## Dynamically-generated HTML

If your backend service generates an HTML page dynamically, you need to inject the trace ID and parent span ID into the page when you initialize the RUM Agent. This ensures that the web browser’s page load appears as the root of the trace. As an example:
```js
var apm = initApm({
    ...
    pageLoadTraceId: <trace-id>,
    pageLoadSpanId: <span-id>,
    pageLoadSampled: <is-sampled>
})
```

The `pageLoadSpanId` should be set to the parent ID of the backend transaction. Most Elastic APM backend agents provide methods to extract this information. Please refer to the relevant Agent’s API for more information:
- [.NET Agent: `EnsureParentId()`](https://docs-v3-preview.elastic.dev/elastic/apm-agent-dotnet/tree/main/reference/public-api)
- [Java Agent: `ensureParentId()`](https://docs-v3-preview.elastic.dev/elastic/apm-agent-java/tree/main/reference/public-api)
- Python Agent:  
  - [Flask integration](https://docs-v3-preview.elastic.dev/elastic/apm-agent-python/tree/main/reference/flask-support)
  - [Django integration](https://docs-v3-preview.elastic.dev/elastic/apm-agent-python/tree/main/reference/django-support)
- [Ruby Agent: `EnsureParent()`](https://docs-v3-preview.elastic.dev/elastic/apm-agent-ruby/tree/main/reference/api-reference)
- [Go Agent: `EnsureParent()`](https://docs-v3-preview.elastic.dev/elastic/apm-agent-go/tree/main/reference/api-documentation)
- [Node.js Agent distributed tracing guide](https://docs-v3-preview.elastic.dev/elastic/apm-agent-nodejs/tree/main/reference/distributed-tracing)
