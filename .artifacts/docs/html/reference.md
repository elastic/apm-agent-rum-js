---
title: APM RUM JavaScript agent
description: The Elastic APM Real User Monitoring (RUM) JavaScript Agent provides detailed performance metrics and error tracking of your web applications. It has...
url: https://docs-v3-preview.elastic.dev/reference/
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# APM RUM JavaScript agent

The Elastic APM Real User Monitoring (RUM) JavaScript Agent provides detailed performance metrics and error tracking of your web applications. It has built-in support for popular platforms and frameworks, and an API for custom instrumentation.
The Agent also supports [distributed tracing](https://docs-v3-preview.elastic.dev/reference/distributed-tracing) for all outgoing requests. This enables you to analyze performance throughout your microservice architecture — all in one view.
<note>
  The Elastic APM RUM JavaScript Agent is *not* compatible with [Elastic Cloud Serverless](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/deploy-manage/deploy/elastic-cloud/serverless) — it cannot send data to the APM endpoint for serverless projects.
</note>


## Features

The agent uses browser timing APIs such as [Navigation Timing](https://w3c.github.io/navigation-timing/) [Resource Timing](https://w3c.github.io/resource-timing/), [Paint Timing](https://w3c.github.io/paint-timing/), [User Timing](https://w3c.github.io/user-timing/), etc., and captures the following information:
- [Page load metrics](/reference/supported-technologies#page-load-metrics)
- Load time of Static Assets (JS, CSS, images, fonts, etc.)
- API requests (XMLHttpRequest and Fetch)
- Single page application navigations
- [User interactions](/reference/supported-technologies#user-interactions) (click events that trigger network activity)
- [User-centric metrics](/reference/supported-technologies#user-centric-metrics) (Long tasks, FCP, LCP, INP, FID, etc.)
- Page information (URLs visited and referrer)
- Network connection information
- JavaScript errors
- [Distributed tracing](https://docs-v3-preview.elastic.dev/reference/distributed-tracing)
- [Breakdown metrics](https://docs-v3-preview.elastic.dev/reference/breakdown-metrics)


## Additional Components

APM Agents work in conjunction with the [APM Server](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/reference/apm/observability/apm), [Elasticsearch](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/get-started), and [Kibana](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/get-started/the-stack). The [APM Guide](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/reference/apm/observability/apm) provides details on how these components work together, and provides a matrix outlining [Agent and Server compatibility](https://docs-v3-preview.elastic.dev/elastic/docs-content/tree/main/solutions/observability/apm/apm-agent-compatibility).