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

var path = require('path')
var fs = require('fs')
var karmaUtils = require('./karma')
var saucelabsUtils = require('./saucelabs')

function runKarma (configFile) {
  function karmaCallback (exitCode) {
    if (exitCode) {
      return process.exit(exitCode)
    } else {
      console.log('Karma finished.')
      return process.exit(0)
    }
  }
  karmaUtils.singleRunKarma(configFile, karmaCallback)
}

function runUnitTests (testConfig) {
  if (testConfig.sauceLabs) {
    saucelabsUtils.launchSauceConnect(
      testConfig.sauceLabs,
      runKarma.bind(this, testConfig.karmaConfigFile)
    )
  } else {
    runKarma(testConfig.karmaConfigFile)
  }
}

function getTestEnvironmentVariables () {
  var envVars = {
    branch: process.env.TRAVIS_BRANCH,
    mode: process.env.MODE,
    sauceLabs: process.env.MODE && process.env.MODE.startsWith('saucelabs'),
    isTravis: process.env.TRAVIS,
    serverUrl: process.env.APM_SERVER_URL
  }
  if (envVars.sauceLabs) {
    envVars.sauceLabs = {
      username: process.env.SAUCE_USERNAME,
      accessKey: process.env.SAUCE_ACCESS_KEY
    }
  }
  return envVars
}

var walkSync = function (dir, filter, filelist) {
  var files = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach(function (file) {
    var filename = path.join(dir, file)
    var stat = fs.statSync(filename)
    if (stat.isDirectory()) {
      filelist = walkSync(filename, filter, filelist)
    } else {
      if (typeof filter.test === 'function') {
        if (filter.test(filename)) {
          filelist.push(filename)
        }
      } else {
        filelist.push(filename)
      }
    }
  })
  return filelist
}

function buildE2eBundles (basePath, callback) {
  var cb =
    callback ||
    function (err) {
      if (err) {
        var exitCode = 2
        process.exit(exitCode)
      }
    }

  var webpack = require('webpack')
  var fileList = walkSync(basePath, /webpack\.config\.js$/)
  fileList = fileList.map(function (file) {
    return path.relative(__dirname, file)
  })
  var configs = fileList
    .map(f => {
      return require(f)
    })
    .reduce((acc, cfg) => {
      if (cfg.length) {
        return acc.concat(cfg)
      } else {
        acc.push(cfg)
        return acc
      }
    }, [])

  console.log('Config Files: \n', fileList.join('\n'))
  webpack(configs, (err, stats) => {
    if (err) {
      console.log(err)
      cb(err)
    }
    if (stats.hasErrors()) console.log('There were errors while building')

    var jsonStats = stats.toJson()
    console.log(stats.toString())
    if (jsonStats.errors.length > 0) {
      jsonStats.errors.forEach(function (error) {
        console.log('Error:', error)
      })
      cb(jsonStats.errors)
    } else {
      cb()
    }
  })
}

function onExit (callback) {
  function exitHandler (err) {
    try {
      callback(err)
    } finally {
      if (err) console.log(err)
    }
  }

  process.on('exit', exitHandler)

  process.on('SIGINT', exitHandler)

  process.on('uncaughtException', exitHandler)
}

function startSelenium (callback, manualStop) {
  callback = callback || function () {}
  var selenium = require('selenium-standalone')
  var drivers = {
    chrome: {
      version: '2.38',
      arch: process.arch,
      baseURL: 'https://chromedriver.storage.googleapis.com'
    },
    firefox: {
      version: '0.19.1',
      arch: process.arch
    }
  }
  selenium.install(
    {
      logger: console.log,
      drivers: drivers
    },
    function (installError) {
      if (installError) {
        console.log('Error while installing selenium:', installError)
      }
      selenium.start({ drivers: drivers }, function (startError, child) {
        function killSelenium () {
          child.kill()
          console.log('Just killed selenium!')
        }
        if (startError) {
          console.log('Error while starting selenium:', startError)
          return process.exit(1)
        } else {
          console.log('Selenium started!')
          if (manualStop) {
            callback(killSelenium)
          } else {
            onExit(killSelenium)
            callback()
          }
        }
      })
    }
  )
}

function runE2eTests (configFilePath, runSelenium) {
  // npm i -D selenium-standalone webdriverio wdio-jasmine-framework
  var Launcher = require('webdriverio').Launcher
  var wdio = new Launcher(configFilePath)
  function runWdio () {
    wdio.run().then(
      function (code) {
        process.stdin.pause()
        process.nextTick(() => process.exit(code))
        // process.exit(code)
      },
      function (error) {
        console.error('Launcher failed to start the test', error)
        process.stdin.pause()
        process.nextTick(() => process.exit())
        // process.exit(1)
      }
    )
  }
  if (runSelenium) {
    startSelenium(runWdio)
  } else {
    runWdio()
  }
}

module.exports = {
  runUnitTests: runUnitTests,
  getTestEnvironmentVariables: getTestEnvironmentVariables,
  runKarma: runKarma,
  buildE2eBundles: buildE2eBundles,
  startSelenium: startSelenium,
  runE2eTests: runE2eTests,
  dirWalkSync: walkSync
}
