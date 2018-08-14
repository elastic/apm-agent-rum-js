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



