const path = require('path')
const webpack = require('webpack')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const testConfig = require('../../../test.config')
const globalConfigs = testConfig

const configJson = JSON.stringify(globalConfigs, undefined, 2)
const env = { globalConfigs: configJson }
console.log(configJson)

const optimized = {
  entry: path.join(__dirname, './app.js'),
  output: {
    filename: 'app.e2e-bundle.min.js',
    path: path.resolve(__dirname)
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  mode: 'production',
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        extractComments: true
      })
    ]
  },
  plugins: [new webpack.DefinePlugin(env)]
}

module.exports = optimized
