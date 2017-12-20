var testUtils = require('elastic-apm-js-core/dev-utils/test.js')
var path = require('path')
var webpack = require('webpack')
var testConfig = testUtils.getTestEnvironmentVariables()
var globalConfigs = {
  testConfig,
  serverUrl: 'http://localhost:8200'
}
if (globalConfigs.testConfig.sauceLabs) {
  globalConfigs.useMocks = true
}
console.log(globalConfigs)
module.exports = {
  entry: path.join(__dirname, './app.js'),
  output: {
    filename: 'app.e2e-bundle.js',
    path: path.resolve(__dirname)
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({'globalConfigs': JSON.stringify(globalConfigs)})
  ]
}
