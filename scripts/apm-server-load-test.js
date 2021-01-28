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

const faker = require('faker')
const { merge } = require('lodash')
const crypto = require('crypto')
const fetch = require('node-fetch')
const { join } = require('path')
const { version } = require('../packages/rum/package.json')
const { writeFile } = require('fs').promises

const serverUrl = process.env.APM_SERVER_URL || 'http://localhost:8200'

/**
 * To make the random id generation work.
 */
const destination = new Uint8Array(16)
global.crypto = {
  getRandomValues: () => {
    return crypto.randomFillSync(destination)
  }
}
const {
  generateRandomId
} = require('../packages/rum-core/dist/lib/common/utils')

const defaultMeta = {
  metadata: {
    service: {
      name: 'apm-server-load-test',
      agent: {
        name: 'rum-js',
        version
      },
      language: {
        name: 'javascript'
      }
    }
  }
}
const defaultTransaction = {
  transaction: {
    id: '73a0d4714e793b8a',
    trace_id: '2b282fc14bd5a45bd69798c0c70fbe53',
    name: 'test-transaction',
    type: 'page-load',
    duration: 3092,
    context: {
      page: {
        referer: '',
        url: 'https://www.elastic.co/'
      },
      response: {
        transfer_size: 333,
        encoded_body_size: 28019,
        decoded_body_size: 140745
      }
    },
    marks: {
      navigationTiming: {
        fetchStart: 0,
        domainLookupStart: 0,
        domainLookupEnd: 0,
        connectStart: 0,
        connectEnd: 0,
        requestStart: 50,
        responseStart: 157,
        responseEnd: 157,
        domLoading: 161,
        domInteractive: 540,
        domContentLoadedEventStart: 607,
        domContentLoadedEventEnd: 610,
        domComplete: 1350,
        loadEventStart: 1350,
        loadEventEnd: 1350
      },
      agent: {
        timeToFirstByte: 157,
        domInteractive: 540,
        domComplete: 1350
      }
    },
    span_count: {
      started: 82
    },
    sampled: true,
    experience: {
      tbt: 100,
      cls: 0.5,
      fid: 50
    }
  }
}

const defaultSpan = {
  span: {
    id: '8cabde4612857a8f',
    transaction_id: '93a0bcc9a6a4a646',
    parent_id: '93a0bcc9a6a4a646',
    trace_id: '1acfdeb11a825ddecedf54dcce00994c',
    name: 'http://testing.com',
    type: 'resource',
    subtype: 'script',
    start: 25,
    duration: 143,
    context: {
      http: {
        url: 'http://testing.com',
        response: {}
      },
      destination: {
        service: {
          name: 'http://testing.com',
          resource: 'testing.com:80',
          type: 'resource'
        },
        address: 'testing.com',
        port: 80
      }
    }
  }
}

function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateTransaction(spanCount) {
  let breakdown = []
  let tr = merge({}, defaultTransaction, {
    transaction: {
      id: generateRandomId(16),
      trace_id: generateRandomId(),
      duration: Math.floor(getRandomNumber(0, 5000)),
      name: faker.random.words(3),
      span_count: {
        started: spanCount
      },
      sampled: spanCount != 0,
      breakdown,
      context: {
        page: {
          referer: faker.internet.url(),
          url: faker.internet.url()
        }
      }
    }
  })

  breakdown.push({
    transaction: { name: tr.transaction.name, type: tr.transaction.type },
    samples: {
      'transaction.duration.count': { value: 1 },
      'transaction.duration.sum.us': { value: tr.transaction.duration },
      'transaction.breakdown.count': { value: tr.transaction.sampled ? 1 : 0 }
    }
  })

  let payload = [tr]
  for (let i = 0; i < spanCount; i++) {
    const span = merge({}, defaultSpan, {
      span: {
        id: generateRandomId(16),
        transaction_id: tr.transaction.id,
        parent_id: tr.transaction.id,
        trace_id: tr.transaction.trace_id,
        name: [
          'http://testing.com',
          generateRandomId(),
          generateRandomId() + '.js'
        ].join('/'),
        start: getRandomInt(0, tr.transaction.duration),
        duration: getRandomInt(0, tr.transaction.duration)
      }
    })
    payload.push(span)
  }

  return payload
}

function ndJsonStringify(object) {
  return JSON.stringify(object) + '\n'
}

async function postPayload(url, payload) {
  let data = payload.map(p => {
    return ndJsonStringify(p)
  })
  let response = await fetch(url, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/x-ndjson',
      'X-Forwarded-For': faker.internet.ip(),
      'User-Agent': faker.internet.userAgent()
    },
    body: data.join('')
  })
  return response.text()
}

async function generatePayloads(transactionCount) {
  const spanPerTransaction = 50
  let promises = []
  for (let i = 0; i < transactionCount; i++) {
    let payload = generateTransaction(spanPerTransaction)
    payload.unshift(merge({}, defaultMeta))
    let p = postPayload(`${serverUrl}/intake/v2/rum/events`, payload)
    promises.push(p)
  }
  await Promise.all(promises)
  let response = await fetch(`${serverUrl}/debug/vars`)
  const apmServerResults = await response.json()

  const result = {
    '@timestamp': Date.now(),
    transactionCount,
    spanPerTransaction,
    apmServer: apmServerResults
  }
  return result
}

;(async function() {
  const outputFile = process.argv[2]

  const result = await generatePayloads(10)

  if (outputFile) {
    const outputPath = join(__dirname, '../', outputFile)
    let ndJSONOutput =
      '{"index": { "_index": "benchmarks-rum-load-test", "_type": "_doc"}}' +
      '\n'
    ndJSONOutput += JSON.stringify(result)
    await writeFile(outputPath, ndJSONOutput)
  } else {
    console.log(result)
  }
})()
