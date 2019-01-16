var utils = require('elastic-apm-js-core/dev-utils/webdriver')
const { isChrome } = require('../e2e-utils')

describe('standalone-html', function () {
  it('should run the usecase', function () {
    browser.timeouts('script', 30000)
    browser.url('/test/e2e/standalone-html/index.html')

    browser.waitUntil(
      function () {
        return browser.getText('#test-element') === 'Passed'
      },
      10000,
      'expected element #test-element'
    )

    if (isChrome()) {
      return utils.allowSomeBrowserErrors(['timeout test error with a secret'])
    }
  })

  it('should run the opentracing use-case', function () {
    browser.timeouts('script', 30000)
    browser.url('/test/e2e/standalone-html/opentracing.html')

    browser.waitUntil(
      function () {
        return browser.getText('#test-element') === 'Passed'
      },
      10000,
      'expected element #test-element'
    )

    if (isChrome()) {
      return utils.allowSomeBrowserErrors(['timeout test error with a secret'])
    }
  })
})
