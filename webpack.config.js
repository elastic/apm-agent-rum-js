var path = require('path')
var agentVersion = require('./package.json').version
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

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
      },
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: '%%agent-version%%',
          replace: agentVersion
        }
      }
    ]
  }
}

var bundleConfig = {
  entry: baseOptions.entry,
  output: baseOptions.output,
  module: baseOptions.module,
  node: false
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
  node: false,
  plugins: [
    new UglifyJSPlugin({
      sourceMap: true,
      extractComments: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(__dirname, 'reports', 'bundle-analyzer.html'),
      generateStatsFile: true,
      statsFilename: path.resolve(__dirname, 'reports', 'bundle-analyzer.json'),
      openAnalyzer: false
    })
  ]
}

module.exports = [bundleConfig, optimizeConfig]
