---
title: Supported technologies
description: The RUM agent tries to capture the overall user experience on how the page is loaded/rendered as part of the page load Transaction. It includes all of...
url: https://docs-v3-preview.elastic.dev/reference/supported-technologies
products:
  - APM
  - APM Agent
  - Elastic Observability
---

# Supported technologies


## Page load metrics

The RUM agent tries to capture the overall user experience on how the page is loaded/rendered as part of the page load Transaction. It includes all of the dependent resources, like JavaScript, stylesheets, images, etc., which are included as part of the page. In addition to capturing the resource timing information as Spans, the transaction also includes navigation spans—marks that are associated with the rest of the captured information to make the waterfall more appealing.
<definitions>
  <definition term="Domain lookup">
    Duration of the DNS query for the current page: `domainLookupEnd` - `domainLookupStart`.
  </definition>
  <definition term="Making a connection to the server">
    Duration of the TCP connection to the server, including the TLS negotiation time for HTTPS pages: `connectEnd` - `connectStart`.
  </definition>
  <definition term="Requesting and receiving the document">
    Overall response time of the server including the last byte: `responseEnd` - `requestStart`.
  </definition>
  <definition term="Parsing the document, executing sync. scripts">
    HTML document parsing time, including synchronous Stylesheets and Script: `tagsdomInteractive` - `domLoading`.
  </definition>
  <definition term="Fire "DOMContentLoaded" event">
    Triggered when the browser completes parsing the document. Helpful when there are multiple listeners, or logic is executed: `domContentLoadedEventEnd` - `domContentLoadedEventStart`.
  </definition>
  <definition term="Fire "load" event">
    Trigged when the browser finishes loading its document and dependent resources: `loadEventEnd` - `loadEventStart`.
  </definition>
  <definition term="Time to first byte (TTFB)">
    Duration from the browser making an HTTP request for the initial document to the first byte of the page being received. TTFB is available from the Navigation Timing API as the `reponseStart` timestamp, and captured as transaction mark `transaction.marks.agent.timeToFirstByte` in the ElasticSearch document.
  </definition>
</definitions>

To capture the overall user experience of the page including all of the above information plus additional resource requests that might be triggered during the execution of dependent resources, the `page-load` transaction duration might not always reflect the [Load](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event) event of the browser and can extend beyond the event.
If you are interested in accurately measuring the duration of load event, the information can be extracted by using `Fire load event` Span or from the Transaction marks available as `transaction.marks.agent.domComplete` in the Elasticsearch document.
<note>
  The page load transaction is measured relative to the `fetchStart` timestamp from the Navigation Timing API.
</note>


## User-centric Metrics

