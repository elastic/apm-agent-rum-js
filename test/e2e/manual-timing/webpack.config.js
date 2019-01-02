const path = require('path')
const webpack = require('webpack')

const testConfig = require('../../../test.config')
const globalConfigs = testConfig

const configJson = JSON.stringify(globalConfigs, undefined, 2)
const env = { globalConfigs: configJson }
console.log(configJson)

module.exports = {
  entry: path.resolve(__dirname, './app.js'),
  output: { path: __dirname, filename: 'app.e2e-bundle.js' },
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /.js?$/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [new webpack.DefinePlugin(env)]
}
