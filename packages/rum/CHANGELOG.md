# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.6.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.6.0...@elastic/apm-rum@5.6.1) (2020-09-29)

**Note:** Version bump only for package @elastic/apm-rum





# [5.6.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.5.0...@elastic/apm-rum@5.6.0) (2020-09-17)


### Bug Fixes

* **rum:** do not instrument frameworks when agent is inactive ([#885](https://github.com/elastic/apm-agent-rum-js/issues/885)) ([861a499](https://github.com/elastic/apm-agent-rum-js/commit/861a499b0fa6f524e590a2e8368e8e1a2bbac684))


### Features

* **rum:** add missing methods to types ([#890](https://github.com/elastic/apm-agent-rum-js/issues/890)) ([541e4aa](https://github.com/elastic/apm-agent-rum-js/commit/541e4aacc15a568673bb0189e9907ec35bd8394b))





# [5.5.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.4.0...@elastic/apm-rum@5.5.0) (2020-08-18)


### Bug Fixes

* **rum:** use logLevel config when agent is inactive ([#863](https://github.com/elastic/apm-agent-rum-js/issues/863)) ([bf524c1](https://github.com/elastic/apm-agent-rum-js/commit/bf524c1309a7a37d6406c59d802e12b4c5bc1706))
* **rum:** use noop tracer on unsupported platforms ([#872](https://github.com/elastic/apm-agent-rum-js/issues/872)) ([b9e36ec](https://github.com/elastic/apm-agent-rum-js/commit/b9e36ece17a4d0aa7b6a1cae8eb95c102765e35d))
* **rum-core:** capture xhr error states in transaction ([#873](https://github.com/elastic/apm-agent-rum-js/issues/873)) ([cc6812a](https://github.com/elastic/apm-agent-rum-js/commit/cc6812a1bfcd0bcbbd90516426b7dda148b48e09))


### Features

* **rum:** allow creating blocking spans from agent api ([#875](https://github.com/elastic/apm-agent-rum-js/issues/875)) ([50e692d](https://github.com/elastic/apm-agent-rum-js/commit/50e692daed13ed546a116e0921d639e41c0a3080))
* **rum-core:** provide api to block managed transactions  ([#866](https://github.com/elastic/apm-agent-rum-js/issues/866)) ([5829a37](https://github.com/elastic/apm-agent-rum-js/commit/5829a37c5aff886834bd3a6dce3c415314ffccb6))





# [5.4.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.3.0...@elastic/apm-rum@5.4.0) (2020-07-29)


### Features

* **rum-core:** compress payload sent to APM Server ([#572](https://github.com/elastic/apm-agent-rum-js/issues/572)) ([a8f02c6](https://github.com/elastic/apm-agent-rum-js/commit/a8f02c663e2579a3a427c7f461416d17f45b7c62))





# [5.3.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.2.1...@elastic/apm-rum@5.3.0) (2020-07-06)


### Features

* **rum:** add apiVersion config to types ([#833](https://github.com/elastic/apm-agent-rum-js/issues/833)) ([0679a71](https://github.com/elastic/apm-agent-rum-js/commit/0679a71e421251a7916d47e2128030e44cb9e334))





## [5.2.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.2.0...@elastic/apm-rum@5.2.1) (2020-06-24)

**Note:** Version bump only for package @elastic/apm-rum





# [5.2.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.1.1...@elastic/apm-rum@5.2.0) (2020-05-28)


### Bug Fixes

* **rum:** allow setting labels before initializing ([#792](https://github.com/elastic/apm-agent-rum-js/issues/792)) ([e546e35](https://github.com/elastic/apm-agent-rum-js/commit/e546e35f78eece3373efbc002c5ec4964407566f))
* **rum:** use single instance of apm across all packages ([#796](https://github.com/elastic/apm-agent-rum-js/issues/796)) ([d585324](https://github.com/elastic/apm-agent-rum-js/commit/d585324d56494684ee58005ab43e075e8267da8a))
* **rum-core:** consider user defined type of high precedence ([#798](https://github.com/elastic/apm-agent-rum-js/issues/798)) ([b1d247c](https://github.com/elastic/apm-agent-rum-js/commit/b1d247c3654978187e9491079208c18267161e98))


### Features

* add first input delay span ([#787](https://github.com/elastic/apm-agent-rum-js/issues/787)) ([af7deb9](https://github.com/elastic/apm-agent-rum-js/commit/af7deb9fbf556dac4966175eaa71ac3a63854db4))


### Performance Improvements

* refactor ServiceFactory to use constant service names ([#764](https://github.com/elastic/apm-agent-rum-js/issues/764)) ([fdda235](https://github.com/elastic/apm-agent-rum-js/commit/fdda23555b418166727d85f143e84a16079d83e6)), closes [#238](https://github.com/elastic/apm-agent-rum-js/issues/238)





## [5.1.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.1.0...@elastic/apm-rum@5.1.1) (2020-04-15)

**Note:** Version bump only for package @elastic/apm-rum





## [5.1.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@5.0.0...@elastic/apm-rum@5.1.0) (2020-04-08)


### Features

* **rum-core:** end spa navigations after browser frame ([#730](https://github.com/elastic/apm-agent-rum-js/issues/730)) ([5397fa2](https://github.com/elastic/apm-agent-rum-js/commit/5397fa22eb88c080f7a6d07ef5b89dfefc572fb3))


### Performance Improvements

* **rum-core:** random number generator using crypto.getRandomValues ([#705](https://github.com/elastic/apm-agent-rum-js/issues/705)) ([ce0db92](https://github.com/elastic/apm-agent-rum-js/commit/ce0db92d1ba057def0c81595340de4e9e59c4872))





# [5.0.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.9.1...@elastic/apm-rum@5.0.0) (2020-03-18)

**Note:** Version bump only for package @elastic/apm-rum





## [4.9.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.9.0...@elastic/apm-rum@4.9.1) (2020-03-09)


### Bug Fixes

* **rum-core:** replace >> in click transaction name with '-' ([#690](https://github.com/elastic/apm-agent-rum-js/issues/690)) ([ca43a71](https://github.com/elastic/apm-agent-rum-js/commit/ca43a7104a4820b3d880282d32c0509e4190a9d0))





# [4.9.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.8.1...@elastic/apm-rum@4.9.0) (2020-03-03)


### Bug Fixes

* **rum-core:** export browser responsiveness interval correctly ([#658](https://github.com/elastic/apm-agent-rum-js/issues/658)) ([2ecf060](https://github.com/elastic/apm-agent-rum-js/commit/2ecf060a35dd1b64110149edc5bbdd4a4613caa9))


### Features

* **rum-core:** use global promise when available and fallback ([#629](https://github.com/elastic/apm-agent-rum-js/issues/629)) ([65f08e0](https://github.com/elastic/apm-agent-rum-js/commit/65f08e06d2819a5ba76f476d9a4bc1dfd7fe788b))





## [4.8.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.8.0...@elastic/apm-rum@4.8.1) (2020-02-14)

**Note:** Version bump only for package @elastic/apm-rum





# [4.8.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.7.1...@elastic/apm-rum@4.8.0) (2020-02-13)


### Features

* capture click user-interaction transactions ([#604](https://github.com/elastic/apm-agent-rum-js/issues/604)) ([30530c1](https://github.com/elastic/apm-agent-rum-js/commit/30530c11c4b4ae46ad5fe140f1a15c1f3d240199))





## [4.7.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.7.0...@elastic/apm-rum@4.7.1) (2020-01-30)

**Note:** Version bump only for package @elastic/apm-rum





# [4.7.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.6.0...@elastic/apm-rum@4.7.0) (2020-01-15)


### Bug Fixes

* **rum:** add constructor types for ApmBase class ([#562](https://github.com/elastic/apm-agent-rum-js/issues/562)) ([273f63f](https://github.com/elastic/apm-agent-rum-js/commit/273f63fe3763c5566c45ce02755279ccc7faabb3))
* **rum:** noop for API when agent is inactive ([#569](https://github.com/elastic/apm-agent-rum-js/issues/569)) ([77d4f6d](https://github.com/elastic/apm-agent-rum-js/commit/77d4f6da20bf113bf803652fd01c8d785eea3722))


### Features

* **rum:** add typescript typings ([#537](https://github.com/elastic/apm-agent-rum-js/issues/537)) ([dc4f391](https://github.com/elastic/apm-agent-rum-js/commit/dc4f391fe228a01b7b8e640a73127257a52d5d52))
* capture http-request transactions ([#517](https://github.com/elastic/apm-agent-rum-js/issues/517)) ([27ed994](https://github.com/elastic/apm-agent-rum-js/commit/27ed994ea9866e4493015eb3817ab12266f572a5))





# [4.6.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.5.1...@elastic/apm-rum@4.6.0) (2019-11-19)


### Bug Fixes

* **rum-core:** schedule xhr invoke task as a macro task ([#480](https://github.com/elastic/apm-agent-rum-js/issues/480)) ([d4f181f](https://github.com/elastic/apm-agent-rum-js/commit/d4f181f)), closes [#390](https://github.com/elastic/apm-agent-rum-js/issues/390)


### Features

* **rum-core:** improve the debug logs with transaction details ([#469](https://github.com/elastic/apm-agent-rum-js/issues/469)) ([b9629b4](https://github.com/elastic/apm-agent-rum-js/commit/b9629b4))
* **rum-core:** use etag for fetching config ([#439](https://github.com/elastic/apm-agent-rum-js/issues/439)) ([bac0e15](https://github.com/elastic/apm-agent-rum-js/commit/bac0e15))





## [4.5.1](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.5.0...@elastic/apm-rum@4.5.1) (2019-10-09)

**Note:** Version bump only for package @elastic/apm-rum





# [4.5.0](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.4.4...@elastic/apm-rum@4.5.0) (2019-09-30)


### Bug Fixes

* **rum:** publish all packages as transpiled modules ([#432](https://github.com/elastic/apm-agent-rum-js/issues/432)) ([1f4ee87](https://github.com/elastic/apm-agent-rum-js/commit/1f4ee87))


### Features

* Introduce managed transaction option ([#440](https://github.com/elastic/apm-agent-rum-js/issues/440)) ([a08f210](https://github.com/elastic/apm-agent-rum-js/commit/a08f210))
* Support central config management ([#415](https://github.com/elastic/apm-agent-rum-js/issues/415)) ([1382cc9](https://github.com/elastic/apm-agent-rum-js/commit/1382cc9))
* **rum-core:** capture unhandled promise rejection as errors ([#427](https://github.com/elastic/apm-agent-rum-js/issues/427)) ([ef34ccc](https://github.com/elastic/apm-agent-rum-js/commit/ef34ccc))





## [4.4.4](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.4.3...@elastic/apm-rum@4.4.4) (2019-09-17)

**Note:** Version bump only for package @elastic/apm-rum





## [4.4.3](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.4.2...@elastic/apm-rum@4.4.3) (2019-09-03)


### Bug Fixes

* **rum:** log unsupported message only on browser environment ([#382](https://github.com/elastic/apm-agent-rum-js/issues/382)) ([ff759d1](https://github.com/elastic/apm-agent-rum-js/commit/ff759d1))





## [4.4.2](https://github.com/elastic/apm-agent-rum-js/compare/@elastic/apm-rum@4.4.1...@elastic/apm-rum@4.4.2) (2019-08-08)


### Bug Fixes

* **rum:** do not polyfill the global Promise variable ([#366](https://github.com/elastic/apm-agent-rum-js/issues/366)) ([f5dc95c](https://github.com/elastic/apm-agent-rum-js/commit/f5dc95c))





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
