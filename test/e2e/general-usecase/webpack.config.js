var path = require('path')
module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.e2e-bundle.js',
    path: path.resolve(__dirname)
  }
}
