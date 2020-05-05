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
import {
  compressTransaction,
  compressMetadata,
  compressError
} from '../../src/common/compress'
import { addTransactionContext } from '../../src/common/context'

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

describe('Compress', function() {
  let serviceFactory
  let apmServer
  let configService
  let performanceMonitoring
  let errorLogging

  beforeEach(function() {
    serviceFactory = createServiceFactory()
    configService = serviceFactory.getService('ConfigService')
    apmServer = serviceFactory.getService('ApmServer')
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

  it('should compress error model', () => {
    const error = generateErrors(1).map((err, i) => {
      let model = errorLogging.createErrorDataModel(err)
      model.id = 'error-id-' + i
      return model
    })[0]
    const compressed = compressError(error)

    testMappedObject(error, compressed)
  })
})
