const path = require('path')
const { isChrome } = require('./test/e2e/e2e-utils')

const tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER

const browserList = [
  {
    browserName: 'chrome',
    version: '62'
  },
  {
    browserName: 'firefox',
    version: '57'
  },
  // {
  //   browserName: 'internet explorer',
  //   platform: 'Windows 10',
  //   version: '11',
  //   iedriverVersion: 'x64_2.48.0'
  // },
  {
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '17'
  },
  {
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
  },
  {
    browserName: 'android',
    platform: 'Linux',
    version: '5.0'
  }
].map(list =>
  Object.assign({}, list, {
    'tunnel-identifier': tunnelIdentifier
  })
)

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
  capabilities: browserList,
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
