/**
 * MIT License
 *
 * Copyright (c) 2017-present, Elasticsearch BV
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

const path = require('path')
const request = require('request')
const fs = require('fs')
const {
  getTestEnvironmentVariables
} = require('../../../../dev-utils/test-config')

const basePath = path.join(__dirname, '../e2e')
const { serverUrl } = getTestEnvironmentVariables()

describe('Sourcemaps', function() {
  it('should upload sourcemaps', function(done) {
    // curl http://localhost:8200/v1/rum/sourcemaps -X POST -F sourcemap=@app.e2e-bundle.js.map -F service_version=0.0.1 -F bundle_filepath="/test/e2e/general-usecase/app.e2e-bundle.js" -F service_name="apm-agent-js-base-test-e2e-general-usecase"
    var filepath = path.join(
      basePath,
      'general-usecase/app.e2e-bundle.min.js.map'
    )
    var formData = {
      sourcemap: fs.createReadStream(filepath),
      service_version: '0.0.1',
      bundle_filepath:
        'http://localhost:8000/test/e2e/general-usecase/app.e2e-bundle.min.js',
      service_name: 'apm-agent-js-base-test-e2e-general-usecase'
    }

    request.post(
      {
        url: serverUrl + '/v1/rum/sourcemaps',
        formData
      },
      function(err, resp, body) {
        if (err || (resp.statusCode !== 200 && resp.statusCode !== 202)) {
          var message = `Error while uploading sourcemaps, error: ${err}, response: ${resp &&
            resp.statusCode}, body: ${body}`
          fail(message)
          console.log(message)
        } else {
          done()
        }
      }
    )
  })
})
