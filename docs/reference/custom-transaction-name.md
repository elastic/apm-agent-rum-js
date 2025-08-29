---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/custom-transaction-name.html
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

# Custom page load transaction names [custom-transaction-name]

A common pattern to name the transactions would be to use the current URL (`window.location.href`). However, it creates too many unique transactions (blog titles, query strings, etc.) and would be less useful when visualizing the traces in Kibana APM UI.

To overcome this problem, the agent groups the page load transactions based on the current URL. Let’s look at the below example

```text
// Blog Posts - '/blog/:id'
https://www.elastic.co/blog/reflections-on-three-years-in-the-elastic-public-sector
https://www.elastic.co/blog/say-heya-to-the-elastic-search-awards
https://www.elastic.co/blog/and-the-winner-of-the-elasticon-2018-training-subscription-drawing-is

// Documentation - '/guide/en/*'
https://www.elastic.co/guide/en/elastic-stack/current/index.html
https://www.elastic.co/guide/en/apm/get-started/current/index.html
https://www.elastic.co/guide/en/infrastructure/guide/current/index.html
```

The page load transaction names for the above URL’s would be inferred automatically and categorized as `/blog/:id` and `/guide/en/*` by the agent. The grouping logic in the agent works by recursively traversing the URL path tree until the depth of 2 and converting them to wildcard or slugged matches based on the number of digits, special characters, the mix of upper and lowercase characters in the path. The algorithm uses heuristics that are derived from common patterns in URL’s and therefore, it might not correctly identify matches in some cases.

If the inferred transaction names are not helpful, please set [`pageLoadTransactionName`](/reference/configuration.md#page-load-transaction-name) configuration to something meaningful that groups transactions under the same categories (blog, guide, etc.) and avoid using the full URL at all costs.

```js
import {apm} from '@elastic/apm-rum'

apm.init({
    serviceName: "service-name",
    pageLoadTransactionName: '/homepage'
})
```

