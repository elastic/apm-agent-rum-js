---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/sourcemap.html
---

# Source maps [sourcemap]

Minifying JavaScript bundles is a common practice in production as it can improve the load time and network latency of your application. However, minified code by itself can be hard to debug. For this reason, Elastic APM supports source maps. A source map is a file that maps minified files back to the original source code, allowing you to maintain the speed advantage of minified code, without losing the ability to quickly and easily debug your applications.

There are three steps required to enable, upload, and apply a source map to error stack traces. An overview is listed below, and a complete walk-through is available in the [generate and upload a source map](docs-content://solutions/observability/apm/create-upload-source-maps-rum.md) guide.

1. Set the [`serviceVersion`](/reference/configuration.md#service-version) when initializing the RUM Agent.
2. [Generate a source map](docs-content://solutions/observability/apm/create-upload-source-maps-rum.md#apm-source-map-rum-generate) for your application with the `serviceVersion` from step one.
3. [Enable and upload the source map file](docs-content://solutions/observability/apm/create-upload-source-maps-rum.md#apm-source-map-rum-upload) to APM Server.

$$$secret-token$$$
You can also configure a [secret token](docs-content://solutions/observability/apm/secret-token.md) or [API key](docs-content://solutions/observability/apm/api-keys.md) to restrict the uploading of sourcemaps.

::::{tip}
Don’t forget, you must enable [RUM support](docs-content://solutions/observability/apm/configure-real-user-monitoring-rum.md) in the APM Server for this endpoint to work.
::::


