## Benchmarks

RUM agent benchmarks use [Puppeteer](https://github.com/puppeteer/puppeteer) and the Chrome devtools protocol API for tracing CPU and memory metrics.

The benchmarks are run in two scenarios

#### Basic 
In the basic version of the benchmark test, The RUM agent is loaded on a blank page(no static resources/inline scripts) and the page load transaction is captured to understand
the impact of the RUM agent.

#### Heavy

In the heavy version, The page contains 30 static resources (Images) which would be captured by the RUM agent as Spans in the Page load transaction.

For the above two scenarios, the following interesting metrics are calculated to understand the performance impact of the RUM agent.


+ **Parse & Execution Time** - Once the agent is downloaded by the browser, the time spent on parsing and executing the agent script by the browser. Execution time includes patching browser APIs and creating global APM object.

+ **Initialization Time** - Time to initialize the agent with the user-specified/default configurations. Includes the time time to validate the provided options, register event listeners for capturing error & load events, instantiating internal objects, etc.

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

Benchmark results are stored under `packages/rum/reports/rum-benchmarks.json`.

#### Overhead

Overhead of running the agent on two scenarios for a total of 3 runs are listed below

| Scenario | Parse & Execution Time (ms) |  Initialization Time (ms) | Total CPU Time (ms) | Agent CPU Time (ms) | Payload Size (bytes) | Span Count | 
|----------|-----------------------------|---------------------------|---------------------|---------------------|----------------------|------------|
| Basic    |            3.230            |          2.895            |       21596         |        10798        |       1692           |     3      |
| Heavy    |            3.275            |          2.969            |       71789         |        17301        |       18608          |     33     |
