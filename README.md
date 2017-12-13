# Elastic APM JavaScript base agent (Alpha)

[![Build status](https://travis-ci.org/elastic/apm-agent-js-base.svg?branch=master)](https://travis-ci.org/elastic/apm-agent-js-base)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/elastic-apm-base.svg)](https://saucelabs.com/u/elastic-apm-base)
<br><sup>Cross Browser testing is provided by [Sauce Labs](https://saucelabs.com/)</sup>

**Warning: This project is currently in alpha. Use it at your own risk.**

This is the official JavaScript agent for Frontend applications.

## Quick start

Install elastic-apm-js-base: `npm i -S elastic-apm-js-base`

Initialize APM:

```javascript
import { init as initApm } from 'elastic-apm-js-base'

initApm({
  serviceUrl: 'http://localhost:8200', // Set to apm-server host address
  serviceName: 'service-name' // Choose an service name
})

```


Use `window.elasticApm.setInitialPageLoadName('page name')` to set the current page name. (Call this method before 'load' event fires)