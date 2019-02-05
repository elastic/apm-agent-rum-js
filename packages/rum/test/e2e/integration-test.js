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

const puppeteer = require('puppeteer')

async function runIntegrationTest (pageUrl) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--remote-debugging-port=9222']
  })
  var result = {}
  function handleError (error) {
    console.log(`Error on ${pageUrl}:\n ${String(error)}`)
  }
  try {
    const page = await browser.newPage()
    page.on('error', handleError)
    page.on('pageerror', handleError)

    await page.goto(pageUrl, { timeout: 30000 })
    const transactionResponse = await page.waitForResponse(response => {
      console.log(`${response.request().method()} ${response.url()} ${response.status()}`)
      var request = response.request()
      var data = request.postData()
      var transactionData = false
      if (data) {
        var payloads = data.split('\n').map(p => p && JSON.parse(p))
        if (payloads[1].hasOwnProperty('transaction')) {
          transactionData = true
        }
      }
      return (
        transactionData &&
        response.url().indexOf('/rum/events') > -1 &&
        response.status() === 202 &&
        response.request().method() === 'POST'
      )
    })

    var transactionRequest = transactionResponse.request()
    result.request = {
      url: transactionResponse.url(),
      method: transactionRequest.method(),
      body: transactionRequest.postData()
    }
    result.response = {
      status: transactionResponse.status()
    }
  } finally {
    await browser.close()
  }
  return result
}

// ; (async () => {
//     var result = await runIntegrationTest('http://localhost:8000/test/e2e/general-usecase/')
//     console.log(JSON.stringify(result, undefined, 2))
// })();

module.exports = {
  runIntegrationTest: runIntegrationTest
}
