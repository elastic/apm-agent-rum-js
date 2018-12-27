const path = require('path')
// TODO - Run on all platforms
// const { baseLaunchers } = require('elastic-apm-js-core/dev-utils/karma')

exports.config = {
  specs: [path.join(__dirname, '/test/e2e/**/*.e2e-spec.js')],
  maxInstances: 1,
  services: ['sauce'],
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  sauceConnect: true,
  sauceConnectOpts: {
    logger: console.log,
    verbose: true,
    noSslBumpDomains: 'all',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
  },
  capabilities: [
    {
      browserName: 'chrome',
      version: '62'
    },
    {
      browserName: 'firefox',
      version: '57'
    }
    // {
    //   browserName: 'internet explorer',
    //   version: '10'
    // },
    // {
    //   browserName: 'MicrosoftEdge',
    //   platform: 'Windows 10',
    //   version: '16.16299'
    // },
    // {
    //   browserName: 'Safari',
    //   platform: 'OS X 10.11',
    //   version: '9.0'
    // }
  ],
  logLevel: 'command',
  screenshotPath: path.join(__dirname, 'error-screenshot'),
  baseUrl: 'http://localhost:8000',
  waitforTimeout: 30000,
  framework: 'jasmine',
  reporters: ['dot', 'spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 90000
  },
  afterTest: function (test) {
    /** Logs api is only available in Chrome */
    const browserName = browser.desiredCapabilities.browserName.toLowerCase()
    if (browserName.indexOf('chrome') !== -1) {
      browser.execute('1+1')
      var response = browser.log('browser')
      var browserLogs = response.value
      console.log('browser.log:', JSON.stringify(browserLogs, undefined, 2))
    }
    console.log('afterTest:', JSON.stringify(test, undefined, 2))
  }
}
