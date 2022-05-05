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

import { createServiceFactory, generateTransaction, generateErrors } from '..'
import { spyOnFunction } from '../../../../dev-utils/jasmine'
import {
  compressTransaction,
  compressMetadata,
  compressError,
  compressPayload
} from '../../src/common/compress'
import { CONFIG_SERVICE, APM_SERVER } from '../../src/common/constants'
import { addTransactionContext } from '../../src/common/context'
import * as utils from '../../src/common/utils'

/**
 * Mapping of existing fields with the new v3 RUM specification
 * https://github.com/elastic/apm-server/blob/master/model/modeldecoder/field/rum_v3_mapping.go
 */
const V3_MAPPING = {
  abs_path: 'ap',
  action: 'ac',
  address: 'ad',
  agent: 'a',
  attributes: 'at',
  breakdown: 'b',
  cause: 'ca',
  classname: 'cn',
  code: 'cd',
  colno: 'co',
  connectEnd: 'ce',
  connectStart: 'cs',
  context: 'c',
  context_line: 'cli',
  culprit: 'cl',
  custom: 'cu',
  decoded_body_size: 'dbs',
  destination: 'dt',
  domComplete: 'dc',
  domContentLoadedEventEnd: 'de',
  domContentLoadedEventStart: 'ds',
  domInteractive: 'di',
  domLoading: 'dl',
  domainLookupEnd: 'le',
  domainLookupStart: 'ls',
  dropped: 'dd',
  duration: 'd',
  email: 'em',
  encoded_body_size: 'ebs',
  env: 'en',
  environment: 'en',
  error: 'e',
  exception: 'ex',
  fetchStart: 'fs',
  filename: 'f',
  firstContentfulPaint: 'fp',
  framework: 'fw',
  function: 'fn',
  handled: 'hd',
  headers: 'he',
  http: 'h',
  http_version: 'hve',
  labels: 'l',
  language: 'la',
  largestContentfulPaint: 'lp',
  level: 'lv',
  lineno: 'li',
  loadEventEnd: 'ee',
  loadEventStart: 'es',
  log: 'log',
  logger_name: 'ln',
  marks: 'k',
  message: 'mg',
  metadata: 'm',
  method: 'mt',
  metricset: 'me',
  module: 'mo',
  name: 'n',
  navigationTiming: 'nt',
  page: 'p',
  param_message: 'pmg',
  parent_id: 'pid',
  parent_idx: 'pi',
  port: 'po',
  post_context: 'poc',
  pre_context: 'prc',
  referer: 'rf',
  request: 'q',
  requestStart: 'qs',
  resource: 'rc',
  result: 'rt',
  response: 'r',
  responseEnd: 're',
  responseStart: 'rs',
  runtime: 'ru',
  sampled: 'sm',
  sample_rate: 'sr',
  samples: 'sa',
  'server-timing': 'set',
  service: 'se',
  span: 'y',
  'span.self_time.count': 'ysc',
  'span.self_time.sum.us': 'yss',
  span_count: 'yc',
  stacktrace: 'st',
  start: 's',
  started: 'sd',
  status_code: 'sc',
  subtype: 'su',
  sync: 'sy',
  tags: 'g',
  timeToFirstByte: 'fb',
  trace_id: 'tid',
  transaction: 'x',
  transaction_id: 'xid',
  'transaction.breakdown.count': 'xbc',
  'transaction.duration.count': 'xdc',
  'transaction.duration.sum.us': 'xds',
  transfer_size: 'ts',
  type: 't',
  url: 'url',
  user: 'u',
  username: 'un',
  value: 'v',
  version: 've'
}

const SEPARATOR = '-'

function flatten(obj) {
  const result = {}
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value != null && typeof value === 'object') {
      const flatObj = flatten(value)
      for (let flatKey of Object.keys(flatObj)) {
        result[key + SEPARATOR + flatKey] = flatObj[flatKey]
      }
    } else {
      result[key] = value
    }
  }
  return result
}

