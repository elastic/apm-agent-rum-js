const puppeteer = require("puppeteer");

async function runIntegrationTest(pageUrl) {
    const browser = await puppeteer.launch({ headless: true });
    var result = {}
    try {
        const page = await browser.newPage();
        function handleError(error) {
            console.log(`Error on ${pageUrl}:\n ${String(error)}`)
        }
        page.on('error', handleError)
        page.on('pageerror', handleError)

        await page.goto(pageUrl, { timeout: 30000 });
        const transactionResponse = await page.waitForResponse(response => {
            return response.url().indexOf('v1/client-side/transactions') > -1 && response.status() === 202 && response.request().method() == 'POST'
        });

        var transactionRequest = transactionResponse.request()
        result.request = {
            url: transactionResponse.url(),
            method: transactionRequest.method(),
            body: JSON.parse(transactionRequest.postData())
        }
        result.response = {
            status: transactionResponse.status()
        }

    } finally {
        await browser.close();
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

