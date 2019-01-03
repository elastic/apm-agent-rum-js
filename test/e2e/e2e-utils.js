function isChrome () {
  const browserName = browser.desiredCapabilities.browserName.toLowerCase()
  return browserName.indexOf('chrome') !== -1
}

module.exports = { isChrome }
