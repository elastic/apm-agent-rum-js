var testUtils = require('elastic-apm-js-core/dev-utils/test')
var path = require('path')
var projectDirectory = path.join(__dirname, './../')

function runUnitTests () {
  var testConfig = testUtils.getTestEnvironmentVariables()
  testConfig.karmaConfigFile = __dirname + './../karma.conf.js'
  return testUtils.runUnitTests(testConfig)
}

function serveE2e (servingPath, port) {
  const express = require('express')
  const app = express()
  var staticPath = path.join(__dirname, '../', servingPath)
  app.use(express.static(staticPath))
  app.listen(port)

  console.log('serving on: ' , staticPath , port)
}

function runJasmine (cb) {
  var JasmineRunner = require('jasmine')
  var jrunner = new JasmineRunner()

  var specFiles = ['test/node/*.node-spec.js']

  jrunner.configureDefaultReporter({showColors: true})

  jrunner.onComplete(function (passed) {
    if (!passed) {
      var err = new Error('Jasmine node tests failed.')
      // The stack is not useful in this context.
      err.showStack = false
      cb(err)
    } else {
      cb()
    }
  })
  jrunner.print = function (value) {
    process.stdout.write(value)
  }
  jrunner.addReporter(new JasmineRunner.ConsoleReporter(jrunner))
  jrunner.projectBaseDir = projectDirectory
  jrunner.specDir = ''
  jrunner.addSpecFiles(specFiles)
  jrunner.execute()
}

var scripts = {
  runUnitTests: runUnitTests,
  startSelenium: testUtils.startSelenium,
  runE2eTests: function (runSelenium, serve) {
    if (serve != 'false') {
      serveE2e('./', 8000)
    }
    testUtils.runE2eTests(path.join(__dirname , './../wdio.conf.js'), runSelenium != 'false')
  },
  runNodeTests: function () {
    runJasmine(function (err) {
      if (err) console.log('Node tests failed:', err)
    })
  },
  buildE2eBundles: function (basePath) {
    basePath = basePath || './test/e2e'
    testUtils.buildE2eBundles(path.join(projectDirectory , basePath))
  },
  serveE2e: serveE2e
}

module.exports = scripts

function runScript () {
  var scriptName = process.argv[2]
  if (scriptName) {
    var scriptArgs = [].concat(process.argv)
    scriptArgs.splice(0, 3)
    var message = `Running: ${scriptName}(${scriptArgs.map(a=>'\''+a+'\'').join(', ')}) \n`
    console.log(message)
    if (typeof scripts[scriptName] === 'function') {
      return scripts[scriptName].apply(this, scriptArgs)
    } else {
      throw new Error('No script with name ' + scriptName)
    }
  }
}

runScript()
