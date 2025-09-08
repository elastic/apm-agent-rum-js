---
navigation_title: "Elastic APM Real User Monitoring JavaScript Agent"
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/release-notes-5.x.html
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/release-notes.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
---

# Elastic APM Real User Monitoring JavaScript Agent release notes [elastic-apm-rum-javascript-agent-release-notes]

Review the changes, fixes, and more in each version of Elastic APM Real User Monitoring JavaScript Agent.

To check for security updates, go to [Security announcements for the Elastic stack](https://discuss.elastic.co/c/announcements/security-announcements/31).

% Release notes includes only features, enhancements, and fixes. Add breaking changes, deprecations, and known issues to the applicable release notes sections.

% ## version.next [elastic-apm-rum-javascript-agent-versionext-release-notes]
% **Release date:** Month day, year

% ### Features and enhancements [elastic-apm-rum-javascript-agent-versionext-features-enhancements]

% ### Fixes [elastic-apm-rum-javascript-agent-versionext-fixes]

## 5.17.0 [elastic-apm-rum-javascript-agent-5170-release-notes]
**Release date:** April 9, 2025

### Features and enhancements [elastic-apm-rum-javascript-agent-5170-features-enhancements]
* Add support to add labels in captured errors [#1594](https://github.com/elastic/apm-agent-rum-js/pull/1594)

## 5.16.1 [elastic-apm-rum-javascript-agent-5161-release-notes]
**Release date:** June 27, 2024

### Fixes [elastic-apm-rum-javascript-agent-5161-fixes]
* User interaction click transactions will report correct transaction names for IE11 [#1511](https://github.com/elastic/apm-agent-rum-js/pull/1511)

## 5.16.0 [elastic-apm-rum-javascript-agent-5160-release-notes]
**Release date:** December 27, 2023

### Features and enhancements [elastic-apm-rum-javascript-agent-5160-features-enhancements]
* Add Support for [Interaction to Next Paint (INP) metric](https://web.dev/articles/inp). This new metric, which replaces FID, will be available in the User Experience App from version 8.12.0 of the Elastic Stack. [#1462](https://github.com/elastic/apm-agent-rum-js/pull/1462)

## 5.15.0 [elastic-apm-rum-javascript-agent-5150-release-notes]
**Release date:** September 27, 2023

### Features and enhancements [elastic-apm-rum-javascript-agent-5150-features-enhancements]
* Capture errors from objects thrown from the promise rejection events including the `reason and custom properties`: [#1428](https://github.com/elastic/apm-agent-rum-js/pull/1428)

## 5.14.0 [elastic-apm-rum-javascript-agent-5140-release-notes]
**Release date:** August 3, 2023

### Features and enhancements [elastic-apm-rum-javascript-agent-5140-features-enhancements]
* Add redirect span to the page-load transaction: [#1400](https://github.com/elastic/apm-agent-rum-js/pull/1400)

### Fixes [elastic-apm-rum-javascript-agent-5140-fixes]
* Fetch API instrumentation now handles requests with `URL` objects. [#1398](https://github.com/elastic/apm-agent-rum-js/pull/1398)

## 5.13.0 [elastic-apm-rum-javascript-agent-5130-release-notes]
**Release date:** July 19, 2023

### Features and enhancements [elastic-apm-rum-javascript-agent-5130-features-enhancements]
* Support for Angular 16 is made available via `@elastic/apm-rum-angular@3.0.0`: [#1380](https://github.com/elastic/apm-agent-rum-js/pull/1380)
* Improve user-interaction transactions naming. Unsupported browsers: IE11 [#1390](https://github.com/elastic/apm-agent-rum-js/pull/1390)
* Add `apmRequest` and `sendCredentials` config to TypeScript typings: [#1254](https://github.com/elastic/apm-agent-rum-js/pull/1254) [#1243](https://github.com/elastic/apm-agent-rum-js/pull/1243)

### Fixes [elastic-apm-rum-javascript-agent-5130-fixes]
* Fix warnings where performance entries are not supported: [#1246](https://github.com/elastic/apm-agent-rum-js/pull/1246)

## 5.12.0 [elastic-apm-rum-javascript-agent-5120-release-notes]
**Release date:** June 14, 2022

### Features and enhancements [elastic-apm-rum-javascript-agent-5120-features-enhancements]
* Introduce new config option [`sendCredentials`](/reference/configuration.md#send-credentials). This allows the agent to send cookies to APM servers that are behind reverse proxies that need requests to be authenticated: [#1238](https://github.com/elastic/apm-agent-rum-js/pull/1238)
* Agent now warns users if they provide non-existent config options when initializing it: [#1230](https://github.com/elastic/apm-agent-rum-js/pull/1230)

### Fixes [elastic-apm-rum-javascript-agent-5120-fixes]
* Capture the stacktrace of a SyntaxError triggered because of a malformed JavaScript code. Before this fix the agent was capturing an empty stacktrace: [#1239](https://github.com/elastic/apm-agent-rum-js/pull/1239)

## 5.11.1 [elastic-apm-rum-javascript-agent-5111-release-notes]
**Release date:** May 16, 2022

### Features and enhancements [elastic-apm-rum-javascript-agent-5111-features-enhancements]
* Span’s outcome is now set to `Unknown` when a Fetch/XHR request is aborted. The outcome can be found in the metadata information of the span details in APM UI: [#1211](https://github.com/elastic/apm-agent-rum-js/pull/1211)
* Allow users the ability to disable compression for the events sent to APM server. This is helpful for debugging purposes while inspecting via Devtools and also for generating HAR file. Please see our [troubleshooting](docs-content://troubleshoot/observability/apm-agent-rum-js/apm-real-user-monitoring-javascript-agent.md#disable-events-payload-compression) guide for more information: [#1214](https://github.com/elastic/apm-agent-rum-js/pull/1214)

### Fixes [elastic-apm-rum-javascript-agent-5111-fixes]
* The instrumentation of fetch API consumes a response as a readable stream properly. Before this fix the related span was being ended on the start of the response rather than on the end of it: [#1213](https://github.com/elastic/apm-agent-rum-js/pull/1213)
* Agent now can listen to all click events on the page. Users can enable/disable click instrumentation via `disableInstrumentation: ["click"]`. `eventtarget` instrumentation flag will be deprecated in favor of `click` and will be removed in the future releases: [#1219](https://github.com/elastic/apm-agent-rum-js/pull/1219)

## 5.11.0 [elastic-apm-rum-javascript-agent-5110-release-notes]
**Release date:** April 20, 2022

### Features and enhancements [elastic-apm-rum-javascript-agent-5110-features-enhancements]
* Events are now beaconed when the user abandons or backgrounds the page, this makes sure the agent never miss an event. Before this change it was only sending them every interval configurable via `flushInterval`. Unsupported browsers: Firefox, IE11: [#1146](https://github.com/elastic/apm-agent-rum-js/pull/1146)

::::{note}
Transactions based on the [supported technologies](/reference/supported-technologies.md) and [custom managed transactions](/reference/custom-transactions.md#custom-managed-transactions) are the only ones taken into account.
::::

* **rum-vue:** Introduce script setup syntax support: [#1194](https://github.com/elastic/apm-agent-rum-js/issues/1194)
* Override reuse threshold when redefining a transaction. This will permit the agent not to miss data on slow network connections: [#1196](https://github.com/elastic/apm-agent-rum-js/issues/1196)

### Fixes [elastic-apm-rum-javascript-agent-5110-fixes]
* Report Largest Contentful Paint (LCP) properly. Before this fix the agent was not giving the browser enough time to capture LCP entries that are post on-load: [#1190](https://github.com/elastic/apm-agent-rum-js/pull/1190)

## 5.10.2 [elastic-apm-rum-javascript-agent-5102-release-notes]
**Release date:** February 3, 2022

### Fixes [elastic-apm-rum-javascript-agent-5102-fixes]
* create user-interaction transactions based on the element on which the event occurred rather than the element on which the event handler has been attached. All web applications that rely on event delegation will benefit from this: [#969](https://github.com/elastic/apm-agent-rum-js/issues/969)

## 5.10.1 [elastic-apm-rum-javascript-agent-5101-release-notes]
**Release date:** January 10, 2022

### Features and enhancements [elastic-apm-rum-javascript-agent-5101-features-enhancements]
* **rum-core:** update Cumulative layout shift(CLS) calculation following the new guidelines from Google: `maximum session window with 1 second gap, capped at 5 seconds.`: [#1033](https://github.com/elastic/apm-agent-rum-js/issues/1033)

### Fixes [elastic-apm-rum-javascript-agent-5101-fixes]
* **rum-angular:** recover compatibility with Angular 9.0.x: [#1115](https://github.com/elastic/apm-agent-rum-js/issues/1115)

## 5.10.0 [elastic-apm-rum-javascript-agent-5100-release-notes]
**Release date:** December 7, 2021

### Features and enhancements [elastic-apm-rum-javascript-agent-5100-features-enhancements]
* Introduce new config option `serverUrlPrefix` to make the APM server URL configurable: [#1078](https://github.com/elastic/apm-agent-rum-js/issues/1078)
* Expose Transaction, Span, TransactionOptions and SpanOptions types definition: [#1045](https://github.com/elastic/apm-agent-rum-js/issues/1045) and [#995](https://github.com/elastic/apm-agent-rum-js/issues/995)
* Set the values to empty string for deprecated span destination metrics: [#1098](https://github.com/elastic/apm-agent-rum-js/issues/1098)

### Fixes [elastic-apm-rum-javascript-agent-5100-fixes]
* Check the existence of navigation timing data when compressing transaction marks: [#1104](https://github.com/elastic/apm-agent-rum-js/issues/1104)

## 5.9.1 [elastic-apm-rum-javascript-agent-591-release-notes]
**Release date:** July 15, 2021

### Fixes [elastic-apm-rum-javascript-agent-591-fixes]
* Validate `apmRequest` function is called for every request sent to the APM server when compression is enabled: [#1055](https://github.com/elastic/apm-agent-rum-js/issues/1055)

## 5.9.0 [elastic-apm-rum-javascript-agent-590-release-notes]
**Release date:** July 13, 2021

### Features and enhancements [elastic-apm-rum-javascript-agent-591-features-enhancements]
* Add support for [apmRequest configuration](/reference/configuration.md#apm-request) that allows users to pass a custom function that can be used to modify the request sent to the APM server: [#1018](https://github.com/elastic/apm-agent-rum-js/issues/1018)
* Support for React 17 is made available via `@elastic/apm-rum-react` package: [#1031](https://github.com/elastic/apm-agent-rum-js/issues/1031)
* Support for Angular 12 is made available via `@elastic/apm-rum-angular` package: [#1028](https://github.com/elastic/apm-agent-rum-js/issues/1028)

### Fixes [elastic-apm-rum-javascript-agent-590-fixes]
* Update incorrect typings for adding labels to transaction and spans: [#1017](https://github.com/elastic/apm-agent-rum-js/issues/1017)

## 5.8.0 [elastic-apm-rum-javascript-agent-580-release-notes]
**Release date:** April 19, 2021

### Features and enhancements [elastic-apm-rum-javascript-agent-590-features-enhancements]
* First draft of session information is added for `page-load` Transactions (disabled by default): [#634](https://github.com/elastic/apm-agent-rum-js/issues/634)

## 5.7.2 [elastic-apm-rum-javascript-agent-572-release-notes]
**Release date:** April 2, 2021

### Fixes [elastic-apm-rum-javascript-agent-572-fixes]
* Transaction marks for the APM server V3 spec was mapped to incorrect field which resulted in Kibana User Expererience App missing some of the core data. This only affects users who had set config `apiVersion` > 2: [#1007](https://github.com/elastic/apm-agent-rum-js/issues/1007)

## 5.7.1 [elastic-apm-rum-javascript-agent-571-release-notes]
**Release date:** March 17, 2021

### Fixes [elastic-apm-rum-javascript-agent-571-fixes]
* Discard buffered longtasks spans from page load transactions getting added to subsequent route change and other auto auto-instrumented transactions resulting in incorrect start time for those transactions: [#989](https://github.com/elastic/apm-agent-rum-js/issues/989)

## 5.7.0 [elastic-apm-rum-javascript-agent-570-release-notes]
**Release date:** March 15, 2021

### Features and enhancements [elastic-apm-rum-javascript-agent-570-features-enhancements]
* Support regular expression for detecting distributed tracing origins (`distributedTracingOrigins`): [#943](https://github.com/elastic/apm-agent-rum-js/issues/943)
* Capture buffered longtask entries: [#964](https://github.com/elastic/apm-agent-rum-js/issues/964)
* Expose agent configuration TypeScript definition: [#979](https://github.com/elastic/apm-agent-rum-js/issues/979)

## 5.6.3 [elastic-apm-rum-javascript-agent-563-release-notes]
**Release date:** February 2, 2021

### Features and enhancements [elastic-apm-rum-javascript-agent-563-features-enhancements]
* Propagate sampling weight through tracestate header: [#845](https://github.com/elastic/apm-agent-rum-js/issues/845)
* Add necessary scripts to load test APM server with RUM payload: [#948](https://github.com/elastic/apm-agent-rum-js/issues/948)

### Fixes [elastic-apm-rum-javascript-agent-563-fixes]
* Handle null reason in promise rejection event: [#940](https://github.com/elastic/apm-agent-rum-js/issues/940)

## 5.6.2 [elastic-apm-rum-javascript-agent-562-release-notes]
**Release date:** November 6, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-562-features-enhancements]
* Add transaction sampling rate precision which ensures `transaction_sample_rate` configuration option has a maximum precision of 4 decimal places: [#927](https://github.com/elastic/apm-agent-rum-js/issues/927)
* Add `outcome` field to applicable transactions and spans that is used by the APM UI for displaying the error rate chart: [#904](https://github.com/elastic/apm-agent-rum-js/issues/904)

## 5.6.1 [elastic-apm-rum-javascript-agent-561-release-notes]
**Release date:** September 29, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-561-features-enhancements]
* Longtasks are now aggregated under the experience field to make querying faster: [#900](https://github.com/elastic/apm-agent-rum-js/issues/900)

### Fixes [elastic-apm-rum-javascript-agent-561-fixes]
* Check for a Webkit Navigation timing API bug is added to avoid having incorrect navigation marks: [#903](https://github.com/elastic/apm-agent-rum-js/issues/903)

## 5.6.0 [elastic-apm-rum-javascript-agent-560-release-notes]
**Release date:** September 17, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-560-features-enhancements]
* Add new method signaturtes to the exported type definitions: [#890](https://github.com/elastic/apm-agent-rum-js/issues/890)
* Improve the span creation time when there is an active transaction on page: [#883](https://github.com/elastic/apm-agent-rum-js/issues/883)

### Fixes [elastic-apm-rum-javascript-agent-560-fixes]
* Frameworks should not be automatically instrumented when the apm is inactive : [#885](https://github.com/elastic/apm-agent-rum-js/issues/885)
* Add default XHR timeout for compressed requests to APM server: [#897](https://github.com/elastic/apm-agent-rum-js/issues/897)
* Measure First Input Delay metrics properly for page load transactions: [#899](https://github.com/elastic/apm-agent-rum-js/issues/899)

## 5.5.0 [elastic-apm-rum-javascript-agent-550-release-notes]
**Release date:** August 18, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-550-features-enhancements]
* Provide an API to block all auto instrumented transactions created by the agent through `transaction.block` method. Users can also use the `startSpan` API to create blocking spans to control this behaviour: [#866](https://github.com/elastic/apm-agent-rum-js/issues/866)
* Expose options to create blocking spans from the agent API via `startSpan`: [#875](https://github.com/elastic/apm-agent-rum-js/issues/875)
* Capture Cumulative layout shift(CLS), Total blocking time(TBT) and First input delay(FID) as part of experience metrics under page-load transactions: [#838](https://github.com/elastic/apm-agent-rum-js/issues/838)

### Fixes [elastic-apm-rum-javascript-agent-550-fixes]
* Track various XHR states like timeouts, errors and aborts and end all managed transactions correctly: [#871](https://github.com/elastic/apm-agent-rum-js/issues/871)
* Fix inconsistencies in the XHR timings by removing the task scheduling logic: [#871](https://github.com/elastic/apm-agent-rum-js/issues/871)
* Accept the user provided `logLevel` configuration when agent is not active: [#861](https://github.com/elastic/apm-agent-rum-js/issues/861)
* Opentracing Tracer should return Noop on unsupported platforms: [#872](https://github.com/elastic/apm-agent-rum-js/issues/872)s

## 5.4.0 [elastic-apm-rum-javascript-agent-540-release-notes]
**Release date:** July 29, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-540-features-enhancements]
* Agent now uses the new CompressionStream API available on modern browsers to gzip compress the payload sent to the APM server. This yields a huge reduction of around ~96% in the payload size for an example web application when compared with the v3 specification: [#572](https://github.com/elastic/apm-agent-rum-js/issues/572)

## 5.3.0 [elastic-apm-rum-javascript-agent-530-release-notes]
**Release date:** July 6, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-530-features-enhancements]
* Introduced better grouping strategy for all managed transactions based on the current browser’s location by default instead of grouping all transactions under `UNKNOWN` category: [#827](https://github.com/elastic/apm-agent-rum-js/issues/827)
* Capture XHR, Fetch calls as spans that happened before the agent script is downloaded using the browser’s Resource Timing API: [#825](https://github.com/elastic/apm-agent-rum-js/issues/825)
* Populate `span.destination.*` context fields for Navigation Timing span that denotes the HTML downloading phase: [#829](https://github.com/elastic/apm-agent-rum-js/issues/829)
* Use Page Visibility API to discard transactions if the page was backgrounded at any point during the lifetime of the transaction: [#295](https://github.com/elastic/apm-agent-rum-js/issues/295)
* Add `apiVersion` config to TypeScript typings: [#833](https://github.com/elastic/apm-agent-rum-js/issues/833)

## 5.2.1 [elastic-apm-rum-javascript-agent-521-release-notes]
**Release date:** June 24, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-521-features-enhancements]
* Added support for path array in `<ApmRoute>` React component that associates the transaction based on the mounted path: [#702](https://github.com/elastic/apm-agent-rum-js/issues/702)

### Fixes [elastic-apm-rum-javascript-agent-521-fixes]
* Capture Total Blocking Time (TBT) only after all longtask entries are observed: [#803](https://github.com/elastic/apm-agent-rum-js/issues/803)
* Do not capture page load transaction marks when the NavigationTiming data from the browsers are not trustable: [#818](https://github.com/elastic/apm-agent-rum-js/issues/818)

## 5.2.0 [elastic-apm-rum-javascript-agent-520-release-notes]
**Release date:** May 28, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-520-features-enhancements]
* Agent now supports compressing events payload sent to the APM server via new configuration [apiVersion](/reference/configuration.md#api-version). It yeilds a huge reduction of around ~45% in the payload size for average sized web pages: [#768](https://github.com/elastic/apm-agent-rum-js/issues/768)
* Capture First Input Delay(FID) as Span for page-load transaction: [#732](https://github.com/elastic/apm-agent-rum-js/issues/732)
* Capture Total Blocking Time(TBT) as Span for page-load transaction: [#781](https://github.com/elastic/apm-agent-rum-js/issues/781)
* Refactor ServiceFactory class to use constant service names: [#238](https://github.com/elastic/apm-agent-rum-js/issues/238)

### Fixes [elastic-apm-rum-javascript-agent-520-fixes]
* Allow setting labels before agent is initialized: [#780](https://github.com/elastic/apm-agent-rum-js/issues/780)
* Use single instance of apm across all packages: [#791](https://github.com/elastic/apm-agent-rum-js/issues/791)
* User defined types for managed transactions are considered of high precedence: [#758](https://github.com/elastic/apm-agent-rum-js/issues/758)
* Add span subtype information in payload without camelcasing: [#753](https://github.com/elastic/apm-agent-rum-js/issues/753)
* Treat truncated spans percentage as regular span in breakdown calculation: [#776](https://github.com/elastic/apm-agent-rum-js/issues/776)

## 5.1.1 [elastic-apm-rum-javascript-agent-511-release-notes]
**Release date:** April 15, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-511-features-enhancements]
* Performance Observer is used to measure FirstContentfulPaint Metric: [#731](https://github.com/elastic/apm-agent-rum-js/issues/731)

### Fixes [elastic-apm-rum-javascript-agent-511-fixes]
* Avoid full component re-rerender when query params are updated on current `ApmRoute` inside child components: [#748](https://github.com/elastic/apm-agent-rum-js/issues/748)

## 5.1.0 [elastic-apm-rum-javascript-agent-510-release-notes]
**Release date:** April 8, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-510-features-enhancements]
* Route change transactions now includes the browsers next paint frame: [#404](https://github.com/elastic/apm-agent-rum-js/issues/404)
* Support differential loading with Angular CLI: [#607](https://github.com/elastic/apm-agent-rum-js/issues/607)
* Reduced the bundle size by modifying the random number generator algorithm: [#705](https://github.com/elastic/apm-agent-rum-js/issues/705)

### Fixes [elastic-apm-rum-javascript-agent-510-fixes]
* Handle when errors are thrown in unsupported browsers: [#707](https://github.com/elastic/apm-agent-rum-js/issues/707)
* Captured API calls are duplicated as spans in IE: [#723](https://github.com/elastic/apm-agent-rum-js/issues/723)

## 5.0.0 [elastic-apm-rum-javascript-agent-500-release-notes]
**Release date:** March 18, 2020

### Features and enhancements [elastic-apm-rum-javascript-agent-500-features-enhancements]
* Monitor longtasks by default during active transaction: [#601](https://github.com/elastic/apm-agent-rum-js/issues/601)
* Set sync field only for synchronous spans: [#619](https://github.com/elastic/apm-agent-rum-js/issues/619)
