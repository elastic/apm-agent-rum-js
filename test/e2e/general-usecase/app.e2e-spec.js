describe('general-usercase', function () {
  it('should run the general usecase', function () {
    browser.timeouts('script', 7000)

    browser.url('/test/e2e/general-usecase/index.html')
    browser.waitUntil(function () {
      return browser.getText('#test-element') === 'Passed'
    }, 5000, 'expected element #test-element')

    var result = browser.executeAsync(function (done) {
      var apmServerMock = window.elasticApm.serviceFactory.getService('ApmServer')
      apmServerMock.subscription.subscribe(function () {
        var serverCalls = apmServerMock.calls
        var validCalls = serverCalls.sendErrors && serverCalls.sendErrors.length && serverCalls.sendTransactions && serverCalls.sendTransactions.length

        if (validCalls) {
          done(serverCalls)
        }
      })
    })
    expect(result.value).toBeTruthy()
    var serverCalls = result.value
    expect(serverCalls.sendErrors.length).toBe(1)
    var errorPayload = serverCalls.sendErrors[0].args[0][0]
    expect(errorPayload.exception.message.indexOf('timeout test error') > 0).toBeTruthy()

    expect(serverCalls.sendTransactions.length).toBe(1)
    var transactionPayload = serverCalls.sendTransactions[0].args[0][0]
    expect(transactionPayload.type).toBe('page-load')
    expect(transactionPayload.name).toBe('general-usecase-initial-page-load')

  })
})
