---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/longtasks.html
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

# How to interpret long task spans in the UI [longtasks]

Long tasks is a new performance metric that can be used for measuring the responsiveness of an application and helps developers to understand the bad user experience. It enables detecting tasks that monopolize the UI thread for extended periods (greater than 50 milliseconds) and block other critical tasks from being executed as stated in the [official spec](https://github.com/w3c/longtasks).

RUM agent automatically captures these Long tasks and include them as spans as part of the transaction. Since long tasks currently does not have the full information on which part of code cause slowness, it would be hard to interpret these spans. Below you can find some tips to help with interpreting long task spans:

* The name of the long task span, e.g.: `self`, `same-origin`, etc., implies the origin of the task. It could be the current browsing context or inside iframes.
* Context of the span is enriched with useful information like `attribution` (the type of work, such as script, layout, etc), `type`, `id` and `name`, which determines the culprit container (such as window, iframe, embed or object) responsible for the long task.

With the help of the transaction timeline and span timings, one could dig deeper by marking slow application code with the [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance/mark). When these spans are then captured by the agent again, you could combine them with long tasks to reveal the true source code location.

