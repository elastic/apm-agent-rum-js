var path = require('path')
var webpack = require('webpack')

var env = {'globalConfigs': {}}

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
