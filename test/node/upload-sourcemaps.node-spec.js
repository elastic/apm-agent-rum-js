var path = require('path')
var request = require('request')
var fs = require('fs')

var basePath = './test/e2e'
var testConfig = require('../../test.config')

describe('Sourcemaps', function () {
    it('should upload sourcemaps', function (done) {
        // curl http://localhost:8200/v1/rum/sourcemaps -X POST -F sourcemap=@app.e2e-bundle.js.map -F service_version=0.0.1 -F bundle_filepath="/test/e2e/general-usecase/app.e2e-bundle.js" -F service_name="apm-agent-js-base-test-e2e-general-usecase"
        var filepath = path.join(basePath, 'general-usecase/app.e2e-bundle.min.js.map')
        var formData = {
            sourcemap: fs.createReadStream(filepath),
            service_version: '0.0.1',
            bundle_filepath: 'http://localhost:8000/test/e2e/general-usecase/app.e2e-bundle.min.js',
            service_name: 'apm-agent-js-base-test-e2e-general-usecase'
        }

        var req = request.post({
            url: testConfig.serverUrl + '/v1/rum/sourcemaps',
            formData: formData
        }, function (err, resp, body) {

            if (err || resp.statusCode != 200 && resp.statusCode != 202) {
                var message = `Error while uploading sourcemaps, error: ${err}, response: ${resp && resp.statusCode}, body: ${body}`
                fail(message)
                console.log(message)
            } else {
                done()
            }
        })
    })
})