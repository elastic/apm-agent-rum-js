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

const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const { default: Launcher } = require('@wdio/cli')
const sauceConnectLauncher = require('sauce-connect-launcher')
const JasmineRunner = require('jasmine')
const { singleRunKarma } = require('./karma')

function walkSync(dir, filter, filelist) {
  var files = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach(function(file) {
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

function buildE2eBundles(basePath, callback) {
  var cb =
    callback ||
    function(err) {
      if (err) {
        var exitCode = 2
        process.exit(exitCode)
      }
    }

  var fileList = walkSync(basePath, /webpack\.config\.js$/)
  fileList = fileList.map(function(file) {
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

    const jsonStats = stats.toJson('minimal')
    console.log(stats.toString('minimal'))
    if (jsonStats.errors.length > 0) {
      jsonStats.errors.forEach(function(error) {
        console.log('Error:', error)
      })
      cb(jsonStats.errors)
    } else {
      cb()
    }
  })
}

function onExit(callback) {
  function exitHandler(err) {
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

function startSelenium(callback, manualStop) {
  callback = callback || function() {}
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
      drivers
    },
    function(installError) {
      if (installError) {
        console.log('Error while installing selenium:', installError)
      }
      selenium.start({ drivers }, function(startError, child) {
        function killSelenium() {
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

function runSauceConnect(config, callback) {
  return sauceConnectLauncher(config, (err, sauceConnectProcess) => {
    if (err) {
      console.error('Sauce connect Error', err)
      return process.exit(1)
    } else {
      console.log('Sauce connect ready')
      callback(sauceConnectProcess)
    }
  })
}

function runKarma(configFile) {
  singleRunKarma(configFile, exitCode => {
    if (exitCode) {
      return process.exit(exitCode)
    }
    console.log('Karma finished.')
    return process.exit(0)
  })
}

function runE2eTests(configFilePath, runSelenium) {
  const wdio = new Launcher(configFilePath, {})
  function runWdio() {
    wdio.run().then(
      function(code) {
        process.stdin.pause()
        process.nextTick(() => process.exit(code))
        // process.exit(code)
      },
      function(error) {
        console.error('Launcher failed to start the test', error)
        process.stdin.pause()
        process.nextTick(() => process.exit())
      }
    )
  }
  if (runSelenium) {
    startSelenium(runWdio)
  } else {
    runWdio()
  }
}

function runJasmine(specDir, cb) {
  const jrunner = new JasmineRunner()
  /**
   * spec dir is a relative directory path from the current working dir
   */
  jrunner.loadConfig({
    spec_dir: specDir,
    spec_files: ['*.spec.js'],
    helpers: ['*.helper.js']
  })
  jrunner.onComplete(passed => {
    if (!passed) {
      const err = new Error('Jasmine tests failed')
      // The stack is not useful in this context.
      err.stack = ''
      cb(err)
    } else {
      cb()
    }
  })
  jrunner.execute()
}

module.exports = {
  buildE2eBundles,
  runE2eTests,
  runKarma,
  runJasmine,
  runSauceConnect,
  startSelenium,
  dirWalkSync: walkSync
}
