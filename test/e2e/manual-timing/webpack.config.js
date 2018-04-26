var path = require('path')
var webpack = require('webpack')


var testConfig = require('../../../test.config')
var globalConfigs = testConfig

var configJson = JSON.stringify(globalConfigs, undefined, 2)
var env = {'globalConfigs': configJson}
console.log(configJson)


module.exports = {
  entry: path.resolve(__dirname, './app.js'),
  output: { path: __dirname, filename: 'app.e2e-bundle.js' },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        include: [__dirname, path.resolve(__dirname)],
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin(env)
  ]
}
