---
title: Install the Agent
description: There are multiple ways to add the APM RUM Agent to your web page: Using Script Tags: Add a <script> tag to the HTML page.Using Bundlers: Bundling the...
url: https://docs-v3-preview.elastic.dev/reference/install-agent
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# Install the Agent

There are multiple ways to add the APM RUM Agent to your web page:
- [Using Script Tags](#using-script-tags): Add a `<script>` tag to the HTML page.
- [Using Bundlers](#using-bundlers): Bundling the Agent package during the application’s build process


## Using Script Tags


## Synchronous / Blocking Pattern

Add a <script> tag to load the bundle and use the `elasticApm` global object to initialize the agent:
```html
<script src="https://unpkg.com/@elastic/apm-rum/dist/bundles/elastic-apm-rum.umd.min.js" crossorigin></script>
<script>
  elasticApm.init({
    serviceName: '<instrumented-app>',
    serverUrl: '<apm-server-url>',
  })
</script>
```


## Asynchronous / Non-Blocking Pattern

Loading the script asynchronously ensures the agent script will not block other resources on the page, however, it will still block browsers `onload` event.
```html
<script>
  ;(function(d, s, c) {
    var j = d.createElement(s),
      t = d.getElementsByTagName(s)[0]

    j.src = 'https://unpkg.com/@elastic/apm-rum/dist/bundles/elastic-apm-rum.umd.min.js'
    j.onload = function() {elasticApm.init(c)}
    t.parentNode.insertBefore(j, t)
  })(document, 'script', {serviceName: '<instrumented-app>', serverUrl: '<apm-server-url>'})
</script>
```

Even though this is the recommended pattern, there is a caveat to be aware of. Because the downloading and initializing of the agent happens asynchronously, distributed tracing will not work for requests that occur before the agent is initialized.
<note>
  Please download the latest version of RUM agent from [GitHub](https://github.com/elastic/apm-agent-rum-js/releases/latest) or [UNPKG](https://unpkg.com/@elastic/apm-rum/dist/bundles/elastic-apm-rum.umd.min.js) and host the file in your Server/CDN before deploying to production. Remember to use a proper versioning scheme and set a far future `max-age` and `immutable` in the [cache-control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control) header, as the file never changes.
</note>

The debug messages are removed by default from the minified bundles. It is strongly recommended to use the unminified version for debugging purposes.

## Using Bundlers

Install the Real User Monitoring APM agent as a dependency to your application:
```bash
npm install @elastic/apm-rum --save
```

Configure the agent:
```js
import { init as initApm } from '@elastic/apm-rum'

const apm = initApm({

  // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
  serviceName: '',

  // Set custom APM Server URL (default: http://localhost:8200)
  serverUrl: 'http://localhost:8200',

  // Set service version (required for sourcemap feature)
  serviceVersion: ''
})
```


### Production Build

By default, RUM agent logs all the debug messages to the browser console. These logs are very useful in development. However, they make the RUM agent bundle size larger so you should make sure to use the optimized production version when deploying your application.
You can find instructions for building optimized code below for different bundlers.

### Webpack

For optimized webpack production build, include the Environment/Define plugin in the webpack configuration.
```js
const { EnvironmentPlugin } = require('webpack')

plugins: [
  new EnvironmentPlugin({
    NODE_ENV: 'production'
  })
]
```

You can learn more about this in [Webpack documentation](https://webpack.js.org/plugins/environment-plugin).

### Rollup

For optimized rollup production build, include the replace plugin which ensures the right build environment is used.
```js
const replace = require('rollup-plugin-replace')

plugins: [
  replace({
    'process.env.NODE_ENV': JSON.stringify('production')
  })
]
```

<note>
  Currently the optimized (minified + gzipped) agent bundle size is about 16KiB.
</note>
