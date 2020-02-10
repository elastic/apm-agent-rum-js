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

const playwright = require('playwright')
const { chrome } = require('./config')
const {
  filterCpuMetrics,
  capturePayloadInfo,
  getMemoryAllocationPerFunction
} = require('./analyzer')

async function launchBrowser(type) {
  return await playwright[type].launch(chrome.launchOptions)
}

function gatherRawMetrics(browser, url) {
  return new Promise(async resolve => {
    /**
     * Create a separate browsing context for each run
     */
    const context = await browser.newContext()
    const page = await context.newPage()

    /**
     * CDP session is only available on chromium based browsers which follows
     * the devtools protocol
     * https://chromedevtools.github.io/devtools-protocol/
     */
    let client = null
    try {
      client = await browser.pageTarget(page).createCDPSession()
    } catch (_) {}

    /**
     * Disable cache for each run
     */
    await page.setCacheEnabled(false)

    if (client) {
      /**
       * Enable events from Chrome devtools protocol
       */
      await client.send('Page.enable')
      await client.send('Profiler.enable')
      await client.send('HeapProfiler.enable')
      /**
       * Tune the CPU sampler to get control the
       * number of samples generated
       */
      await client.send('Profiler.setSamplingInterval', {
        interval: chrome.cpuSamplingInterval
      })
    }

    /**
     * Result metrics that will be filled at various
     * time throughout the page lifecycle
     */
    let metrics = {}

    page.on('request', async request => {
      const requestUrl = request.url()
      if (requestUrl.indexOf('/intake/v2/rum/events') >= 0) {
        /**
         * Stop the profiler once we post the transaction to
         * the apm server
         */
        let filteredCpuMetrics = {}
        let memoryMetrics = []
        if (client) {
          const result = await client.send('Profiler.stop')
          const sample = await client.send('HeapProfiler.stopSampling')

          memoryMetrics = getMemoryAllocationPerFunction(sample)
          filteredCpuMetrics = filterCpuMetrics(result.profile, url)
        }
        const response = request.postData()
        const payload = capturePayloadInfo(response)

        Object.assign(metrics, {
          cpu: filteredCpuMetrics,
          payload,
          memory: memoryMetrics
        })
        /**
         * Resolve the promise once we measure the size
         * of the payload to APM Server
         */
        resolve(metrics)
      }
    })

    page.on('load', async function() {
      const timings = await page.evaluate(() => {
        // Serializing the outputs otherwise it will be undefined
        let entries = performance.getEntriesByType('navigation')
        /**
         * Webkit does not support navigation entry types
         */
        if (entries.length === 0) {
          const { loadEventEnd, fetchStart } = performance.timing
          let entry = { loadEventEnd, fetchStart, name: window.location.href }
          entries = [entry]
        }

        return {
          navigation: JSON.stringify(entries),
          resource: JSON.stringify(performance.getEntriesByType('resource')),
          measure: JSON.stringify(performance.getEntriesByType('measure'))
        }
      })

      Object.assign(metrics, timings)
    })
    if (client) {
      /**
       * Perform a garbage collection to do a clean check everytime
       */
      await client.send('HeapProfiler.collectGarbage')
      /**
       * Start the CPU and Memory profiler before navigating to the URL
       */
      await client.send('Profiler.start')
      await client.send('HeapProfiler.startSampling', {
        interval: chrome.memorySamplingInterval
      })
    }

    await page.goto(url)
  })
}

module.exports = {
  gatherRawMetrics,
  launchBrowser
}
