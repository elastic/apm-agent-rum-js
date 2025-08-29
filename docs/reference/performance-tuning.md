---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/performance-tuning.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
products:
  - id: cloud-serverless
  - id: observability
  - id: apm
---

# Performance tuning [performance-tuning]

There are different ways to optimize/tune the performance of the RUM agent. Which options to adjust depends on whether you are optimizing for speed, memory usage, bandwidth or storage.


## Sampling [performance-sampling]

The first knob to reach for when tuning the performance of the agent is [`transactionSampleRate`](/reference/configuration.md#transaction-sample-rate). Adjusting the sampling rate controls what ratio of requests are traced. By default, the sample rate is set at `1.0`, meaning *all* requests are traced and sent to the APM server.

The sample rate will impact all four performance categories, so simply turning down the sample rate is an easy way to improve performance.

Here’s an example of setting the sample rate to 20%:

```js
import { apm } from "@elastic/apm-rum"

apm.init({
  transactionSampleRate: 0.2
})
```

The Agent will still record the overall duration and result of unsampled transactions, but will discard associated spans, context information or labels before sending to the APM server.


## Breakdown Metrics [performance-breakdown-metrics]

Breakdown metrics help visualize where your application is spending the majority of its time. The [`breakdownMetrics`](/reference/configuration.md#breakdown-metrics) config controls whether metrics should be calculated for each transaction based on its corresponding type.

Setting this to `true` will increase the payload/bandwidth usage data to the APM server.


## APM Agent Configuration [performance-central-config]

Activate agent configuration via Kibana to start fetching new configuration changes from the APM server during the agent initialization phase.

Setting the config option [`centralConfig`](/reference/configuration.md#central-config) to `true` incurs the cost of one additional HTTP request when the agent is initialized and generates more load to the APM server. As a result, central configuration is disabled by default in RUM agent.

It is recommended to disable this configuration when the instrumented application is under heavy load.

