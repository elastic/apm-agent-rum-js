var testUtils = require('elastic-apm-js-core/dev-utils/test')
var scripts = {
  runUnitTests: function () {
    var testConfig = testUtils.getTestEnvironmentVariables()
    testConfig.karmaConfigFile = __dirname + './../karma.conf.js'
    return testUtils.runUnitTests(testConfig)
  }
}

module.exports = scripts

function runScript () {
  var scriptName = process.argv[2]
  console.log('Running:', scriptName, '\n')
  if (scriptName && typeof scripts[scriptName] === 'function') {
    return scripts[scriptName].apply(this, [])
  }
}

runScript()
