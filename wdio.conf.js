exports.config = {
  specs: [
    './test/e2e/**/*.e2e-spec.js'
  ],
  maxInstances: 1,

  capabilities: [
    {
      maxInstances: 1,
      browserName: 'firefox',
      'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
      // args: ['--no-sandbox'],
    // before: function () {
    //   browser.timeoutsAsyncScript(10000)
    // }
    }
  ],
  // sync: false,
  logLevel: 'command',
  coloredLogs: true,
  screenshotPath: './error-screenshot/',
  baseUrl: 'http://localhost:8000',
  waitforTimeout: 30000,
  framework: 'jasmine',
  reporters: ['dot', 'spec'],
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000,
    expectationResultHandler: function (passed, assertion) {
      if (passed) {
        return
      }

      var title = assertion.message.replace(/\s/g, '-')
      browser.saveScreenshot(('./errorShots/assertionError_' + title + '.png'))
      fail()
    }
  },
  // afterCommand: function (commandName, args, result, error) {
  //   console.log('command', arguments)
  // },
  before: function () {
    // browser.timeoutsAsyncScript(30000)
    // browser.timeouts({
    //   "script": 30000
    // })

    // check if the environment contains a specific angular version
    // that we will be testing for
    // // console.log('Environment ANGULAR_VERSION: ' + process.env.ANGULAR_VERSION)
    // if (process.env.ANGULAR_VERSION) {
    //   var versionString = process.env.ANGULAR_VERSION.replace('~', '')
    //   var versionArray = versionString.split('.')
    //   var version = {
    //     major: parseInt(versionArray[0], 10),
    //     minor: parseInt(versionArray[1], 10),
    //     patch: parseInt(versionArray[2], 10),
    //     full: versionString
    //   }

    //   browser.expectedAngularVersion = version
    // } else {
    //   // otherwise we manually set the version to the latest major/minor combination
    //   browser.expectedAngularVersion = { major: 1, minor: 5, patch: 0, full: '1.5.0' }
    // }
  }
}
