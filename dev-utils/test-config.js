/**
 * MIT License
 *
 * Copyright (c) 2017-present, Elasticsearch BV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */
const DEFAULT_APM_SERVER_URL = 'http://localhost:8200'

function getSauceConnectOptions() {
  return {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    logger: console.log,
    noSslBumpDomains: 'all',
    tunnelIdentifier: process.env.BUILD_NUMBER,
    connectRetries: 3
  }
}

function getTestEnvironmentVariables() {
  return {
    branch: process.env.BRANCH_NAME,
    mode: process.env.MODE,
    sauceLabs: process.env.MODE && process.env.MODE.startsWith('saucelabs'),
    isCI: process.env.CI,
    serverUrl: process.env.APM_SERVER_URL || DEFAULT_APM_SERVER_URL,
    mockBackendUrl: 'http://localhost:8003',
    stackVersion: process.env.STACK_VERSION || ''
  }
}

function getGlobalConfig(packageName = 'rum') {
  const testEnv = getTestEnvironmentVariables()
  return {
    agentConfig: {
      serverUrl: testEnv.serverUrl,
      serviceName: `test`,
      name: `${packageName}`
    },
    testConfig: testEnv,
    useMocks: false,
    mockApmServer: false
  }
}

/**
 * Supported lowest and highest versions across major browser platform
 *
 * The list below is based purely on the market share distribution.
 */
function getDefaultBrowsers() {
  return [
    {
      browserName: 'chrome',
      browserVersion: '76'
    },
    {
      browserName: 'chrome',
      browserVersion: '84'
    },
    {
      browserName: 'chrome',
      browserVersion: 'latest'
    },
    {
      browserName: 'firefox',
      browserVersion: '60'
    },
    {
      browserName: 'safari',
      platformName: 'macOS 10.15',
      browserVersion: '13'
    },
    {
      browserName: 'internet explorer',
      platformName: 'Windows 10',
      browserVersion: '11'
    },
    {
      browserName: 'MicrosoftEdge',
      platformName: 'Windows 10',
      browserVersion: '17'
    }
  ]
}

/**
 * It returns the appium configuration compatible with karma-sauce-launcher
 */
function getAppiumBrowsersForKarma() {
  return [
    {
      platformName: 'Android',
      browserName: 'Browser',
      appiumVersion: '1.20.2',
      deviceName: 'Android Emulator',
      platformVersion: '5.1'
    },
    {
      platformName: 'iOS',
      browserName: 'safari',
      appiumVersion: '1.13.0',
      deviceName: 'iPhone Simulator',
      deviceOrientation: 'portrait',
      platformVersion: '12.2'
    }
  ]
}

/**
 * It returns the appium configuration compatible with @wdio/sauce-service
 */
function getAppiumBrowsersForWebdriver() {
  return [
    {
      platformName: 'Android',
      browserName: 'Browser',
      'appium:deviceName': 'Android Emulator',
      'appium:platformVersion': '5.1',
      'sauce:options': {
        appiumVersion: '1.20.2'
      }
    },
    {
      platformName: 'iOS',
      browserName: 'Safari',
      'appium:deviceName': 'iPad Simulator',
      'appium:platformVersion': '12.2',
      'sauce:options': {
        appiumVersion: '1.13.0',
        deviceOrientation: 'portrait'
      }
    }
  ]
}

function getBrowserList(pkg = 'default') {
  let browsers = []
  if (pkg === 'default') {
    browsers = getDefaultBrowsers()
  } else if (pkg === 'react') {
    // react router 6 doesn't support IE 11, we get rid of it
    // https://github.com/remix-run/react-router/issues/8220#issuecomment-961326123
    return getDefaultBrowsers().filter(
      browser => browser.browserName != 'internet explorer'
    )
  } else if (pkg === 'vue') {
    // Vue 3 dropped support for IE 11 and older browsers,
    // so we use modern browsers ro run the tests
    browsers = [
      {
        browserName: 'chrome',
        browserVersion: 'latest'
      },
      {
        browserName: 'firefox',
        // beware that if we update to 99 or more we will need to cope with https://github.com/karma-runner/karma-sauce-launcher/issues/275
        browserVersion: '98',
        platformName: 'Windows 10',
        'sauce:options': {
          geckodriverVersion: '0.30.0' // reason: https://github.com/karma-runner/karma-sauce-launcher/issues/275
        }
      }
    ]
  }

  return browsers
}

function parseVersion(version) {
  const parts = version.split('.')
  return {
    full: version,
    major: parts[0],
    minor: parts[1],
    patch: parts[2]
  }
}

function isVersionInRange(version, min) {
  let isInRange = true
  if (version) {
    let parsedVersion = parseVersion(version)
    if (min) {
      let minParsed = parseVersion(min)
      isInRange =
        isInRange &&
        parsedVersion.major >= minParsed.major &&
        parsedVersion.minor >= minParsed.minor &&
        parsedVersion.patch >= minParsed.patch
    }
  }
  return isInRange
}

module.exports = {
  getSauceConnectOptions,
  getTestEnvironmentVariables,
  getGlobalConfig,
  getBrowserList,
  getAppiumBrowsersForKarma,
  getAppiumBrowsersForWebdriver,
  parseVersion,
  isVersionInRange,
  DEFAULT_APM_SERVER_URL
}
