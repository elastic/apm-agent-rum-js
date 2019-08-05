# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.4.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.4.0...@elastic/apm-rum@4.4.1) (2019-08-05)


### Bug Fixes

* **rum:** sync version number with latest published version ([#362](https://github.com/elastic/apm-agent-rum-js/issues/362)) ([909f480](https://github.com/elastic/apm-agent-rum-js/commit/909f480))





# [4.4.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.3.1...@elastic/apm-rum@4.4.0) (2019-08-05)


### Features

* **rum:** add instrument flag to toggle instrumentations ([#360](https://github.com/elastic/apm-agent-rum-js/issues/360)) ([b7098dd](https://github.com/elastic/apm-agent-rum-js/commit/b7098dd))





## [4.3.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.3.0...@elastic/apm-rum@4.3.1) (2019-07-25)

**Note:** Version bump only for package @elastic/apm-rum





# [4.3.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.1.2...@elastic/apm-rum@4.3.0) (2019-07-11)


### Bug Fixes

* **rum:core:** send labels via context.tags in the payload ([#316](https://github.com/elastic/apm-agent-rum-js/issues/316)) ([526c3e7](https://github.com/elastic/apm-agent-rum-js/commit/526c3e7))


# [4.2.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.1.2...@elastic/apm-rum@4.2.0) (2019-07-08)


### Features

* **rum:** better log message on invalid configuration ([#216](https://github.com/elastic/apm-agent-rum-js/issues/216)) ([b65a806](https://github.com/elastic/apm-agent-rum-js/commit/b65a806))


### Performance Improvements

* **rum:** remove debug logs on production build ([#245](https://github.com/elastic/apm-agent-rum-js/issues/245)) ([2565844](https://github.com/elastic/apm-agent-rum-js/commit/2565844))





## [4.1.2](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.1.1...@elastic/apm-rum@4.1.2) (2019-06-20)

**Note:** Version bump only for package @elastic/apm-rum





## [4.1.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.1.0...@elastic/apm-rum@4.1.1) (2019-06-12)

**Note:** Version bump only for package @elastic/apm-rum





# [4.1.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.0.2...@elastic/apm-rum@4.1.0) (2019-06-12)


### Bug Fixes

* **rum-core:** capture all spans as part of page-load transaction ([#273](https://github.com/elastic/apm-agent-rum-js/issues/273)) ([0122bf7](https://github.com/elastic/apm-agent-rum-js/commit/0122bf7))


### Features

* **rum:** deprecate addTags in favor of addLabels ([#270](https://github.com/elastic/apm-agent-rum-js/issues/270)) ([3e313d3](https://github.com/elastic/apm-agent-rum-js/commit/3e313d3))
* **rum-core:** patch history API ([#259](https://github.com/elastic/apm-agent-rum-js/issues/259)) ([be58997](https://github.com/elastic/apm-agent-rum-js/commit/be58997))





## [4.0.2](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.0.1...@elastic/apm-rum@4.0.2) (2019-05-29)


### Bug Fixes

* **rum:** return noop agent when config is inactive ([#239](https://github.com/elastic/apm-agent-rum-js/issues/239)) ([7deef2d](https://github.com/elastic/apm-agent-rum-js/commit/7deef2d))
* **rum-core:** hardcode agent name and version in service metadata ([#236](https://github.com/elastic/apm-agent-rum-js/issues/236)) ([a90337d](https://github.com/elastic/apm-agent-rum-js/commit/a90337d))


### Performance Improvements

* **rum:** move to ES6 modules to reduce bundle size ([#237](https://github.com/elastic/apm-agent-rum-js/issues/237)) ([7aa4351](https://github.com/elastic/apm-agent-rum-js/commit/7aa4351))





## [4.0.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.0.0...@elastic/apm-rum@4.0.1) (2019-03-21)


### Bug Fixes

* **rum:** keep page load transaction until load ([#224](https://github.com/elastic/apm-agent-rum-js/issues/224)) ([29afb27](https://github.com/elastic/apm-agent-rum-js/commit/29afb27))





# 4.0.0 (2019-03-11)


### Features

* **rum-core:** Add task API ([#194](https://github.com/elastic/apm-agent-rum-js/issues/194)) ([0153229](https://github.com/elastic/apm-agent-rum-js/commit/0153229))

### BREAKING CHANGES

* move IE 10 and Android 4 to unsupported list (#196) ([16f4440](https://github.com/elastic/apm-agent-rum-js/commit/16f4440)), closes [#196](https://github.com/elastic/apm-agent-rum-js/issues/196)
* Rename the final JS bundles (#202) ([68b37d](https://github.com/elastic/apm-agent-rum-js/commit/68b37d))
* resolve main field to source file (#179) ([923405](https://github.com/elastic/apm-agent-rum-js/commit/923405))
