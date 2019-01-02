var path = require('path')
var webpack = require('webpack')

var env = { globalConfigs: {} }

module.exports = {
  entry: path.resolve(__dirname, './app.jsx'),
  output: { path: __dirname, filename: 'app.e2e-bundle.js' },
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /.jsx?$/,
        include: [__dirname, path.resolve(__dirname)],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [new webpack.DefinePlugin(env)]
}
