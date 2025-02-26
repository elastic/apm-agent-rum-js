---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/intro.html
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/index.html
---

# APM RUM JavaScript agent [intro]

The Elastic APM Real User Monitoring (RUM) JavaScript Agent provides detailed performance metrics and error tracking of your web applications. It has built-in support for popular platforms and frameworks, and an API for custom instrumentation.

The Agent also supports [distributed tracing](/reference/distributed-tracing.md) for all outgoing requests. This enables you to analyze performance throughout your microservice architecture — all in one view.

::::{note}
The Elastic APM RUM JavaScript Agent is *not* compatible with [{{serverless-full}}](docs-content://deploy-manage/deploy/elastic-cloud/serverless.md) — it cannot send data to the APM endpoint for serverless projects.

::::



## Features [features]

The agent uses browser timing APIs such as [Navigation Timing](https://w3c.github.io/navigation-timing/) [Resource Timing](https://w3c.github.io/resource-timing/), [Paint Timing](https://w3c.github.io/paint-timing/), [User Timing](https://w3c.github.io/user-timing/), etc., and captures the following information:

* [Page load metrics](/reference/supported-technologies.md#page-load-metrics)
* Load time of Static Assets (JS, CSS, images, fonts, etc.)
* API requests (XMLHttpRequest and Fetch)
* Single page application navigations
* [User interactions](/reference/supported-technologies.md#user-interactions) (click events that trigger network activity)
* [User-centric metrics](/reference/supported-technologies.md#user-centric-metrics) (Long tasks, FCP, LCP, INP, FID, etc.)
* Page information (URLs visited and referrer)
* Network connection information
* JavaScript errors
* [Distributed tracing](/reference/distributed-tracing.md)
* [Breakdown metrics](/reference/breakdown-metrics.md)


## Additional Components [additional-components]

APM Agents work in conjunction with the [APM Server](docs-content://docs/reference/ingestion-tools/observability/apm.md), [Elasticsearch](docs-content://get-started/index.md), and [Kibana](docs-content://get-started/the-stack.md). The [APM Guide](docs-content://docs/reference/ingestion-tools/observability/apm.md) provides details on how these components work together, and provides a matrix outlining [Agent and Server compatibility](docs-content://solutions/observability/apps/apm-agent-compatibility.md).

