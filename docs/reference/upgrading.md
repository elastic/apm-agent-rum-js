---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/upgrading.html
---

# Upgrading [upgrading]

Upgrades between minor versions of the agent, like from 3.1 to 3.2 are always backwards compatible. Upgrades that involve a major version bump often come with some backwards incompatible changes.

Before upgrading the agent, be sure to review the:

* [Agent release notes](/release-notes/release-notes.md)
* [Agent and Server compatibility chart](docs-content://solutions/observability/apps/apm-agent-compatibility.md)

## Upgrade APM Server [v5-upgrade-server]
Version `5.x` of the RUM Agent requires APM Server version >= `7.0`. The [APM Server `7.0` upgrade guide](https://www.elastic.co/guide/en/apm/guide/7.17/upgrading-to-70.html) can help with the upgrade process.

::::{note}
APM Server version >= `7.0` requires Elasticsearch and Kibana versions >= `7.0` as well.
::::

## Upgrade backend agents [v5-upgrade-agents]
All Elastic APM agents have been upgraded to support the changes in the RUM Agent. You must upgrade your backend agents to the minimum versions listed below for all features to work:

| Agent name | Agent Version |
| --- | --- |
| **Go Agent** | >= `1.6` |
| **Java Agent** | >= `1.14` |
| **.NET Agent** | >= `1.3` |
| **Node.js Agent** | >= `3.4` |
| **Python Agent** | >= `5.4` |
| **Ruby Agent** | >= `3.5` |

## Upgrade the RUM agent [v5-update-rum-agent]
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

## End of life dates [end-of-life-dates]

We love all our products, but sometimes we must say goodbye to a release so that we can continue moving forward on future development and innovation. Our [End of life policy](https://www.elastic.co/support/eol) defines how long a given release is considered supported, as well as how long a release is considered still in active development or maintenance. The table below is a simplified description of this policy.

| Agent version | EOL Date | Maintained until |
| --- | --- | --- |
| 4.8.x | 2021-08-13 | 4.9.0 |
| 4.7.x | 2021-07-15 | 4.8.0 |
| 4.6.x | 2021-05-19 | 4.7.0 |
| 4.5.x | 2021-03-30 | 4.6.0 |
| 4.4.x | 2021-02-05 | 4.5.0 |
| 4.3.x | 2021-01-11 | 4.4.0 |
| 4.2.x | 2021-01-08 | 4.3.0 |
| 4.1.x | 2020-12-12 | 4.2.0 |
| 4.0.x | 2020-09-11 | 4.1.0 |
| 3.0.x | 2020-07-29 | 5.0.0 |
| 2.3.x | 2020-06-18 | 4.0.0 |
| 2.2.x | 2020-06-05 | 2.3.0 |
| 2.1.x | 2020-06-03 | 2.2.0 |
| 2.0.x | 2020-05-14 | 2.1.0 |
| 1.0.x | 2020-02-23 | 3.0.0 |


