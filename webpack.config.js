const path = require('path')
const { version: agentVersion } = require('./package.json')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const OUTPUT_DIR = path.join(__dirname, 'dist', 'bundles')

const baseConfig = {
  entry: './src/index.js',
  output: {
    filename: 'elastic-apm-js-base.umd.js',
    path: OUTPUT_DIR,
    library: 'elastic-apm-js-base',
    libraryTarget: 'umd'
  },
  mode: 'development',
  node: false,
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'string-replace-loader',
          options: {
            search: '%%agent-version%%',
            replace: agentVersion
          }
        }
      }
    ]
  }
}

const optimizeConfig = Object.assign({}, baseConfig, {
  output: {
    filename: 'elastic-apm-js-base.umd.min.js',
    path: OUTPUT_DIR
  },
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        sourceMap: true,
        extractComments: true
      })
    ]
  },
  performance: {
    hints: 'warning',
    maxAssetSize: 65 * 1024 // 65 kB
  },
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: path.resolve(__dirname, 'reports', 'bundle-analyzer.html'),
      generateStatsFile: true,
      statsFilename: path.resolve(__dirname, 'reports', 'bundle-analyzer.json'),
      openAnalyzer: false
    })
  ]
})

module.exports = [baseConfig, optimizeConfig]
