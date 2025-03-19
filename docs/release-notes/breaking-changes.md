---
navigation_title: "Breaking changes"
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/upgrade-to-v5.html
---

# {{apm-rum-agent}} breaking changes [elastic-apm-real-user-monitoring-javascript-agent-breaking-changes]
Breaking changes can impact your Elastic applications, potentially disrupting normal operations. Before you upgrade, carefully review the {{apm-rum-agent}} breaking changes and take the necessary steps to mitigate any issues. To learn how to upgrade, check [Upgrading](/reference/upgrading.md).

% ## Next version [elastic-apm-real-user-monitoring-javascript-agent-nextversion-breaking-changes]
% **Release date:** Month day, year

% ::::{dropdown} Title of breaking change
% Description of the breaking change.
% For more information, check [PR #](PR link).
% **Impact**<br> Impact of the breaking change.
% **Action**<br> Steps for mitigating deprecation impact.
% ::::

## 5.15.0 [elastic-apm-real-user-monitoring-javascript-agent-5150-breaking-changes]
**Release date:** September 27, 2023

::::{dropdown} Agents sets same start time for sampled and unsampled page load transactions
For more information, check [#1435](https://github.com/elastic/apm-agent-rum-js/pull/1435).

**Impact**<br> 
Previously, there was a start time discrepancy between sampled and unsampled page load transactions, which was wrong. From now on, the agent will set the same start time for both of them.
Custom dashboards built using the page load duration will see an effect with the solution.
::::

## 5.13.0 [elastic-apm-real-user-monitoring-javascript-agent-5130-breaking-changes]
**Release date:** July 19, 2023

::::{dropdown} Breakdown timings reported as microsecond values
Previously, breakdown timings were reported as milliseconds values in the `span.self_time.sum.us field`, which was wrong. From now on, it will be reported as microsecond values to match the APM specification. 

For more information, check [#1381](https://github.com/elastic/apm-agent-rum-js/pull/1381).
::::

::::{dropdown} No longer records transaction metrics
The metrics `transaction.duration.sum.us`, `transaction.duration.count` and `transaction.breakdown.count` are no longer recorded.

For more information, check [#1382](https://github.com/elastic/apm-agent-rum-js/pull/1382).
::::

## 5.0.0 [elastic-apm-real-user-monitoring-javascript-agent-500-breaking-changes]
**Release date:** March 18, 2020

Upgrading from version `4.x` to `5.x` of {{apm-rum-agent}} introduces some breaking changes.

::::{dropdown} Global labels are only added to metadata to improve payload size

For more information, check [#618](https://github.com/elastic/apm-agent-rum-js/issues/618).
::::

::::{dropdown} Labels now accept Boolean and Number types

For more information, check [#272](https://github.com/elastic/apm-agent-rum-js/issues/272).
::::

::::{dropdown} Agent name changed to `rum-js`

For more information, check [#379](https://github.com/elastic/apm-agent-rum-js/issues/379).

**Action**<br> 
Because older versions of the APM app in Kibana don’t recognize this new name, you may need to upgrade your Elastic stack version.
::::

::::{dropdown} Official W3C tracecontext support
The RUM Agent supports the official W3C tracecontext `traceparent` header, instead of the previously used `elastic-apm-traceparent` header.

For more information, check [#477](https://github.com/elastic/apm-agent-rum-js/issues/477).

**Action**<br> 
If you’re using Elastic backend agents, you must upgrade them to a version that also supports the official W3C tracecontext headers.
::::

::::{dropdown} `addTags` replaced with `addLabels
`addTags`, which was deprecated in version `4.1`, has been removed. 

For more information, check [#215](https://github.com/elastic/apm-agent-rum-js/issues/215).

**Action**<br> 
Use `addLabels`, which supports strings, booleans, and numbers:

* `apm.addTags()` removed in favor of [`apm.addLabels()`](/reference/agent-api.md#apm-add-labels).
* `span.addTags()` removed in favor of [`span.addLabels()`](/reference/span-api.md#span-add-labels).
* `transaction.addTags()` removed in favor of [`transaction.addLabels()`](/reference/transaction-api.md#transaction-add-labels).
::::

::::{dropdown} Single queue processing
A single queue is now used to process all events (transactions, errors, etc.). This change allows the consolidation of four configuration options into one.

For more information, check [#628](https://github.com/elastic/apm-agent-rum-js/issues/628).

**Impact**<br> 
Removed options:

* `errorThrottleLimit`
* `errorThrottleInterval`
* `transactionThrottleLimit`
* `transactionThrottleInterval`

Added option:

* [`eventsLimit`](/reference/configuration.md#events-limit) — Configure the number of events sent to APM Server per minute. Defaults to `80`.
::::