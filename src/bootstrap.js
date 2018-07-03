var alreadyBootstrap = false
var enabled = false
module.exports = function bootstrap () {
  if (alreadyBootstrap) {
    return enabled
  }
  alreadyBootstrap = true

  var apmCore = require('elastic-apm-js-core')
  if (apmCore.utils.isPlatformSupported()) {
    require('es6-promise/auto')
    apmCore.patching.patchAll()
    enabled = true
  } else {
    console.log('APM: Platform is not supported!')
  }

  return enabled
}
