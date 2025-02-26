---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/opentracing.html
---

# OpenTracing [opentracing]

Elastic APM RUM agent provides an implementation for the [OpenTracing API](https://opentracing.io/). The `ElasticApmTracer` translates OpenTracing API calls to Elastic APM, which allows the reuse of existing instrumentation.

The first span of a service will be converted to an Elastic APM `Transaction`, and subsequent spans are mapped to Elastic APM `Span`.


## Getting started [opentracing-getting-started]

In order to use OpenTracing API with Elastic APM, you need to first create a Tracer:

```js
const { init: initApm, createTracer } = require('@elastic/apm-rum/dist/bundles/elastic-apm-opentracing.umd.js')
const elasticApm = initApm({
    // ...
})
const elasticTracer = createTracer(elasticApm)
```

At this point you can either use `elasticTracer` directly, or register it as a global tracer:

```js
const opentracing = require('opentracing-javascript')
opentracing.initGlobalTracer(elasticTracer);

// ...

const tracer = opentracing.globalTracer();
```

Please refer to [opentracing-javascript](https://github.com/opentracing/opentracing-javascript/) documentation for more detail on OpenTracing API.

::::{note}
If you are loading the RUM agent using a script tag, please make sure to use our OpenTracing bundle (`@elastic/apm-rum/dist/bundles/elastic-apm-opentracing.umd.js`) in your scripts instead, then you can create a tracer using `window.elasticApm.createTracer()`.
::::



## Elastic APM specific tags [opentracing-apm-tags]

Elastic APM defines some tags which are not included in the OpenTracing specification, but are relevant in the context of Elastic APM.

* `type` - sets the type of the transaction or span, e.g. "page-load", or "ext.http". If `type` is not specified, `custom` would be set instead.

The following tags are relevant only to the root spans, which are translated to Elastic APM transactions. These tags appear in the "User" tab on the transaction details page in the Elastic APM app.

* `user.id` - sets the user id
* `user.email` - sets the user email
* `user.username` - sets the user name


## Caveats [opentracing-caveats]

Some of the OpenTracing features are not fully supported by Elastic APM RUM agent.


### Context propagation [opentracing-propagation]

Currently, the only carrier formats supported are `FORMAT_HTTP_HEADERS` and `FORMAT_TEXT_MAP`. `FORMAT_BINARY` is not supported.


### Span References [opentracing-references]

Currently, the Elastic APM Tracer supports `REFERENCE_CHILD_OF` references. However, only the first `REFERENCE_CHILD_OF` reference is recorded and the rest are ignored. Other references, e.g. `follows_from`, are currently not supported.


### Baggage [opentracing-baggage]

The `Span.setBaggageItem` method is not supported. Baggage items are silently dropped.


### Logs [opentracing-logs]

Only Error logging is supported. Logging an Error on the OpenTracing span will create an Elastic APM Error.

