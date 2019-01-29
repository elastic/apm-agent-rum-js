<a name="3.0.0"></a>
# [3.0.0](https://github.com/elastic/apm-agent-js-base/compare/v2.3.0...v3.0.0) (2019-01-29)

### BREAKING CHANGE

* remove setTags in favor of addTags API ([#28](https://github.com/elastic/apm-agent-js-core/issues/28))
* introduce subtype and action in Spans ([#9](https://github.com/elastic/apm-agent-js-core/issues/9)) ([5fd4af7](https://github.com/elastic/apm-agent-js-core/commit/5fd4af7))


### Features

* add OpenTracing support ([#138](https://github.com/elastic/apm-agent-js-base/issues/138)) ([0cff389](https://github.com/elastic/apm-agent-js-base/commit/0cff389))
* include transaction flags on error ([#29](https://github.com/elastic/apm-agent-js-core/issues/29)) ([36c13f3](https://github.com/elastic/apm-agent-js-core/commit/36c13f3))
* send span sync field to apm server ([#17](https://github.com/elastic/apm-agent-js-core/issues/17)) ([abad58b](https://github.com/elastic/apm-agent-js-core/commit/abad58b))
* add addContext and addTags to Spans and Transactions ([#16](https://github.com/elastic/apm-agent-js-core/issues/16)) ([de0d72b](https://github.com/elastic/apm-agent-js-core/commit/de0d72b))
* add paint timing mark to page-load transaction ([#14](https://github.com/elastic/apm-agent-js-core/issues/14)) ([544530a](https://github.com/elastic/apm-agent-js-core/commit/544530a))


### Bug Fixes

* propagate transaction ID for unsampled transactions ([#30](https://github.com/elastic/apm-agent-js-core/issues/30)) ([3884806](https://github.com/elastic/apm-agent-js-core/commit/3884806))
* remove invalid chars in span tags and marks ([#34](https://github.com/elastic/apm-agent-js-core/issues/34)) ([9bdc575](https://github.com/elastic/apm-agent-js-core/commit/9bdc575))
* Bundling -  moving to webpack 4 and babel 7 ([#123](https://github.com/elastic/apm-agent-js-base/issues/123)) ([0ae3f53](https://github.com/elastic/apm-agent-js-base/commit/0ae3f53))
* remove query strings from xhr and fetch span name ([#24](https://github.com/elastic/apm-agent-js-core/issues/24)) ([cc82e92](https://github.com/elastic/apm-agent-js-core/commit/cc82e92))
* set pageLoadTransactionName when transaction ends from configs ([#25](https://github.com/elastic/apm-agent-js-core/issues/25)) ([afdacee](https://github.com/elastic/apm-agent-js-core/commit/afdacee))



### Performance Improvements

* introduce minimal url parser to reduce bundle size ([#32](https://github.com/elastic/apm-agent-js-core/issues/32)) ([2000ee2](https://github.com/elastic/apm-agent-js-core/commit/2000ee2))


<a name="2.2.0"></a>
# [2.2.0](https://github.com/elastic/apm-agent-js-base/compare/v2.1.1...v2.2.0) (2018-12-05)


### Features

* introduce subtype and action in Spans ([#9](https://github.com/elastic/apm-agent-js-core/issues/9)) ([5fd4af7](https://github.com/elastic/apm-agent-js-core/commit/5fd4af7))


<a name="2.1.1"></a>
## [2.1.1](https://github.com/elastic/apm-agent-js-base/compare/v2.1.0...v2.1.1) (2018-12-05)


### Bug Fixes

* use dist package for url-parse to avoid packaging issues ([#10](https://github.com/elastic/apm-agent-js-core/issues/10)) ([9018a8d](https://github.com/elastic/apm-agent-js-core/commit/9018a8d))


### Features

* introduce subtype and action in Spans ([#9](https://github.com/elastic/apm-agent-js-core/issues/9)) ([5fd4af7](https://github.com/elastic/apm-agent-js-core/commit/5fd4af7))


<a name="2.1.0"></a>
# [2.1.0](https://github.com/elastic/apm-agent-js-base/compare/v2.0.0...v2.1.0) (2018-12-03)


### Features

* instrument fetch API ([2375a60](https://github.com/elastic/apm-agent-js-core/commit/2375a60))


<a name="2.0.0"></a>
# [2.0.0](https://github.com/elastic/apm-agent-js-base/compare/v1.0.0...v2.0.0) (2018-11-14)



### BREAKING CHANGES
* use apm-server intake/v2 (APM Server v6.5+)


### Bug Fixes

* start page load transaction immediately after init ([3b80bdb](https://github.com/elastic/apm-agent-js-base/commit/3b80bdb))
* use pageLoadTransactionName config option ([d3d3587](https://github.com/elastic/apm-agent-js-base/commit/d3d3587))
* adopt the w3c dt header flag proposal ([ff0fdfc](https://github.com/elastic/apm-agent-js-core/commit/ff0fdfc))
* don't startSpan after transaction has ended ([137bd63](https://github.com/elastic/apm-agent-js-core/commit/137bd63))
* filter out invalid spans ([c9fb0e1](https://github.com/elastic/apm-agent-js-core/commit/c9fb0e1))
* ignore apm-server xhrs ([5527cca](https://github.com/elastic/apm-agent-js-core/commit/5527cca))
* merging two spans related to fetching the initial document ([6ee4108](https://github.com/elastic/apm-agent-js-core/commit/6ee4108))
* set pageLoadTraceId on page load transacton start ([c6510ca](https://github.com/elastic/apm-agent-js-core/commit/c6510ca))
* set the sync property on xhr spans ([4283e85](https://github.com/elastic/apm-agent-js-core/commit/4283e85))
* shorten page load config options ([2550c24](https://github.com/elastic/apm-agent-js-core/commit/2550c24))
* truncate active spans on transaction end ([a28759c](https://github.com/elastic/apm-agent-js-core/commit/a28759c))
* validate DT header ([5aa1cc1](https://github.com/elastic/apm-agent-js-core/commit/5aa1cc1))


### Features

* add allowed origins for distributed tracing ([0812ff7](https://github.com/elastic/apm-agent-js-core/commit/0812ff7))
* add DT header to same origin http requests ([a60d6d9](https://github.com/elastic/apm-agent-js-core/commit/a60d6d9))
* add DT page load trace id config option ([149ebaa](https://github.com/elastic/apm-agent-js-core/commit/149ebaa))
* add pageLoadTransactionName config option ([a2644df](https://github.com/elastic/apm-agent-js-core/commit/a2644df))
* add parent_id to spans ([21934b3](https://github.com/elastic/apm-agent-js-core/commit/21934b3))
* add sampling for transactions ([8105e0c](https://github.com/elastic/apm-agent-js-core/commit/8105e0c))
* generate random ids based on DT guidelines ([8fd2581](https://github.com/elastic/apm-agent-js-core/commit/8fd2581))
* provide span_count.started ([f3effcf](https://github.com/elastic/apm-agent-js-core/commit/f3effcf))
* use correct id format for transactions and spans ([d44592e](https://github.com/elastic/apm-agent-js-core/commit/d44592e))




<a name="1.0.0"></a>
# [1.0.0](https://github.com/elastic/apm-agent-js-base/compare/v0.10.3...v1.0.0) (2018-08-23)

### BREAKING CHANGES

* use /v1/rum endpoint (APM Server v6.4+)

<a name="0.10.3"></a>
## [0.10.3](https://github.com/elastic/apm-agent-js-base/compare/v0.10.2...v0.10.3) (2018-08-20)


### Bug Fixes

* check marks are greater than fetchStart ([6d35eaa](https://github.com/elastic/apm-agent-js-core/commit/6d35eaa))


### Features

* add transactionDurationThreshold config option ([67f5c5d](https://github.com/elastic/apm-agent-js-core/commit/67f5c5d))


<a name="0.10.2"></a>
## [0.10.2](https://github.com/elastic/apm-agent-js-base/compare/v0.10.1...v0.10.2) (2018-08-16)


### Bug Fixes

* check for undefined span when the agent is not active ([3613b01](https://github.com/elastic/apm-agent-js-base/commit/3613b01))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/elastic/apm-agent-js-base/compare/v0.10.0...v0.10.1) (2018-08-14)


### Bug Fixes

* update elastic-apm-js-core to 0.8.1
* filter out transactions with zero spans


<a name="0.10.0"></a>
# [0.10.0](https://github.com/elastic/apm-agent-js-base/compare/v0.9.1...v0.10.0) (2018-08-07)


### Features

* instrument XHR ([3c6a9e5](https://github.com/elastic/apm-agent-js-base/commit/3c6a9e5))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/elastic/apm-agent-js-base/compare/v0.9.0...v0.9.1) (2018-06-22)


### Bug Fixes

* update elastic-apm-js-core to 0.7.1
* consolidate Transaction and Error contexts


<a name="0.9.0"></a>
# [0.9.0](https://github.com/elastic/apm-agent-js-base/compare/v0.8.2...v0.9.0) (2018-06-15)


### BREAKING CHANGES

* update elastic-apm-js-core to 0.7.0
* remove timestamp on error and transaction payload
* supporting apm-server 6.3

### Bug Fixes

* update span.context.http.url structure ([40d6bb2](https://github.com/elastic/apm-agent-js-core/commit/40d6bb2))


<a name="0.8.2"></a>
## [0.8.2](https://github.com/elastic/apm-agent-js-base/compare/v0.8.1...v0.8.2) (2018-06-12)


### Bug Fixes

* update elastic-apm-js-core 0.6.2 ([b3807e0](https://github.com/elastic/apm-agent-js-base/commit/b3807e0))
* remove marks before fetchStart to align with resource spans
* spans generated from navigation and resource timing apis


<a name="0.8.1"></a>
## [0.8.1](https://github.com/elastic/apm-agent-js-base/compare/v0.8.0...v0.8.1) (2018-05-28)


### Features

* add transaction custom marks API ([4d2b71b](https://github.com/elastic/apm-agent-js-base/commit/4d2b71b))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/elastic/apm-agent-js-base/compare/v0.7.0...v0.8.0) (2018-05-23)

### BREAKING CHANGES

* rename hasRouterLibrary to sendPageLoadTransaction


<a name="0.7.0"></a>
# [0.7.0](https://github.com/elastic/apm-agent-js-base/compare/v0.6.1...v0.7.0) (2018-04-30)


### Features

* exposed api initial draft ([9187726](https://github.com/elastic/apm-agent-js-base/commit/9187726))



<a name="0.6.1"></a>
## [0.6.1](https://github.com/elastic/apm-agent-js-base/compare/v0.6.0...v0.6.1) (2018-04-10)


### Bug Fixes

* update to elastic-apm-js-core 0.4.3 ([1e307ac](https://github.com/elastic/apm-agent-js-base/commit/1e307ac))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/elastic/apm-agent-js-base/compare/v0.5.0...v0.6.0) (2018-04-04)


### Features

* add addFilter api ([60e9ad5](https://github.com/elastic/apm-agent-js-base/commit/60e9ad5))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/elastic/apm-agent-js-base/compare/v0.4.1...v0.5.0) (2018-03-09)


### Features

* add apm.setTags ([523280a](https://github.com/elastic/apm-agent-js-base/commit/523280a))
* update to elastic-apm-js-core 0.3.0 ([a436334](https://github.com/elastic/apm-agent-js-base/commit/a436334))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/elastic/apm-agent-js-base/compare/v0.4.0...v0.4.1) (2018-02-20)


### Bug Fixes

* send page load metrics even after load event ([abe3680](https://github.com/elastic/apm-agent-js-base/commit/abe3680))


### Features

* upgrade to elastic-apm-js-core 0.2.2 ([c2a6469](https://github.com/elastic/apm-agent-js-base/commit/c2a6469))
  * enforce server string limit
  * set descriptive names for navigation timing spans


<a name="0.4.0"></a>
# [0.4.0](https://github.com/elastic/apm-agent-js-base/compare/v0.3.0...v0.4.0) (2018-02-07)


### Features

* Remove elastic-apm-js-zone dependency (Reducing the size of the bundle)
* Use es6-promise
* Queue Errors and Transactions before sending
* Throttle adding Errors and Transactions



<a name="0.3.0"></a>
# [0.3.0](https://github.com/elastic/apm-agent-js-base/compare/v0.2.0...v0.3.0) (2018-01-11)


### Bug Fixes

* **ApmBase:** Disable the module if running on nodejs ([2bf4199](https://github.com/elastic/apm-agent-js-base/commit/2bf4199))
* upgrade to elastic-apm-js-core 0.1.7 ([325a918](https://github.com/elastic/apm-agent-js-base/commit/325a918))


### Features

* add captureError to ApmBase ([04436b4](https://github.com/elastic/apm-agent-js-base/commit/04436b4))
* add setUserContext and setCustomContext ([86b4ccc](https://github.com/elastic/apm-agent-js-base/commit/86b4ccc))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/jahtalab/apm-agent-js-base/compare/v0.1.1...v0.2.0) (2017-12-20)


### BREAKING CHANGES

* init returns ApmServer instance instead of ServiceFactory


<a name="0.1.1"></a>
## [0.1.1](https://github.com/jahtalab/apm-agent-js-base/compare/v0.1.0...v0.1.1) (2017-12-20)


### Bug Fixes

* typo serviceUrl ([9ff81a7](https://github.com/jahtalab/apm-agent-js-base/commit/9ff81a7))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/jahtalab/apm-agent-js-base/compare/v0.0.3...v0.1.0) (2017-12-13)


### BREAKING CHANGES

* upgrading to apm-agent-js-core@0.1.0 ([150bc66](https://github.com/jahtalab/apm-agent-js-base/commit/150bc66))
* rename apiOrigin to serverUrl
* rename app to service


<a name="0.0.3"></a>
## [0.0.3](https://github.com/jahtalab/apm-agent-js-base/compare/v0.0.2...v0.0.3) (2017-11-21)



<a name="0.0.2"></a>
## 0.0.2 (2017-11-21)



