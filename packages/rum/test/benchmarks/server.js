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

const express = require('express')
const path = require('path')
const { elasticApmUrl, port } = require('./config')
const { createReadStream } = require('fs')

const pages = path.join(__dirname, 'pages')
const dist = path.join(__dirname, '../../dist')

function generateImageUrls(number) {
  const path = `http://localhost:${port}`
  const urls = []
  for (let i = 0; i < number; i++) {
    urls.push(`${path}/images/${i}.png`)
  }
  return urls
}

/**
 * Avoid APM Script HTTP and Disk Cache in chrome
 */
function cacheBurstUrl(url) {
  return url + '?' + Date.now()
}

module.exports = function startServer() {
  return new Promise(resolve => {
    const app = express()

    app.get('/elastic-apm-rum.js*', (req, res) => {
      createReadStream(
        path.join(dist, 'bundles/elastic-apm-rum.umd.min.js'),
        'utf-8'
      ).pipe(res)
    })
    /**
     * Generate empty responses to test payload size
     */
    app.get('/images*', (req, res) => {
      res.end()
    })

    app.set('view engine', 'ejs')
    app.set('views', pages)

    app.get('/basic', (req, res) => {
      res.setHeader('cache-control', 'no-cache, no-store, must-revalidate')
      const bundleUrl = cacheBurstUrl(elasticApmUrl)
      res.render('basic', { elasticApmUrl: bundleUrl })
    })

    app.get('/heavy', (req, res) => {
      res.setHeader('cache-control', 'no-cache, no-store, must-revalidate')
      const images = generateImageUrls(30)
      const bundleUrl = cacheBurstUrl(elasticApmUrl)
      res.render('heavy', { elasticApmUrl: bundleUrl, images })
    })

    let server = app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`)
      resolve(server)
    })
  })
}