To understand the performance characteristics of a web page beyond the page load and how the user perceives performance, the agent supports capturing these [responsiveness metrics](https://web.dev/user-centric-performance-metrics/).
<definitions>
  <definition term="First contentful paint (FCP)">
    Focusses on the initial rendering and measures the time from when the page starts loading to when any part of the page’s content is displayed on the screen. The agent uses the [Paint timing API](https://www.w3.org/TR/paint-timing/#first-contentful-paint) available in the browser to capture the timing information. FCP is captured as transaction mark for `page-load` transaction for all chromium-based browsers (Chrome >60, Edge >79, Opera >47, etc.).
  </definition>
  <definition term="Largest contentful paint (LCP)">
    A new page-load metric that denotes the time from when the page starts loading to when the critical element (largest text, image, video elements) is displayed on the screen. LCP is available in the browser through [LargestContentfulPaint API](https://wicg.github.io/largest-contentful-paint/) which relies on the draft [Element Timing API](https://wicg.github.io/element-timing/). LCP is one of the [core web vitals](https://web.dev/vitals/) metrics and available only in Chrome >77. Captured as transaction mark for `page-load` transaction, maintain LCP within the first **2.5 seconds** of page-load to provide a good user experience.
  </definition>
  <definition term="Interaction to next paint (INP)">
    INP quantifies responsiveness to user interactions. The INP value comes from measuring the latency of all click, tap, and keyboard interactions that happen throughout a single page visit and choosing the longest interaction observed. INP is one of the [core web vitals](https://web.dev/vitals/) metrics, and you can read more about INP in the [web.dev docs](https://web.dev/articles/inp). To provide a good user experience, Google recommends an INP of **fewer than 200 milliseconds**.
  </definition>
  <definition term="First input delay (FID)">
    FID quantifies the experience of the user when they interact with the page during the page load. It is measured as the time between when a user first interacts with your site (mouse clicks, taps, select dropdowns, etc.) to the time when the browser can respond to that interaction. FID is one of the [core web vitals](https://web.dev/vitals/) metrics and available only in Chrome >85 via [Event Timing API](https://wicg.github.io/event-timing/). FID is captured as `First Input Delay` span for `page-load` transaction. Maintain FID **below 100 milliseconds** to provide a good user experience.
  </definition>
  <definition term="Total blocking time (TBT)">
    The sum of the blocking time (duration above 50 ms) for each long task that occurs between the First contentful paint and the time when the transaction is completed. [Total blocking time](https://web.dev/tbt/) is a great companion metric for [Time to interactive](https://web.dev/tti/) (TTI) which is lab metric and not available in the field through browser APIs. The agent captures TBT based on the number of long tasks that occurred during the page load lifecycle. Captured as `Total Blocking Time` span for `page-load` transaction.
  </definition>
  <definition term="Cumulative layout shift (CLS)">
    Metric that represents the cumulative score of all unexpected layout shifts that occur during the entire lifespan of the page. CLS is one of the [core web vitals](https://web.dev/vitals/) metrics and here is [how the score is calculated by Chrome](https://web.dev/cls/#layout-shift-score). Maintain a score of **less than 0.1** to provide a good user experience.
  </definition>
  <definition term="Long Tasks">
    A long task is any user activity or browser task that monopolize the UI thread for extended periods (greater than 50 milliseconds) and block other critical tasks (frame rate or input latency) from being executed. The agent uses the [Long Task API](https://www.w3.org/TR/longtasks/) which is only available in chromium-based browsers (Chrome >58, Edge >79, Opera >69). Captured as `Longtask<name>` span for all managed transactions. Learn more about [long task spans](https://docs-v3-preview.elastic.dev/reference/longtasks), and how to interpret them.
  </definition>
  <definition term="User Timing">
    The [User Timing](https://www.w3.org/TR/user-timing/) spec exposes API for developers to add custom performance entries to their web application. These custom metrics allow users to measure the hot paths of the app code that helps to identify a good user experience. RUM agent records all of the [performance.measure](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceMeasure) calls as spans by their measure name in the waterfall for all managed transactions.
  </definition>
</definitions>


## User Interactions

The RUM agent automatically instruments click event listeners that are registered by the application. The click events are captured as `user-interaction` transactions. However, to avoid sending too many `user-interaction` transactions to the server, the agent discards transactions with no spans (e.g. no network activity). Furthermore, if the click interaction results in route change, then a `route-change` transaction would be captured instead.
The transaction name can be influenced either by using the `name` or preferably the `data-transaction-name` HTML attribute. Examples of transaction names based on the html attributes present:
- `<button></button>`: `Click - button`
- `<button name="purchase"></button>`: `Click - button["purchase"]`
- `<button data-transaction-name="purchase"></button>`: `Click - purchase`


## Single Page Applications

All history `pushState` events will be captured as transactions. Most of these transactions can be enhanced by using framework specific integrations. For all unsupported frameworks/libraries, you can instrument the application by creating [custom transactions](https://docs-v3-preview.elastic.dev/reference/custom-transactions) and custom spans with the [span API](/reference/agent-api#apm-start-span).

## Frameworks

The agent supports [integrations with certain frameworks](https://docs-v3-preview.elastic.dev/reference/framework-specific-integrations).
To instrument custom metrics, like rendering time or mounting time of components on frameworks like React, Angular, Vue, etc., use the [custom transactions API](https://docs-v3-preview.elastic.dev/reference/custom-transactions).
The core RUM agent supports websites based on multi-page (MPA) and single-page architectures (SPA). The core RUM agent can be used on its own with SPA sites, but we recommend using our framework-specific integrations for the following reasons:
- **Pages are better grouped by routes**: This results in the `transaction.name` field mapping to the actual application route path declared in the SPA application.
- **Exact SPA navigation rendering**: Integration packages hook into the component lifecycle and measure the duration of the SPA transaction correctly. The core RUM agent is unable to determine when an SPA navigation is rendered and instead waits for the last network request before considering the SPA transition is finished.
- **Improved error capturing**: For example, when an error is thrown inside an Angular application, the framework integration will automatically capture it. The core RUM agent, however, is unable to capture the error as the default error handler doesn’t rethrow the error as a browser event.


## Platforms

The following platforms are supported:
![Elastic APM RUM Agent compatibility](https://docs-v3-preview.elastic.dev/reference/images/compatibility.png)