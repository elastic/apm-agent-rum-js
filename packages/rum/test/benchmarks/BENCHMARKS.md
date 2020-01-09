## Benchmarks

RUM agent benchmarks are run using [Puppeteer](https://github.com/puppeteer/puppeteer) and use the Chrome devtools protocol API for tracing CPU and memory metrics.

The benchmarks are run in two scenarios

#### Basic 
In the basic version of the benchmark test, The RUM agent is loaded on a blank page(no static resources/inline scripts) and the page load transaction is captured to understand
the impact of the RUM agent.

#### Heavy

In the heavy version, The page contains 30 static resources (Images) which would be captured by the RUM agent as Spans in the Page load transaction.

For the above two scenarios, the following interesting metrics are calculated to understand the performance impact of the RUM agent.


+ **Initialization Time** - Time to initialize the agent with the user-specified/default configurations. Includes the time to validate the provided options, event listeners for capturing error & load
events, internal events used for capturing XHR, Fetch calls, etc.

+ **Parse & Execution Time** - Once the agent is downloaded by the browser, the time spent on parsing and executing the agent script by the browser. Execution time includes our global
patch time(Fetch, XHR) and also creating a global APM object.

+ **Total CPU Time** - Overall CPU time from the time browser session started till the Agent payload is sent to the APM server and the session is killed.

+ **Agent CPU Time** - Duration of time that includes the work done by the agent on the current session. Work includes instrumentation of the API calls, Processing of the Navigation and Resource timing
information as Spans, etc. 

+ **Payload Size** - Payload size of the instrumented data collected and sent to the APM server. Addition/Deletion/Compression of fields will directly impact the size of the payload.

+ **Memory Profile** - To analyze the memory leaks in the agent, we use the Chrome Allocation Profiler to measure the memory allocation of top functions that contributes to the memory increase. 


### Running the Benchmark

The below script will start a new webpack build of the RUM agent, starts the server and collects the above metrics for two scenarios.

```js
node packages/rum/test/benchmarks/run.js
```

#### Results

Benchmark results are stored under `packages/rum/reports/rum-benchmarks.json` and look like this

```
[
 {
 "scenario": "basic",
 "parameters.browser": "HeadlessChrome/78.0.3882.0",
 "parameters.url": "http://localhost:9000/basic",
 "parameters.runs": 3,
 "parameters.images": 0,
 "bundle-size.minified.bytes": 55169,
 "bundle-size.gzip.bytes": 17199,
 "page-load-time.mean.ms": 20.75333334505558,
 "page-load-time.p90.ms": 28.404999990016222,
 "rum-init-time.mean.ms": 2.813333373827239,
 "rum-init-time.p90.ms": 2.895000041462481,
 "parse-and-execute-time.mean.ms": 3.1899999982366958,
 "parse-and-execute-time.p90.ms": 3.23000003118068,
 "total-cpu-time.mean.ms": 20588.198666666674,
 "total-cpu-time.p90.ms": 21595.977000000006,
 "rum-cpu-time.mean.ms": 10465.609999999999,
 "rum-cpu-time.p90.ms": 10797.99,
 "payload-size.mean.bytes": 1510.6666666666667,
 "payload-size.p90.bytes": 1692,
 "transactions.mean.count": 1,
 "transactions.p90.count": 1,
 "spans.mean.count": 2.3333333333333335,
 "spans.p90.count": 3,
 "memory.ErrorStackParser.bytes": 67064,
 "memory.captureNavigation.bytes": 33640,
 "memory.getCurrentScript.bytes": 164656,
 "memory.getResponseContext.bytes": 32928,
 "memory.createNavigationTimingSpans.bytes": 32832,
 "memory.isCORSSupported.bytes": 38376,
 "memory.r.bytes": 32960,
 "memory.truncate.bytes": 32824,
 "memory.create.bytes": 32816,
 "memory.addContext.bytes": 32800,
 "memory.onEnd.bytes": 32832,
 "memory.init.bytes": 32832,
 "memory.useMutationObserver.bytes": 32816,
 "memory.getPageMetadata.bytes": 32784
 },
 {
 "scenario": "heavy",
 "parameters.browser": "HeadlessChrome/78.0.3882.0",
 "parameters.url": "http://localhost:9000/heavy",
 "parameters.runs": 3,
 "parameters.images": 30,
 "bundle-size.minified.bytes": 55169,
 "bundle-size.gzip.bytes": 17199,
 "page-load-time.mean.ms": 65.84833337304492,
 "page-load-time.p90.ms": 69.62000008206815,
 "rum-init-time.mean.ms": 2.938333316706121,
 "rum-init-time.p90.ms": 2.969999914057553,
 "parse-and-execute-time.mean.ms": 3.1949999586989484,
 "parse-and-execute-time.p90.ms": 3.275000024586916,
 "total-cpu-time.mean.ms": 70830.87366666664,
 "total-cpu-time.p90.ms": 71789.70999999996,
 "rum-cpu-time.mean.ms": 15627.618666666667,
 "rum-cpu-time.p90.ms": 17301.821,
 "payload-size.mean.bytes": 18429.333333333332,
 "payload-size.p90.bytes": 18608,
 "transactions.mean.count": 1,
 "transactions.p90.count": 1,
 "spans.mean.count": 32.333333333333336,
 "spans.p90.count": 33,
 "memory.getCurrentScript.bytes": 65616,
 "memory.isCORSSupported.bytes": 65568,
 "memory.r.bytes": 40240,
 "memory.addSpanContext.bytes": 32800,
 "memory.useMutationObserver.bytes": 32832,
 "memory.ApmBase.bytes": 32832,
 "memory.ensureContext.bytes": 32816,
 "memory.throttle.bytes": 32816,
 "memory.startTransaction.bytes": 32800,
 "memory.createServiceFactory.bytes": 32784,
 "memory.getResponseContext.bytes": 32784,
 "memory.ErrorStackParser.bytes": 34232,
 "memory.patchFetch.bytes": 32832
 }
]

```