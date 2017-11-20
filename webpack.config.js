var path = require('path')

var baseOptions = {
  entry: './src/index.js',
  output: {
    filename: 'elastic-apm-js-base.umd.js',
    path: path.resolve(__dirname, 'dist', 'bundles'),
    library: 'elastic-apm-js-base',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['babel-preset-es2015'].map(require.resolve)
        }
      }
    ]
  }
}

var bundleConfig = {
  entry: baseOptions.entry,
  output: baseOptions.output,
  module: baseOptions.module
}

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var optimizeConfig = {
  entry: baseOptions.entry,
  output: {
    filename: 'elastic-apm-js-base.umd.min.js',
    path: baseOptions.output.path
  },
  module: baseOptions.module,
  devtool: 'source-map',
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
      extractComments: true
    })
  ]
}

module.exports = [bundleConfig, optimizeConfig]
