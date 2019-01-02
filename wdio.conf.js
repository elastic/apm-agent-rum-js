const path = require('path')
const { isChrome } = require('./test/e2e/e2e-utils')

const tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER

exports.config = {
  specs: [path.join(__dirname, '/test/e2e/**/*.e2e-spec.js')],
  maxInstancesPerCapability: 3,
  services: ['sauce'],
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  sauceConnect: true,
  sauceConnectOpts: {
    logger: console.log,
    noSslBumpDomains: 'all',
    'tunnel-identifier': tunnelIdentifier
  },
  capabilities: [
    {
      browserName: 'chrome',
      maxInstances: 1,
      version: '62',
      'tunnel-identifier': tunnelIdentifier
    },
    {
      browserName: 'firefox',
      version: '57',
      'tunnel-identifier': tunnelIdentifier
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: '11',
      'tunnel-identifier': tunnelIdentifier
    }
  ],
  logLevel: 'silent',
  screenshotPath: path.join(__dirname, 'error-screenshot'),
  baseUrl: 'http://localhost:8000',
  waitforTimeout: 30000,
  framework: 'jasmine',
  reporters: ['dot', 'spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 90000
  },
  afterTest: function () {
    /** Log api is only available in Chrome */
    if (isChrome()) {
      browser.execute('1+1')
      var response = browser.log('browser')
      var browserLogs = response.value
      console.log('browser.log:', JSON.stringify(browserLogs, undefined, 2))
    }
  }
}
