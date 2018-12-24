const path = require('path')

exports.config = {
  specs: [path.join(__dirname, '/test/e2e/**/*.e2e-spec.js')],
  maxInstances: 1,
  services: ['sauce'],
  user: process.env.SAUCE_USERNAME,
  key: process.env.SAUCE_ACCESS_KEY,
  sauceConnect: true,
  sauceConnectOpts: {
    logger: console.log,
    noSslBumpDomains: 'all',
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
  },
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'chrome',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER
    }
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
    browser.execute('1+1')
    var response = browser.log('browser')
    var browserLogs = response.value
    console.log('afterTest:', JSON.stringify(test, undefined, 2))
    console.log('browser.log:', JSON.stringify(browserLogs, undefined, 2))
  }
}
