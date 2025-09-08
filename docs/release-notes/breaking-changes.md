---
navigation_title: "Breaking changes"
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/upgrade-to-v5.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
---

# Elastic APM Real User Monitoring JavaScript Agent breaking changes [elastic-apm-real-user-monitoring-javascript-agent-breaking-changes]
Before you upgrade, carefully review the Elastic APM Real User Monitoring JavaScript Agent breaking changes and take the necessary steps to mitigate any issues.

% To learn how to upgrade, check out <upgrade docs>.

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

Previously, there was a start time discrepancy between sampled and unsampled page load transactions, which was wrong. From now on, the agent will set the same start time for both of them.
Custom dashboards built using the page load duration will see an effect with the solution.

For more information, check [#1435](https://github.com/elastic/apm-agent-rum-js/pull/1435).

## 5.13.0 [elastic-apm-real-user-monitoring-javascript-agent-5130-breaking-changes]
**Release date:** July 19, 2023

* Previously, breakdown timings were reported as milliseconds values in the `span.self_time.sum.us field`, which was wrong. From now on, it will be reported as microsecond values to match the APM specification. For more information, check [#1381](https://github.com/elastic/apm-agent-rum-js/pull/1381).
* The metrics `transaction.duration.sum.us`, `transaction.duration.count` and `transaction.breakdown.count` are no longer recorded. For more information, check [#1382](https://github.com/elastic/apm-agent-rum-js/pull/1382).

## 5.0.0 [elastic-apm-real-user-monitoring-javascript-agent-500-breaking-changes]
**Release date:** March 18, 2020

Upgrading from version `4.x` to `5.x` of the RUM Agent introduces some breaking changes.

### Global labels are only added to metadata to improve payload size
For more information, check [#618](https://github.com/elastic/apm-agent-rum-js/issues/618).

### Labels now accept Boolean and Number types
For more information, check [#272](https://github.com/elastic/apm-agent-rum-js/issues/272).

### Agent name changed to `rum-js`
The Agent name has been changed to `rum-js`. Because older versions of the APM app in Kibana don’t recognize this new name, you may need to upgrade your Elastic stack version.

For more information, check [#379](https://github.com/elastic/apm-agent-rum-js/issues/379).

### Official W3C tracecontext support
The RUM Agent supports the official W3C tracecontext `traceparent` header, instead of the previously used `elastic-apm-traceparent` header. If you’re using Elastic backend agents, you must upgrade them to a version that also supports the official W3C tracecontext headers.

For more information, check [#477](https://github.com/elastic/apm-agent-rum-js/issues/477).

### `addTags` replaced with `addLabels
`addTags`, which was deprecated in version `4.1`, has been removed and replaced with `addLabels`, which supports strings, booleans, and numbers:

* `apm.addTags()` removed in favor of [`apm.addLabels()`](/reference/agent-api.md#apm-add-labels).
* `span.addTags()` removed in favor of [`span.addLabels()`](/reference/span-api.md#span-add-labels).
* `transaction.addTags()` removed in favor of [`transaction.addLabels()`](/reference/transaction-api.md#transaction-add-labels).

For more information, check [#215](https://github.com/elastic/apm-agent-rum-js/issues/215).

### Single queue processing
A single queue is now used to process all events (transactions, errors, etc.). This change allows the consolidation of four configuration options into one:

Removed options:

* `errorThrottleLimit`
* `errorThrottleInterval`
* `transactionThrottleLimit`
* `transactionThrottleInterval`

Added option:

* [`eventsLimit`](/reference/configuration.md#events-limit) — Configure the number of events sent to APM Server per minute. Defaults to `80`.

For more information, check [#628](https://github.com/elastic/apm-agent-rum-js/issues/628).

## Upgrade steps [v5-upgrade-steps]

### Upgrade APM Server [v5-upgrade-server]
Version `5.x` of the RUM Agent requires APM Server version >= `7.0`. The [APM Server `7.0` upgrade guide](https://www.elastic.co/guide/en/apm/guide/7.17/upgrading-to-70.html) can help with the upgrade process.

::::{note}
APM Server version >= `7.0` requires Elasticsearch and Kibana versions >= `7.0` as well.
::::

### Upgrade backend agents [v5-upgrade-agents]
All Elastic APM agents have been upgraded to support the changes in the RUM Agent. You must upgrade your backend agents to the minimum versions listed below for all features to work:

| Agent name | Agent Version |
| --- | --- |
| **Go Agent** | >= `1.6` |
| **Java Agent** | >= `1.14` |
| **.NET Agent** | >= `1.3` |
| **Node.js Agent** | >= `3.4` |
| **Python Agent** | >= `5.4` |
| **Ruby Agent** | >= `3.5` |

### Upgrade the RUM agent [v5-update-rum-agent]
Update or download the latest version of the RUM Agent using your [preferred installation method](/reference/install-agent.md).

If your old configuration used one of the removed config options (listed below), update your configuration to use the new config options instead.

Removed configurations:

* `errorThrottleLimit` removed in favor of [`eventsLimit`](/reference/configuration.md#events-limit).
* `errorThrottleInterval` removed in favor of [`eventsLimit`](/reference/configuration.md#events-limit).
* `transactionThrottleLimit` removed in favor of [`eventsLimit`](/reference/configuration.md#events-limit).
* `transactionThrottleInterval` removed in favor of [`eventsLimit`](/reference/configuration.md#events-limit).
* `apm.addTags()` removed in favor of [`apm.addLabels()`](/reference/agent-api.md#apm-add-labels).
* `span.addTags()` removed in favor of [`span.addLabels()`](/reference/span-api.md#span-add-labels).
* `transaction.addTags()` removed in favor of [`transaction.addLabels()`](/reference/transaction-api.md#transaction-add-labels).
