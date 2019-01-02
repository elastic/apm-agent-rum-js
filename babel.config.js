module.exports = function (api) {
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
          modules: false,
          loose: true
        }
      ]
    ]
  }
}
