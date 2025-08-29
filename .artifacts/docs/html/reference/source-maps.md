---
title: Source maps
description: Minifying JavaScript bundles is a common practice in production as it can improve the load time and network latency of your application. However, minified...
url: https://docs-v3-preview.elastic.dev/reference/source-maps
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# Source maps

Minifying JavaScript bundles is a common practice in production as it can improve the load time and network latency of your application. However, minified code by itself can be hard to debug. For this reason, Elastic APM supports source maps. A source map is a file that maps minified files back to the original source code, allowing you to maintain the speed advantage of minified code, without losing the ability to quickly and easily debug your applications.
There are three steps required to enable, upload, and apply a source map to error stack traces. An overview is listed below, and a complete walk-through is available in the [generate and upload a source map](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/create-upload-source-maps-rum) guide.
1. Set the [`serviceVersion`](/reference/configuration#service-version) when initializing the RUM Agent.
2. [Generate a source map](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/create-upload-source-maps-rum#apm-source-map-rum-generate) for your application with the `serviceVersion` from step one.
3. [Enable and upload the source map file](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/create-upload-source-maps-rum#apm-source-map-rum-upload) to APM Server.


You can also configure a [secret token](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/secret-token) or [API key](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/api-keys) to restrict the uploading of sourcemaps.
<tip>
  Don’t forget, you must enable [RUM support](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/configure-real-user-monitoring-rum) in the APM Server for this endpoint to work.
</tip>
