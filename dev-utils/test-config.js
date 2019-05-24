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
const defaultApmServerUrl = 'http://localhost:8200'

function getSauceConnectOptions() {
  return {
    username: process.env.SAUCE_USERNAME,
    accessKey: process.env.SAUCE_ACCESS_KEY,
    logger: console.log,
    noSslBumpDomains: 'all',
    tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
    connectRetries: 3
  }
}

function getTestEnvironmentVariables() {
  return {
    branch: process.env.TRAVIS_BRANCH,
    mode: process.env.MODE,
    sauceLabs: process.env.MODE && process.env.MODE.startsWith('saucelabs'),
    isTravis: process.env.TRAVIS,
    serverUrl: process.env.APM_SERVER_URL || defaultApmServerUrl,
    mockBackendUrl: 'http://localhost:8003'
  }
}

function getGlobalConfig(packageName = 'rum') {
  const testEnv = getTestEnvironmentVariables()
  const globalConfigs = {
    agentConfig: {
      serverUrl: testEnv.serverUrl,
      serviceName: `test`,
      name: `${packageName}`
    },
    useMocks: false,
    mockApmServer: false
  }

  /**
   * Use this for testing locally
   */
  // if (env.sauceLabs) {
  //   globalConfigs.useMocks = true
  // }

  return {
    globalConfigs,
    testConfig: testEnv
  }
}

/**
 * Used for injecting process.env across webpack bundles for testing
 */
function getWebpackEnv(env = 'development') {
  const { serverUrl } = getTestEnvironmentVariables()
  return {
    APM_SERVER_URL: serverUrl,
    NODE_ENV: env
  }
}

function getBrowserList() {
  return [
    {
      browserName: 'chrome',
      version: '49',
      extendedDebugging: true
    },
    {
      browserName: 'chrome',
      version: '62'
    },
    {
      browserName: 'firefox',
      version: '59'
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
      version: '13'
    },
    {
      appiumVersion: '1.9.1',
      deviceName: 'android emulator',
      browserName: 'browser',
      platformVersion: '5.1',
      platformName: 'android'
    },
    {
      appiumVersion: '1.9.1',
      deviceName: 'iPhone Simulator',
      deviceOrientation: 'portrait',
      platformVersion: '11.1',
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

module.exports = {
  getSauceConnectOptions,
  getTestEnvironmentVariables,
  getGlobalConfig,
  getWebpackEnv,
  getBrowserList
}
