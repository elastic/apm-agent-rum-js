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
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER || process.env.BUILD_NUMBER,
    connectRetries: 3
  }
}

function getTestEnvironmentVariables() {
  return {
    branch: process.env.TRAVIS_BRANCH || process.env.BRANCH_NAME,
    mode: process.env.MODE,
    sauceLabs: process.env.MODE && process.env.MODE.startsWith('saucelabs'),
    isTravis: process.env.TRAVIS,
    isJenkins: process.env.JENKINS_URL,
    serverUrl: process.env.APM_SERVER_URL || DEFAULT_APM_SERVER_URL,
    mockBackendUrl: 'http://localhost:8003',
    stackVersion: process.env.STACK_VERSION
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
function getBrowserList() {
  return [
    {
      browserName: 'chrome',
      version: '49',
      extendedDebugging: true
    },
    {
      browserName: 'chrome',
      version: '76'
    },
    {
      browserName: 'firefox',
      version: '52'
    },
    {
      browserName: 'safari',
      platform: 'OS X 10.11',
      version: '9.0'
    },
    {
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    },
    {
      browserName: 'microsoftedge',
      platform: 'Windows 10',
      version: '17'
    },
    {
      appiumVersion: '1.9.1',
      deviceName: 'android emulator',
      browserName: 'browser',
      platformVersion: '5.1',
      platformName: 'android'
    },
    {
      appiumVersion: '1.13.0',
      deviceName: 'iPhone Simulator',
      deviceOrientation: 'portrait',
      platformVersion: '12.2',
      platformName: 'iOS',
      browserName: 'Safari'
    }
  ].map(c => ({
    ...c,
    loggingPrefs: {
      browser: 'INFO'
    }
  }))
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
  parseVersion,
  isVersionInRange,
  DEFAULT_APM_SERVER_URL
}
