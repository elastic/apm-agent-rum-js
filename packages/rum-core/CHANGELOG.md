# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
