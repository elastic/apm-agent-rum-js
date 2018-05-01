var utils = require('elastic-apm-js-core/dev-utils/webdriver')

describe('manual-timing', function () {
  it('should run manual timing', function () {
    browser.timeouts('script', 10000)
    browser.url('/test/e2e/manual-timing/index.html')

    browser.waitUntil(function () {
      return browser.getText('#test-element') === 'Passed'
    }, 5000, 'expected element #test-element')
    
    var result = browser.executeAsync(function (done) {
      var apmServerMock = window.elasticApm.serviceFactory.getService('ApmServer')

      function checkCalls () {
        var serverCalls = apmServerMock.calls
        var validCalls = serverCalls.sendErrors && serverCalls.sendErrors.length && serverCalls.sendTransactions && serverCalls.sendTransactions.length

        if (validCalls) {
          console.log('calls', serverCalls)
          Promise.all([serverCalls.sendErrors[0].returnValue, serverCalls.sendTransactions[0].returnValue])
            .then(function () {
              try {
                function mapCall (c) {
                  return {args: c.args,mocked: c.mocked}
                }
                var calls = {
                  sendErrors: serverCalls.sendErrors.map(mapCall),
                  sendTransactions: serverCalls.sendTransactions.map(mapCall)
                }
                done(calls)
              } catch(e) {
                throw e
              }
            })
            .catch(function (reason) {
              console.log('reason', reason)
              try {
                done({error: reason.message || JSON.stringify(reason)})
              } catch (e) {
                done({error: 'Failed serializing rejection reason: ' + e.message})
              }
            })
        }
      }

      checkCalls()
      apmServerMock.subscription.subscribe(checkCalls)
    })
    
    expect(result.value).toBeTruthy()
    var serverCalls = result.value
    console.log(JSON.stringify(serverCalls, null, 2))
    if (serverCalls.error) {
      fail(serverCalls.error)
    }
    expect(serverCalls.sendErrors.length).toBe(1)
    var errorPayload = serverCalls.sendErrors[0].args[0][0]
    expect(errorPayload.exception.message.indexOf('timeout test error') >= 0).toBeTruthy()

    expect(serverCalls.sendTransactions.length).toBe(1)
    var transactionPayload = serverCalls.sendTransactions[0].args[0][0]
    expect(transactionPayload.name).toBe('transaction-name')
    expect(transactionPayload.type).toBe('transaction-type')

    return utils.verifyNoBrowserErrors()
  })
})
