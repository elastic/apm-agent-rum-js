---
title: Configure CORS
description: If APM Server is deployed in an origin different than the page’s origin, you will need to configure Cross-Origin Resource Sharing (CORS). A list of permitted...
url: https://docs-v3-preview.elastic.dev/reference/configuring-cors
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# Configure CORS

If APM Server is deployed in an origin different than the page’s origin, you will need to configure Cross-Origin Resource Sharing (CORS).
A list of permitted origins can be supplied to the [`apm-server.rum.allow_origins`](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/configure-real-user-monitoring-rum#apm-rum-allow-origins) configuration option. By default, APM Server allows all origins.

## How CORS works

When the RUM agent makes its initial `POST` request, the browser will check to see if it is a cross-origin request. If it is, the browser automatically makes a preflight `OPTIONS` request to the server to ensure the original `POST` request is allowed. If this `OPTIONS` check passes, then the original `POST` request is allowed. This request will fail if RUM support is not configured in the APM Server.
If you use a proxy, the preflight request headers may be necessary for your configuration:
```js
Access-Control-Request-Headers: Content-Type
Access-Control-Request-Method: POST
Origin: [request-origin]
```

The response should include these headers:
```js
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Origin: [request-origin]
```

If you enable the [`sendCredentials`](/reference/configuration#send-credentials) configuration option, your proxy’s response must include the header `Access-Control-Allow-Origin` with the page’s origin as a value, and the following header:
```js
Access-Control-Allow-Credentials: true
```

<tip>
  To learn more about CORS, see the MDN page on [Cross-Origin Resource Sharing](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).
</tip>
