module.exports = function(api) {
  api.cache(true)
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            ie: '10'
          },
          useBuiltIns: false,
          modules: 'umd'
        }
      ],
      ['@babel/preset-react']
    ]
  }
}
