# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 4.6.0 (2019-11-19)

### Bug Fixes

* **rum-core:** Improve capturing multiple XHRs, by scheduling macro tasks ([#480](https://github.com/elastic/apm-agent-rum-js/issues/480)) ([d4f181f](https://github.com/elastic/apm-agent-rum-js/commit/d4f181f)), closes [#390](https://github.com/elastic/apm-agent-rum-js/issues/390)
* **rum-core:** Ensure context metadata is shallow merged on transaction ([#453](https://github.com/elastic/apm-agent-rum-js/issues/453)) ([30b954e](https://github.com/elastic/apm-agent-rum-js/commit/30b954e))


### Features

* **rum-core:** Improve the debug logs with transaction details ([#469](https://github.com/elastic/apm-agent-rum-js/issues/469)) ([b9629b4](https://github.com/elastic/apm-agent-rum-js/commit/b9629b4))
* **rum-core:** First draft of central configuration management (Alpha) ([#439](https://github.com/elastic/apm-agent-rum-js/issues/439)) ([bac0e15](https://github.com/elastic/apm-agent-rum-js/commit/bac0e15))
* **rum-core:** Add breakdowns based on navigation timing ([#464](https://github.com/elastic/apm-agent-rum-js/issues/464)) ([61ed16b](https://github.com/elastic/apm-agent-rum-js/commit/61ed16b))
* **rum-core:** Copy transaction context info to error ([#458](https://github.com/elastic/apm-agent-rum-js/issues/458)) ([fa81fb7](https://github.com/elastic/apm-agent-rum-js/commit/fa81fb7))
* **rum-vue:** Vue router integration with rum agent ([#460](https://github.com/elastic/apm-agent-rum-js/issues/460)) ([228e157](https://github.com/elastic/apm-agent-rum-js/commit/228e157))



# 4.5.1 (2019-10-09)

### Bug Fixes

* Handle relative urls without slash properly ([#446](https://github.com/elastic/apm-agent-rum-js/issues/446)) ([288e8b1](https://github.com/elastic/apm-agent-rum-js/commit/288e8b1))
* Use explicit angular injection for service ([#449](https://github.com/elastic/apm-agent-rum-js/issues/449)) ([b88356f](https://github.com/elastic/apm-agent-rum-js/commit/b88356f))


# 4.5.0 (2019-09-30)

### Bug Fixes

* Publish all packages as transpiled modules ([#432](https://github.com/elastic/apm-agent-rum-js/issues/432)) ([1f4ee87](https://github.com/elastic/apm-agent-rum-js/commit/1f4ee87))


### Features

* Introduce managed transaction option ([#440](https://github.com/elastic/apm-agent-rum-js/issues/440)) ([a08f210](https://github.com/elastic/apm-agent-rum-js/commit/a08f210))
* Capture unhandled promise rejection as errors ([#427](https://github.com/elastic/apm-agent-rum-js/issues/427)) ([ef34ccc](https://github.com/elastic/apm-agent-rum-js/commit/ef34ccc))
* Capture resource and user timing spans for soft navigation ([#423](https://github.com/elastic/apm-agent-rum-js/issues/423)) ([d461ae5](https://github.com/elastic/apm-agent-rum-js/commit/d461ae5))
* Support central config management (pre-alpha) ([#415](https://github.com/elastic/apm-agent-rum-js/issues/415)) ([1382cc9](https://github.com/elastic/apm-agent-rum-js/commit/1382cc9))
* Breakdown graphs for transaction (pre-alpha) ([#412](https://github.com/elastic/apm-agent-rum-js/issues/412)) ([28df070](https://github.com/elastic/apm-agent-rum-js/commit/28df070))

# 4.4.4 (2019-09-17)

### Bug Fixes

* **rum-core:** handle script error events properly ([#418](https://github.com/elastic/apm-agent-rum-js/issues/418)) ([c862ab7](https://github.com/elastic/apm-agent-rum-js/commit/c862ab7))
* **rum-angular:** proper transaction name for lazy loaded routes ([#414](https://github.com/elastic/apm-agent-rum-js/issues/414)) ([4c6d120](https://github.com/elastic/apm-agent-rum-js/commit/4c6d120))
* **rum-react:** create transaction only on component mount ([#419](https://github.com/elastic/apm-agent-rum-js/issues/419)) ([a290448](https://github.com/elastic/apm-agent-rum-js/commit/a290448))



# 4.4.3 (2019-09-03)


### Bug Fixes

* **rum:** log unsupported message only on browser environment ([#382](https://github.com/elastic/apm-agent-rum-js/issues/382)) ([ff759d1](https://github.com/elastic/apm-agent-rum-js/commit/ff759d1))
* **rum-react:** respect active flag in react integration ([#392](https://github.com/elastic/apm-agent-rum-js/issues/392)) ([6d7e9db](https://github.com/elastic/apm-agent-rum-js/commit/6d7e9db))


### Features

* **rum-angular:** angular integration with apm-rum ([#384](https://github.com/elastic/apm-agent-rum-js/issues/384)) ([6ab2450](https://github.com/elastic/apm-agent-rum-js/commit/6ab2450))

# 4.4.2 (2019-08-08)


### Bug Fixes

* **rum:** do not polyfill the global Promise variable ([#366](https://github.com/elastic/apm-agent-rum-js/issues/366)) ([f5dc95c](https://github.com/elastic/apm-agent-rum-js/commit/f5dc95c))


# 4.4.1 (2019-08-05)

### Bug Fixes

* **rum:** sync version number with latest published version ([#362](https://github.com/elastic/apm-agent-rum-js/issues/362)) ([909f480](https://github.com/elastic/apm-agent-rum-js/commit/909f480))


# 4.4.0 (2019-08-05)

### Bug Fixes

* **rum-core:** reduce transaction reusability threshold to 5 seconds ([#354](https://github.com/elastic/apm-agent-rum-js/issues/354)) ([dd32e41](https://github.com/elastic/apm-agent-rum-js/commit/dd32e41))
* **rum-react:** capture network requests inside useEffect hook ([#353](https://github.com/elastic/apm-agent-rum-js/issues/353)) ([ae25200](https://github.com/elastic/apm-agent-rum-js/commit/ae25200))

### Features

* **rum:** add instrument flag to toggle instrumentations ([#360](https://github.com/elastic/apm-agent-rum-js/issues/360)) ([b7098dd](https://github.com/elastic/apm-agent-rum-js/commit/b7098dd))
* **rum-core:** add event listeners for transactions ([#279](https://github.com/elastic/apm-agent-rum-js/issues/279)) ([d98f7c7](https://github.com/elastic/apm-agent-rum-js/commit/d98f7c7))
* **rum-core:** provide debug logs when transaction was discarded ([#351](https://github.com/elastic/apm-agent-rum-js/issues/351)) ([d6728d8](https://github.com/elastic/apm-agent-rum-js/com)
* **rum-react:** publish transpiled react elements as es modules ([#356](https://github.com/elastic/apm-agent-rum-js/issues/356)) ([7c651c7](https://github.com/elastic/apm-agent-rum-js/commit/7c651c7))


# 4.3.1 (2019-07-25)

### Bug Fixes

* **rum-core:** check ignoreTransactions config value ([#337](https://github.com/elastic/apm-agent-rum-js/issues/337)) ([aff6bc8](https://github.com/elastic/apm-agent-rum-js/commit/aff6bc8))
* **rum-react:** check component in withTransaction ([#328](https://github.com/elastic/apm-agent-rum-js/issues/328)) ([e348874](https://github.com/elastic/apm-agent-rum-js/commit/e348874))
* **rum-react:** render the correct component when using ApmRoute with Switch ([#342](https://github.com/elastic/apm-agent-rum-js/issues/342)) ([0b3f0a0](https://github.com/elastic/apm-agent-rum-js/commit/0b3f0a0))

### Features

* **rum-core:** add size & server timing information to traces ([#206](https://github.com/elastic/apm-agent-rum-js/issues/206)) ([c743f70](https://github.com/elastic/apm-agent-rum-js/commit/c743f70))
* **rum-core:** improve error message on payload failure ([#330](https://github.com/elastic/apm-agent-rum-js/issues/330)) ([73e7015](https://github.com/elastic/apm-agent-rum-js/commit/73e7015))


# 4.3.0 (2019-07-11)

### Bug Fixes

* **rum:core:** send labels via context.tags in the payload ([#316](https://github.com/elastic/apm-agent-rum-js/issues/316)) ([526c3e7](https://github.com/elastic/apm-agent-rum-js/commit/526c3e7))


### Features

* Initial react integration ([#265](https://github.com/elastic/apm-agent-rum-js/issues/265)) ([83cbebd](https://github.com/elastic/apm-agent-rum-js/commit/83cbebd))


# 4.2.0 (2019-07-08)


### Bug Fixes

* **rum-core:** remove sensitive info from span context ([#274](https://github.com/elastic/apm-agent-rum-js/issues/274)) ([b073f7f](https://github.com/elastic/apm-agent-rum-js/commit/b073f7f))


### Features

* **rum:** better log message on invalid configuration ([#216](https://github.com/elastic/apm-agent-rum-js/issues/216)) ([b65a806](https://github.com/elastic/apm-agent-rum-js/commit/b65a806))
* **rum-core:** add user timing spans to the page-load transaction ([#276](https://github.com/elastic/apm-agent-rum-js/issues/276)) ([11a62f1](https://github.com/elastic/apm-agent-rum-js/commit/11a62f1))


### Performance Improvements

* **rum:** remove debug logs on production build ([#245](https://github.com/elastic/apm-agent-rum-js/issues/245)) ([2565844](https://github.com/elastic/apm-agent-rum-js/commit/2565844))
* **rum-core:** check span validition before creating arbitrary spans ([#277](https://github.com/elastic/apm-agent-rum-js/issues/277)) ([dcba903](https://github.com/elastic/apm-agent-rum-js/commit/dcba903))


# 4.1.2 (2019-06-20)


## Bug Fixes

* **rum-core:** avoid creating multiple transactions in startTransaction ([#296](https://github.com/elastic/apm-agent-rum-js/issues/296)) ([70c3fb4](https://github.com/elastic/apm-agent-rum-js/commit/70c3fb4))



# 4.1.1 (2019-06-12)
## Bug Fixes

* **rum:** Fix the agent version in the bundles


# 4.1.0 (2019-06-12)
## Bug Fixes

* **rum-core:** capture all spans as part of page-load transaction ([#273](https://github.com/elastic/apm-agent-rum-js/issues/273)) ([0122bf7](https://github.com/elastic/apm-agent-rum-js/commit/0122bf7))


## Features

* **rum:** deprecate addTags in favor of addLabels ([#270](https://github.com/elastic/apm-agent-rum-js/issues/270)) ([3e313d3](https://github.com/elastic/apm-agent-rum-js/commit/3e313d3))
* **rum-core:** patch history API ([#259](https://github.com/elastic/apm-agent-rum-js/issues/259)) ([be58997](https://github.com/elastic/apm-agent-rum-js/commit/be58997))
* **rum-core:** use error event instead of global onerror method ([#281](https://github.com/elastic/apm-agent-rum-js/issues/281)) ([ef61121](https://github.com/elastic/apm-agent-rum-js/commit/ef61121))


### Performance Improvements

* **rum-core:** refactor transaction & stack service to improve bundlesize ([#233](https://github.com/elastic/apm-agent-rum-js/issues/233)) ([f2b2562](https://github.com/elastic/apm-agent-rum-js/commit/f2b2562))


# 4.0.2 (2019-05-29)
## Bug Fixes

* **rum:** return noop agent when config is inactive ([#239](https://github.com/elastic/apm-agent-rum-js/issues/239)) ([7deef2d](https://github.com/elastic/apm-agent-rum-js/commit/7deef2d))
* **rum-core:** apply truncation on keyword fields in payload ([#241](https://github.com/elastic/apm-agent-rum-js/issues/241)) ([8a3927b](https://github.com/elastic/apm-agent-rum-js/commit/8a3927b))
* **rum-core:** hardcode agent name and version in service metadata ([#236](https://github.com/elastic/apm-agent-rum-js/issues/236)) ([a90337d](https://github.com/elastic/apm-agent-rum-js/commit/a90337d))
* **rum-core:** in truncate check for empty values ([#256](https://github.com/elastic/apm-agent-rum-js/issues/256)) ([cccb172](https://github.com/elastic/apm-agent-rum-js/commit/cccb172))

## Performance Improvements

* **rum:** move to ES6 modules to reduce bundle size ([#237](https://github.com/elastic/apm-agent-rum-js/issues/237)) ([7aa4351](https://github.com/elastic/apm-agent-rum-js/commit/7aa4351))




# 4.0.1 (2019-03-21)

### Bug Fixes

* **rum-core:** fix custom marks for page-load ([#225](https://github.com/elastic/apm-agent-rum-js/issues/225)) ([6cd392a](https://github.com/elastic/apm-agent-rum-js/commit/6cd392a)), closes [#221](https://github.com/elastic/apm-agent-rum-js/issues/221)
* **rum:** keep page load transaction until load ([#224](https://github.com/elastic/apm-agent-rum-js/issues/224)) ([29afb27](https://github.com/elastic/apm-agent-rum-js/commit/29afb27))


# 4.0.0 (2019-03-11)

### Features

* **rum-core:** add service env to metadata payload ([#198](https://github.com/elastic/apm-agent-rum-js/issues/198)) ([adc038b](https://github.com/elastic/apm-agent-rum-js/commit/adc038b))
* **rum-core:** Add task API ([#194](https://github.com/elastic/apm-agent-rum-js/issues/194)) ([0153229](https://github.com/elastic/apm-agent-rum-js/commit/0153229))
* **rum-core:** measure all resource entries in page load ([#173](https://github.com/elastic/apm-agent-rum-js/issues/173)) ([7cd4e0d](https://github.com/elastic/apm-agent-rum-js/commit/7cd4e0d))


### Performance Improvements

* **rum-core:** avoid url parsing on resource timing entries ([#174](https://github.com/elastic/apm-agent-rum-js/issues/174)) ([54ea6b9](https://github.com/elastic/apm-agent-rum-js/commit/54ea6b9))


### BREAKING CHANGES

* move IE 10 and Android 4 to unsupported list (#196) ([16f4440](https://github.com/elastic/apm-agent-rum-js/commit/16f4440)), closes [#196](https://github.com/elastic/apm-agent-rum-js/issues/196)
* Rename the final JS bundles (#202) ([68b37d](https://github.com/elastic/apm-agent-rum-js/commit/68b37d))
* resolve main field to source file (#179) ([923405](https://github.com/elastic/apm-agent-rum-js/commit/923405))

<a name="3.0.0"></a>
# [3.0.0](https://github.com/elastic/apm-agent-rum-js/compare/v2.3.0...v3.0.0) (2019-01-29)

### BREAKING CHANGE

* remove setTags in favor of addTags API ([#28](https://github.com/elastic/apm-agent-js-core/issues/28))
* introduce subtype and action in Spans ([#9](https://github.com/elastic/apm-agent-js-core/issues/9)) ([5fd4af7](https://github.com/elastic/apm-agent-js-core/commit/5fd4af7))


### Features

* add OpenTracing support ([#138](https://github.com/elastic/apm-agent-rum-js/issues/138)) ([0cff389](https://github.com/elastic/apm-agent-rum-js/commit/0cff389))
* include transaction flags on error ([#29](https://github.com/elastic/apm-agent-js-core/issues/29)) ([36c13f3](https://github.com/elastic/apm-agent-js-core/commit/36c13f3))
* send span sync field to apm server ([#17](https://github.com/elastic/apm-agent-js-core/issues/17)) ([abad58b](https://github.com/elastic/apm-agent-js-core/commit/abad58b))
* add addContext and addTags to Spans and Transactions ([#16](https://github.com/elastic/apm-agent-js-core/issues/16)) ([de0d72b](https://github.com/elastic/apm-agent-js-core/commit/de0d72b))
* add paint timing mark to page-load transaction ([#14](https://github.com/elastic/apm-agent-js-core/issues/14)) ([544530a](https://github.com/elastic/apm-agent-js-core/commit/544530a))


### Bug Fixes

* propagate transaction ID for unsampled transactions ([#30](https://github.com/elastic/apm-agent-js-core/issues/30)) ([3884806](https://github.com/elastic/apm-agent-js-core/commit/3884806))
* remove invalid chars in span tags and marks ([#34](https://github.com/elastic/apm-agent-js-core/issues/34)) ([9bdc575](https://github.com/elastic/apm-agent-js-core/commit/9bdc575))
* Bundling -  moving to webpack 4 and babel 7 ([#123](https://github.com/elastic/apm-agent-rum-js/issues/123)) ([0ae3f53](https://github.com/elastic/apm-agent-rum-js/commit/0ae3f53))
* remove query strings from xhr and fetch span name ([#24](https://github.com/elastic/apm-agent-js-core/issues/24)) ([cc82e92](https://github.com/elastic/apm-agent-js-core/commit/cc82e92))
* set pageLoadTransactionName when transaction ends from configs ([#25](https://github.com/elastic/apm-agent-js-core/issues/25)) ([afdacee](https://github.com/elastic/apm-agent-js-core/commit/afdacee))



### Performance Improvements

* introduce minimal url parser to reduce bundle size ([#32](https://github.com/elastic/apm-agent-js-core/issues/32)) ([2000ee2](https://github.com/elastic/apm-agent-js-core/commit/2000ee2))


<a name="2.2.0"></a>
# [2.2.0](https://github.com/elastic/apm-agent-rum-js/compare/v2.1.1...v2.2.0) (2018-12-05)


### Features

* introduce subtype and action in Spans ([#9](https://github.com/elastic/apm-agent-js-core/issues/9)) ([5fd4af7](https://github.com/elastic/apm-agent-js-core/commit/5fd4af7))


<a name="2.1.1"></a>
## [2.1.1](https://github.com/elastic/apm-agent-rum-js/compare/v2.1.0...v2.1.1) (2018-12-05)


### Bug Fixes

* use dist package for url-parse to avoid packaging issues ([#10](https://github.com/elastic/apm-agent-js-core/issues/10)) ([9018a8d](https://github.com/elastic/apm-agent-js-core/commit/9018a8d))


### Features

* introduce subtype and action in Spans ([#9](https://github.com/elastic/apm-agent-js-core/issues/9)) ([5fd4af7](https://github.com/elastic/apm-agent-js-core/commit/5fd4af7))


<a name="2.1.0"></a>
# [2.1.0](https://github.com/elastic/apm-agent-rum-js/compare/v2.0.0...v2.1.0) (2018-12-03)


### Features

* instrument fetch API ([2375a60](https://github.com/elastic/apm-agent-js-core/commit/2375a60))


<a name="2.0.0"></a>
# [2.0.0](https://github.com/elastic/apm-agent-rum-js/compare/v1.0.0...v2.0.0) (2018-11-14)



### BREAKING CHANGES
* use apm-server intake/v2 (APM Server v6.5+)


### Bug Fixes

* start page load transaction immediately after init ([3b80bdb](https://github.com/elastic/apm-agent-rum-js/commit/3b80bdb))
* use pageLoadTransactionName config option ([d3d3587](https://github.com/elastic/apm-agent-rum-js/commit/d3d3587))
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
# [1.0.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.10.3...v1.0.0) (2018-08-23)

### BREAKING CHANGES

* use /v1/rum endpoint (APM Server v6.4+)

<a name="0.10.3"></a>
## [0.10.3](https://github.com/elastic/apm-agent-rum-js/compare/v0.10.2...v0.10.3) (2018-08-20)


### Bug Fixes

* check marks are greater than fetchStart ([6d35eaa](https://github.com/elastic/apm-agent-js-core/commit/6d35eaa))


### Features

* add transactionDurationThreshold config option ([67f5c5d](https://github.com/elastic/apm-agent-js-core/commit/67f5c5d))


<a name="0.10.2"></a>
## [0.10.2](https://github.com/elastic/apm-agent-rum-js/compare/v0.10.1...v0.10.2) (2018-08-16)


### Bug Fixes

* check for undefined span when the agent is not active ([3613b01](https://github.com/elastic/apm-agent-rum-js/commit/3613b01))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/elastic/apm-agent-rum-js/compare/v0.10.0...v0.10.1) (2018-08-14)


### Bug Fixes

* update elastic-apm-js-core to 0.8.1
* filter out transactions with zero spans


<a name="0.10.0"></a>
# [0.10.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.9.1...v0.10.0) (2018-08-07)


### Features

* instrument XHR ([3c6a9e5](https://github.com/elastic/apm-agent-rum-js/commit/3c6a9e5))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/elastic/apm-agent-rum-js/compare/v0.9.0...v0.9.1) (2018-06-22)


### Bug Fixes

* update elastic-apm-js-core to 0.7.1
* consolidate Transaction and Error contexts


<a name="0.9.0"></a>
# [0.9.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.8.2...v0.9.0) (2018-06-15)


### BREAKING CHANGES

* update elastic-apm-js-core to 0.7.0
* remove timestamp on error and transaction payload
* supporting apm-server 6.3

### Bug Fixes

* update span.context.http.url structure ([40d6bb2](https://github.com/elastic/apm-agent-js-core/commit/40d6bb2))


<a name="0.8.2"></a>
## [0.8.2](https://github.com/elastic/apm-agent-rum-js/compare/v0.8.1...v0.8.2) (2018-06-12)


### Bug Fixes

* update elastic-apm-js-core 0.6.2 ([b3807e0](https://github.com/elastic/apm-agent-rum-js/commit/b3807e0))
* remove marks before fetchStart to align with resource spans
* spans generated from navigation and resource timing apis


<a name="0.8.1"></a>
## [0.8.1](https://github.com/elastic/apm-agent-rum-js/compare/v0.8.0...v0.8.1) (2018-05-28)


### Features

* add transaction custom marks API ([4d2b71b](https://github.com/elastic/apm-agent-rum-js/commit/4d2b71b))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.7.0...v0.8.0) (2018-05-23)

### BREAKING CHANGES

* rename hasRouterLibrary to sendPageLoadTransaction


<a name="0.7.0"></a>
# [0.7.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.6.1...v0.7.0) (2018-04-30)


### Features

* exposed api initial draft ([9187726](https://github.com/elastic/apm-agent-rum-js/commit/9187726))



<a name="0.6.1"></a>
## [0.6.1](https://github.com/elastic/apm-agent-rum-js/compare/v0.6.0...v0.6.1) (2018-04-10)


### Bug Fixes

* update to elastic-apm-js-core 0.4.3 ([1e307ac](https://github.com/elastic/apm-agent-rum-js/commit/1e307ac))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.5.0...v0.6.0) (2018-04-04)


### Features

* add addFilter api ([60e9ad5](https://github.com/elastic/apm-agent-rum-js/commit/60e9ad5))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.4.1...v0.5.0) (2018-03-09)


### Features

* add apm.setTags ([523280a](https://github.com/elastic/apm-agent-rum-js/commit/523280a))
* update to elastic-apm-js-core 0.3.0 ([a436334](https://github.com/elastic/apm-agent-rum-js/commit/a436334))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/elastic/apm-agent-rum-js/compare/v0.4.0...v0.4.1) (2018-02-20)


### Bug Fixes

* send page load metrics even after load event ([abe3680](https://github.com/elastic/apm-agent-rum-js/commit/abe3680))


### Features

* upgrade to elastic-apm-js-core 0.2.2 ([c2a6469](https://github.com/elastic/apm-agent-rum-js/commit/c2a6469))
  * enforce server string limit
  * set descriptive names for navigation timing spans


<a name="0.4.0"></a>
# [0.4.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.3.0...v0.4.0) (2018-02-07)


### Features

* Remove elastic-apm-js-zone dependency (Reducing the size of the bundle)
* Use es6-promise
* Queue Errors and Transactions before sending
* Throttle adding Errors and Transactions



<a name="0.3.0"></a>
# [0.3.0](https://github.com/elastic/apm-agent-rum-js/compare/v0.2.0...v0.3.0) (2018-01-11)


### Bug Fixes

* **ApmBase:** Disable the module if running on nodejs ([2bf4199](https://github.com/elastic/apm-agent-rum-js/commit/2bf4199))
* upgrade to elastic-apm-js-core 0.1.7 ([325a918](https://github.com/elastic/apm-agent-rum-js/commit/325a918))


### Features

* add captureError to ApmBase ([04436b4](https://github.com/elastic/apm-agent-rum-js/commit/04436b4))
* add setUserContext and setCustomContext ([86b4ccc](https://github.com/elastic/apm-agent-rum-js/commit/86b4ccc))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/jahtalab/apm-agent-rum-js/compare/v0.1.1...v0.2.0) (2017-12-20)


### BREAKING CHANGES

* init returns ApmServer instance instead of ServiceFactory


<a name="0.1.1"></a>
## [0.1.1](https://github.com/jahtalab/apm-agent-rum-js/compare/v0.1.0...v0.1.1) (2017-12-20)


### Bug Fixes

* typo serviceUrl ([9ff81a7](https://github.com/jahtalab/apm-agent-rum-js/commit/9ff81a7))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/jahtalab/apm-agent-rum-js/compare/v0.0.3...v0.1.0) (2017-12-13)


### BREAKING CHANGES

* upgrading to apm-agent-js-core@0.1.0 ([150bc66](https://github.com/jahtalab/apm-agent-rum-js/commit/150bc66))
* rename apiOrigin to serverUrl
* rename app to service


<a name="0.0.3"></a>
## [0.0.3](https://github.com/jahtalab/apm-agent-rum-js/compare/v0.0.2...v0.0.3) (2017-11-21)



<a name="0.0.2"></a>
## 0.0.2 (2017-11-21)



