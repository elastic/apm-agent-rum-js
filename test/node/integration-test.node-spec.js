var request = require('request')

describe('integration-test', function () {
    it('should run integration test', function (done) {
        var req = request.get({
            url: 'http://localhost:8000/run_integration_test?echo=done'
        }, function (err, resp, body) {
            if (err || resp.statusCode != 200 && resp.statusCode != 202) {
                var message = `Integration test failed, error: ${err}, response: ${resp && resp.statusCode}, body: ${body}`
                fail(message)
                console.log(message)
            } else {
                done()
            }
        })
    })
})