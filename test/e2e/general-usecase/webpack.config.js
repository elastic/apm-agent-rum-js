var testUtils = require('elastic-apm-js-core/dev-utils/test.js')
var path = require('path')
var webpack = require('webpack')

var testConfig = require('../../../test.config')
var globalConfigs = testConfig

var configJson = JSON.stringify(globalConfigs, undefined, 2)
var env = {'globalConfigs': configJson}
console.log(configJson)

var base = {
  entry: path.join(__dirname, './app.js'),
  output: {
    filename: 'app.e2e-bundle.js',
    path: path.resolve(__dirname)
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin(env)
  ]
}

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var optimized = {
  entry: base.entry,
  output: {
    filename: 'app.e2e-bundle.min.js',
    path: base.output.path
  },
  devtool: base.devtool,
  plugins: [
    new webpack.DefinePlugin(env),
    new UglifyJSPlugin({
      sourceMap: true,
      extractComments: false
    })
  ]
}
module.exports = [base, optimized]
