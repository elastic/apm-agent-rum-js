# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.5.3](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.5.2...@elastic/apm-rum-core@4.5.3) (2019-09-03)

**Note:** Version bump only for package @elastic/apm-rum-core





## [4.5.2](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.5.1...@elastic/apm-rum-core@4.5.2) (2019-08-08)


### Bug Fixes

* **rum-core:** do not polyfill the global Promise variable ([#366](https://github.com/elastic/apm-agent-rum-js/issues/366)) ([f5dc95c](https://github.com/elastic/apm-agent-rum-js/commit/f5dc95c))





## [4.5.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.5.0...@elastic/apm-rum-core@4.5.1) (2019-08-05)

**Note:** Version bump only for package @elastic/apm-rum-core





# [4.5.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.4.0...@elastic/apm-rum-core@4.5.0) (2019-08-05)


### Bug Fixes

* **rum-core:** reduce transaction reusability threshold to 5 seconds ([#354](https://github.com/elastic/apm-agent-rum-js/issues/354)) ([dd32e41](https://github.com/elastic/apm-agent-rum-js/commit/dd32e41))


### Features

* **rum-core:** add event listeners for transactions ([#279](https://github.com/elastic/apm-agent-rum-js/issues/279)) ([d98f7c7](https://github.com/elastic/apm-agent-rum-js/commit/d98f7c7))
* **rum-core:** provide debug logs when transaction was discarded ([#351](https://github.com/elastic/apm-agent-rum-js/issues/351)) ([d6728d8](https://github.com/elastic/apm-agent-rum-js/commit/d6728d8))





# [4.4.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.3.0...@elastic/apm-rum-core@4.4.0) (2019-07-25)


### Bug Fixes

* **rum-core:** check ignoreTransactions config value ([#337](https://github.com/elastic/apm-agent-rum-js/issues/337)) ([aff6bc8](https://github.com/elastic/apm-agent-rum-js/commit/aff6bc8))


### Features

* **rum-core:** add size & server timing information to traces ([#206](https://github.com/elastic/apm-agent-rum-js/issues/206)) ([c743f70](https://github.com/elastic/apm-agent-rum-js/commit/c743f70))
* **rum-core:** improve error message on payload failure ([#330](https://github.com/elastic/apm-agent-rum-js/issues/330)) ([73e7015](https://github.com/elastic/apm-agent-rum-js/commit/73e7015))





# [4.3.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.1.1...@elastic/apm-rum-core@4.3.0) (2019-07-11)


### Bug Fixes

* **rum:core:** send labels via context.tags in the payload ([#316](https://github.com/elastic/apm-agent-rum-js/issues/316)) ([526c3e7](https://github.com/elastic/apm-agent-rum-js/commit/526c3e7))


# [4.2.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.1.1...@elastic/apm-rum-core@4.2.0) (2019-07-08)


### Bug Fixes

* **rum-core:** remove sensitive info from span context ([#274](https://github.com/elastic/apm-agent-rum-js/issues/274)) ([b073f7f](https://github.com/elastic/apm-agent-rum-js/commit/b073f7f))


### Features

* **rum-core:** add user timing spans to the page-load transaction ([#276](https://github.com/elastic/apm-agent-rum-js/issues/276)) ([11a62f1](https://github.com/elastic/apm-agent-rum-js/commit/11a62f1))


### Performance Improvements

* **rum-core:** check span validition before creating arbitrary spans ([#277](https://github.com/elastic/apm-agent-rum-js/issues/277)) ([dcba903](https://github.com/elastic/apm-agent-rum-js/commit/dcba903))





## [4.1.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.1.0...@elastic/apm-rum-core@4.1.1) (2019-06-20)


### Bug Fixes

* **rum-core:** avoid creating multiple transactions in startTransaction ([#296](https://github.com/elastic/apm-agent-rum-js/issues/296)) ([70c3fb4](https://github.com/elastic/apm-agent-rum-js/commit/70c3fb4))





# [4.1.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.0.2...@elastic/apm-rum-core@4.1.0) (2019-06-12)


### Bug Fixes

* **rum-core:** capture all spans as part of page-load transaction ([#273](https://github.com/elastic/apm-agent-rum-js/issues/273)) ([0122bf7](https://github.com/elastic/apm-agent-rum-js/commit/0122bf7))


### Features

* **rum:** deprecate addTags in favor of addLabels ([#270](https://github.com/elastic/apm-agent-rum-js/issues/270)) ([3e313d3](https://github.com/elastic/apm-agent-rum-js/commit/3e313d3))
* **rum-core:** patch history API ([#259](https://github.com/elastic/apm-agent-rum-js/issues/259)) ([be58997](https://github.com/elastic/apm-agent-rum-js/commit/be58997))
* **rum-core:** use error event instead of global onerror method ([#281](https://github.com/elastic/apm-agent-rum-js/issues/281)) ([ef61121](https://github.com/elastic/apm-agent-rum-js/commit/ef61121))


### Performance Improvements

* **rum-core:** refactor transaction & stack service to improve bundlesize ([#233](https://github.com/elastic/apm-agent-rum-js/issues/233)) ([f2b2562](https://github.com/elastic/apm-agent-rum-js/commit/f2b2562))





## [4.0.2](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.0.1...@elastic/apm-rum-core@4.0.2) (2019-05-29)


### Bug Fixes

* **rum:** return noop agent when config is inactive ([#239](https://github.com/elastic/apm-agent-rum-js/issues/239)) ([7deef2d](https://github.com/elastic/apm-agent-rum-js/commit/7deef2d))
* **rum-core:** apply truncation on keyword fields in payload ([#241](https://github.com/elastic/apm-agent-rum-js/issues/241)) ([8a3927b](https://github.com/elastic/apm-agent-rum-js/commit/8a3927b))
* **rum-core:** hardcode agent name and version in service metadata ([#236](https://github.com/elastic/apm-agent-rum-js/issues/236)) ([a90337d](https://github.com/elastic/apm-agent-rum-js/commit/a90337d))
* **rum-core:** in truncate check for empty values ([#256](https://github.com/elastic/apm-agent-rum-js/issues/256)) ([cccb172](https://github.com/elastic/apm-agent-rum-js/commit/cccb172))


### Performance Improvements

* **rum:** move to ES6 modules to reduce bundle size ([#237](https://github.com/elastic/apm-agent-rum-js/issues/237)) ([7aa4351](https://github.com/elastic/apm-agent-rum-js/commit/7aa4351))





## [4.0.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum-core@4.0.0...@elastic/apm-rum-core@4.0.1) (2019-03-21)


### Bug Fixes

* **rum-core:** fix custom marks for page-load ([#225](https://github.com/elastic/apm-agent-rum-js/issues/225)) ([6cd392a](https://github.com/elastic/apm-agent-rum-js/commit/6cd392a)), closes [#221](https://github.com/elastic/apm-agent-rum-js/issues/221)





# 4.0.0 (2019-03-11)


### Features

* **rum-core:** add service env to metadata payload ([#198](https://github.com/elastic/apm-agent-rum-js/issues/198)) ([adc038b](https://github.com/elastic/apm-agent-rum-js/commit/adc038b))
* **rum-core:** Add task API ([#194](https://github.com/elastic/apm-agent-rum-js/issues/194)) ([0153229](https://github.com/elastic/apm-agent-rum-js/commit/0153229))
* **rum-core:** measure all resource entries in page load ([#173](https://github.com/elastic/apm-agent-rum-js/issues/173)) ([7cd4e0d](https://github.com/elastic/apm-agent-rum-js/commit/7cd4e0d))


### Performance Improvements

* **rum-core:** avoid url parsing on resource timing entries ([#174](https://github.com/elastic/apm-agent-rum-js/issues/174)) ([54ea6b9](https://github.com/elastic/apm-agent-rum-js/commit/54ea6b9))


### BREAKING CHANGES

* move IE 10 and Android 4 to unsupported list (#196) ([16f4440](https://github.com/elastic/apm-agent-rum-js/commit/16f4440)), closes [#196](https://github.com/elastic/apm-agent-rum-js/issues/196)
