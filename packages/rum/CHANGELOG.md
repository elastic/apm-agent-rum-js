# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
