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
const { Server } = require('karma')
const { Launcher } = require('@wdio/cli')
const sauceConnectLauncher = require('sauce-connect-launcher')
const JasmineRunner = require('jasmine')

function walkSync(dir, filter, filelist) {
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

function buildE2eBundles(basePath, callback) {
  var cb =
    callback ||
    function (err) {
      if (err) {
        process.exit(2)
      }
    }

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

  console.log('Webpack config files: \n', fileList.join('\n'), '\n')
  webpack(configs, (err, stats) => {
    if (err) {
      console.error(err)
      return cb(err)
    }

    const info = stats.toJson('minimal')
    if (stats.hasErrors()) {
      console.error('There were errors while building')
      info.errors.forEach(err => console.error(err))
      cb(info.errors)
    } else {
      console.log(
        stats.toString({
          colors: true,
          chunks: false,
          assets: false,
          modules: false,
          warnings: false
        })
      )
      cb()
    }
  })
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
  const server = new Server({ configFile, singleRun: true }, exitCode =>
    process.exit(exitCode)
  )
  server.start()
}

function runE2eTests(configFilePath) {
  const wdio = new Launcher(configFilePath, {})
  wdio.run().then(
    function (code) {
      process.stdin.pause()
      process.nextTick(() => process.exit(code))
    },
    function (error) {
      console.error('Launcher failed to start the test', error)
      process.stdin.pause()
      process.nextTick(() => process.exit())
    }
  )
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
  dirWalkSync: walkSync
}