describe('Compress', function () {
  let serviceFactory
  let apmServer
  let configService
  let performanceMonitoring
  let errorLogging

  beforeEach(function () {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService(CONFIG_SERVICE)
    apmServer = serviceFactory.getService(APM_SERVER)
    performanceMonitoring = serviceFactory.getService('PerformanceMonitoring')
    errorLogging = serviceFactory.getService('ErrorLogging')
    configService.setConfig({
      context: {
        tags: {
          foo: 'bar'
        }
      }
    })
  })

  function getMappedKeys(keys) {
    /**
     * Some keys needs special mapping as they are used it only for
     * internal data structures
     */
    const special = {
      spans: 'y',
      breakdown: 'me'
    }
    return keys.map(key => {
      const mappedKey = special[key] || V3_MAPPING[key]
      if (mappedKey != null) {
        return mappedKey
      }
      return key
    })
  }

  function isOptional(key) {
    /**
     * List of keys that are made optional in V3 SPEC
     */
    const OPTIONAL_KEYS = [
      'transaction_id',
      'parent_id',
      'trace_id',
      'sync',
      // Optional keys inside breakdown - breakdown.*.samples.<key>
      'transaction-name',
      'transaction-type',
      'span-subtype'
    ]
    return OPTIONAL_KEYS.some(optKey => key.indexOf(optKey) >= 0)
  }

  function testMappedObject(original, compressed) {
    const originalFlat = flatten(original)
    const compressedFlat = flatten(compressed)

    for (const key of Object.keys(originalFlat)) {
      const keys = key.split(SEPARATOR)
      const mappedKeys = getMappedKeys(keys)
      const compressedKey = mappedKeys.join(SEPARATOR)
      /**
       * Some fields are made optional in the v3 spec so we check
       * the condition only when the keys are not optional and
       * values exist in the new compressed model
       */
      if (!isOptional(key) || compressedFlat[compressedKey] != null) {
        expect(originalFlat[key]).toEqual(compressedFlat[compressedKey])
      }
    }
  }

  it('should compress metadata model', () => {
    configService.setVersion('5.0.0')
    configService.setConfig({
      serviceName: 'test',
      serviceVersion: '1.1.2',
      environment: 'test'
    })
    const metadata = apmServer.createMetaData()
    const compressed = compressMetadata(metadata)

    testMappedObject(metadata, compressed)
  })

  it('should compress transaction model', () => {
    const transaction = generateTransaction(1, true).map(tr => {
      addTransactionContext(tr, { custom: { foo: 'bar' } })
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })[0]
    const compressed = compressTransaction(transaction)

    testMappedObject(transaction, compressed)
  })

  it('should include provided navigation timing marks when compressing transaction model', () => {
    const expectedNtMarks = {
      [V3_MAPPING.fetchStart]: 1,
      [V3_MAPPING.domainLookupStart]: 2,
      [V3_MAPPING.domainLookupEnd]: 3,
      [V3_MAPPING.connectStart]: 4,
      [V3_MAPPING.connectEnd]: 5,
      [V3_MAPPING.requestStart]: 6,
      [V3_MAPPING.responseStart]: 7,
      [V3_MAPPING.responseEnd]: 8,
      [V3_MAPPING.domLoading]: 9,
      [V3_MAPPING.domInteractive]: 10,
      [V3_MAPPING.domContentLoadedEventStart]: 11,
      [V3_MAPPING.domContentLoadedEventEnd]: 12,
      [V3_MAPPING.domComplete]: 13,
      [V3_MAPPING.loadEventStart]: 14,
      [V3_MAPPING.loadEventEnd]: 15
    }

    const transaction = generateTransaction(1, true).map(tr => {
      tr.addMarks({
        navigationTiming: {
          fetchStart: 1,
          domainLookupStart: 2,
          domainLookupEnd: 3,
          connectStart: 4,
          connectEnd: 5,
          requestStart: 6,
          responseStart: 7,
          responseEnd: 8,
          domLoading: 9,
          domInteractive: 10,
          domContentLoadedEventStart: 11,
          domContentLoadedEventEnd: 12,
          domComplete: 13,
          loadEventStart: 14,
          loadEventEnd: 15
        }
      })
      addTransactionContext(tr, { custom: { foo: 'bar' } })
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })[0]

    const compressed = compressTransaction(transaction)
    const compressedNtMarks =
      compressed[V3_MAPPING.marks][V3_MAPPING.navigationTiming]

    expect(compressedNtMarks).toEqual(expectedNtMarks)
  })

  it('should handle the absence of timing marks when compressing transaction model', () => {
    const transaction = generateTransaction(1, true).map(tr => {
      tr.addMarks({ navigationTiming: null })
      addTransactionContext(tr, { custom: { foo: 'bar' } })
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })[0]

    const { marks, navigationTiming } = V3_MAPPING
    const compressed = compressTransaction(transaction)

    expect(compressed[marks][navigationTiming]).toBe(null)
  })

  it('should include provided agent timing marks when compressing transaction model', () => {
    const expectedAgentMarks = {
      [V3_MAPPING.timeToFirstByte]: 1,
      [V3_MAPPING.domInteractive]: 2,
      [V3_MAPPING.domComplete]: 3,
      [V3_MAPPING.firstContentfulPaint]: 4,
      [V3_MAPPING.largestContentfulPaint]: 5
    }
    const transaction = generateTransaction(1, true).map(tr => {
      tr.addMarks({
        navigationTiming: {
          responseStart: 1,
          domInteractive: 2,
          domComplete: 3
        },
        agent: {
          firstContentfulPaint: 4,
          largestContentfulPaint: 5
        }
      })

      addTransactionContext(tr, { custom: { foo: 'bar' } })
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })[0]

    const compressed = compressTransaction(transaction)
    const compressedNtMarks = compressed[V3_MAPPING.marks][V3_MAPPING.agent]

    expect(compressedNtMarks).toEqual(expectedAgentMarks)
  })

  it('should handle the absence of agent marks when compressing transaction model', () => {
    const transaction = generateTransaction(1, true).map(tr => {
      tr.addMarks({ agent: null })
      addTransactionContext(tr, { custom: { foo: 'bar' } })
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })[0]
    const { marks, agent } = V3_MAPPING
    const compressed = compressTransaction(transaction)

    expect(compressed[marks][agent]).toBe(null)
  })

  it('should compress error model', () => {
    const error = generateErrors(1).map((err, i) => {
      let model = errorLogging.createErrorDataModel(err)
      model.id = 'error-id-' + i
      return model
    })[0]
    const compressed = compressError(error)

    testMappedObject(error, compressed)
  })

  it('should compress payload', async () => {
    /**
     * Utility functions that helps to decompress the compressed payload and
     * also view them as text output.
     */
    function decompressPayload(blob, type = 'gzip') {
      const ds = new DecompressionStream(type)
      const decompressedStream = blob.stream().pipeThrough(ds)
      return new Response(decompressedStream).blob()
    }

    function view(blob) {
      return blob.text()
    }

    const transactions = generateTransaction(1, true).map(tr => {
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })
    const ndjsonPayload = apmServer
      .ndjsonTransactions(transactions, true)
      .join('')
    const isCompressionStreamSupported = typeof CompressionStream === 'function'
    const originalHeaders = { 'Content-Type': 'application/x-ndjson' }
    let { payload, headers } = await compressPayload({
      payload: ndjsonPayload,
      headers: originalHeaders
    })
    if (isCompressionStreamSupported) {
      const decompressedBlob = await decompressPayload(payload)
      payload = await view(decompressedBlob)
      expect(headers).toEqual({
        ...originalHeaders,
        'Content-Encoding': 'gzip'
      })
    } else {
      expect(headers).toEqual(originalHeaders)
    }
    expect(payload).toEqual(ndjsonPayload)
  })

  it('should not compress payload if beacon inspection is enabled', async () => {
    spyOnFunction(utils, 'isBeaconInspectionEnabled').and.returnValue(true)

    const transactions = generateTransaction(1, true).map(tr => {
      const model = performanceMonitoring.createTransactionDataModel(tr)
      return model
    })
    const ndjsonPayload = apmServer
      .ndjsonTransactions(transactions, true)
      .join('')

    const originalHeaders = { 'Content-Type': 'application/x-ndjson' }
    let { payload, headers } = await compressPayload({
      payload: ndjsonPayload,
      headers: originalHeaders
    })

    expect(headers).toEqual(originalHeaders)
    expect(payload).toEqual(ndjsonPayload)
  })
})
