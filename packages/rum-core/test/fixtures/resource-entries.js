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

/* eslint-disable max-len */
module.exports = [
  {
    name: null,
    initiatorType: 'script',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: 168.25
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: 0
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: undefined
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: null
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: Number(new Date())
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: undefined,
    responseEnd: 168.25
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: null,
    responseEnd: 168.25
  },
  {
    name: 'should not be seen',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: Number(new Date()),
    responseEnd: 168.25
  },
  {
    name: 'http://ajax-filter.test',
    initiatorType: null,
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: 168.25
  },
  {
    name: 'http://beacon.test',
    initiatorType: 'beacon',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: 168.25
  },
  {
    name: 'http://testing.com',
    initiatorType: 'script',
    entryType: 'resource',
    startTime: 25.220000000000002,
    responseEnd: 168.25
  },
  {
    name: 'http://example.com',
    entryType: 'resource',
    startTime: 25.220000000000002,
    duration: 143.03,
    initiatorType: 'test',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 25.220000000000002,
    domainLookupStart: 25.220000000000002,
    domainLookupEnd: 25.220000000000002,
    connectStart: 25.220000000000002,
    connectEnd: 25.220000000000002,
    secureConnectionStart: 0,
    requestStart: 62.91000000000001,
    responseStart: 65.06500000000001,
    responseEnd: 168.25,
    transferSize: 97918,
    encodedBodySize: 97717,
    decodedBodySize: 97717,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/node_modules/karma-jasmine/lib/boot.js?945a38bf4e45ad2770eb94868231905a04a0bd3e',
    entryType: 'resource',
    startTime: 25.385,
    duration: 147.41500000000002,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 25.385,
    domainLookupStart: 25.385,
    domainLookupEnd: 25.385,
    connectStart: 25.385,
    connectEnd: 25.385,
    secureConnectionStart: 0,
    requestStart: 63.075,
    responseStart: 67.685,
    responseEnd: 172.8,
    transferSize: 1507,
    encodedBodySize: 1308,
    decodedBodySize: 1308,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/node_modules/karma-jasmine/lib/adapter.js?1e4f995124c2f01998fd4f3e16ace577bf155ba9',
    entryType: 'resource',
    startTime: 25.515000000000004,
    duration: 148.53,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 25.515000000000004,
    domainLookupStart: 25.515000000000004,
    domainLookupEnd: 25.515000000000004,
    connectStart: 25.515000000000004,
    connectEnd: 25.515000000000004,
    secureConnectionStart: 0,
    requestStart: 63.155,
    responseStart: 68.805,
    responseEnd: 174.04500000000002,
    transferSize: 10545,
    encodedBodySize: 10345,
    decodedBodySize: 10345,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/tmp/globals.js?2bb0399ca4cd37090f3846e0b277f280c8e3e9fe',
    entryType: 'resource',
    startTime: 25.640000000000004,
    duration: 149.69,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 25.640000000000004,
    domainLookupStart: 25.640000000000004,
    domainLookupEnd: 25.640000000000004,
    connectStart: 25.640000000000004,
    connectEnd: 25.640000000000004,
    secureConnectionStart: 0,
    requestStart: 63.41000000000001,
    responseStart: 69.47,
    responseEnd: 175.33,
    transferSize: 358,
    encodedBodySize: 160,
    decodedBodySize: 160,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/node_modules/elastic-apm-js-zone/dist/zone.js?f5c50b5700ad20ee9b4a77b87668194c3e1fd854',
    entryType: 'resource',
    startTime: 25.76,
    duration: 150.36000000000004,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 25.76,
    domainLookupStart: 25.76,
    domainLookupEnd: 25.76,
    connectStart: 25.76,
    connectEnd: 25.76,
    secureConnectionStart: 0,
    requestStart: 63.485,
    responseStart: 69.995,
    responseEnd: 176.12000000000003,
    transferSize: 96480,
    encodedBodySize: 96279,
    decodedBodySize: 96279,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/utils/polyfill.js?6fc35a7768d983f48c91a59b2684c94034649b7b',
    entryType: 'resource',
    startTime: 25.880000000000003,
    duration: 150.985,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 25.880000000000003,
    domainLookupStart: 25.880000000000003,
    domainLookupEnd: 25.880000000000003,
    connectStart: 25.880000000000003,
    connectEnd: 25.880000000000003,
    secureConnectionStart: 0,
    requestStart: 64.345,
    responseStart: 70.985,
    responseEnd: 176.865,
    transferSize: 3159,
    encodedBodySize: 2960,
    decodedBodySize: 2960,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/common/apm-server.spec.js?df690a94bba8303d7ef5e9d15b51f7ef74574814',
    entryType: 'resource',
    startTime: 26.000000000000004,
    duration: 314.65500000000003,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.000000000000004,
    domainLookupStart: 26.000000000000004,
    domainLookupEnd: 26.000000000000004,
    connectStart: 26.000000000000004,
    connectEnd: 26.000000000000004,
    secureConnectionStart: 0,
    requestStart: 75.32000000000001,
    responseStart: 79.98,
    responseEnd: 340.65500000000003,
    transferSize: 988400,
    encodedBodySize: 988199,
    decodedBodySize: 988199,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/common/config-service.spec.js?889e88d47d45948d3f220bec7a613431096facee',
    entryType: 'resource',
    startTime: 26.150000000000002,
    duration: 152.70000000000002,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.150000000000002,
    domainLookupStart: 26.150000000000002,
    domainLookupEnd: 26.150000000000002,
    connectStart: 26.150000000000002,
    connectEnd: 26.150000000000002,
    secureConnectionStart: 0,
    requestStart: 75.44500000000001,
    responseStart: 82.235,
    responseEnd: 178.85000000000002,
    transferSize: 185299,
    encodedBodySize: 185098,
    decodedBodySize: 185098,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/common/service-factory.spec.js?a6fd2f6a53d3759b5005ac31a54b998b9773304b',
    entryType: 'resource',
    startTime: 26.285000000000004,
    duration: 154.65,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.285000000000004,
    domainLookupStart: 26.285000000000004,
    domainLookupEnd: 26.285000000000004,
    connectStart: 26.285000000000004,
    connectEnd: 26.285000000000004,
    secureConnectionStart: 0,
    requestStart: 75.54,
    responseStart: 83.69,
    responseEnd: 180.935,
    transferSize: 272480,
    encodedBodySize: 272279,
    decodedBodySize: 272279,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/common/utils.spec.js?a6be2b3e33f1898e7d92afeb63988940c991de93',
    entryType: 'resource',
    startTime: 26.405,
    duration: 155.33,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.405,
    domainLookupStart: 26.405,
    domainLookupEnd: 26.405,
    connectStart: 26.405,
    connectEnd: 26.405,
    secureConnectionStart: 0,
    requestStart: 75.635,
    responseStart: 84.56000000000002,
    responseEnd: 181.735,
    transferSize: 125029,
    encodedBodySize: 124828,
    decodedBodySize: 124828,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/error-logging/error-logging.spec.js?a6907ca77c364fa115e18ed34f15cb3ddd12a8a7',
    entryType: 'resource',
    startTime: 26.520000000000003,
    duration: 323.165,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.520000000000003,
    domainLookupStart: 26.520000000000003,
    domainLookupEnd: 26.520000000000003,
    connectStart: 26.520000000000003,
    connectEnd: 26.520000000000003,
    secureConnectionStart: 0,
    requestStart: 75.74,
    responseStart: 88.56000000000002,
    responseEnd: 349.685,
    transferSize: 1004083,
    encodedBodySize: 1003882,
    decodedBodySize: 1003882,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/error-logging/stack-trace-service.spec.js?ebb9fb5e90b1cf7b286c2b26daeed51f86c57545',
    entryType: 'resource',
    startTime: 26.635,
    duration: 323.80500000000006,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.635,
    domainLookupStart: 26.635,
    domainLookupEnd: 26.635,
    connectStart: 26.635,
    connectEnd: 26.635,
    secureConnectionStart: 0,
    requestStart: 78.775,
    responseStart: 90.275,
    responseEnd: 350.44000000000005,
    transferSize: 987262,
    encodedBodySize: 987061,
    decodedBodySize: 987061,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/performance-monitoring/performance-monitoring.spec.js?a3d8e3aa88d6f7c94386d195420602b872a662f5',
    entryType: 'resource',
    startTime: 26.755000000000003,
    duration: 324.96500000000003,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.755000000000003,
    domainLookupStart: 26.755000000000003,
    domainLookupEnd: 26.755000000000003,
    connectStart: 26.755000000000003,
    connectEnd: 26.755000000000003,
    secureConnectionStart: 0,
    requestStart: 92.28,
    responseStart: 97.72,
    responseEnd: 351.72,
    transferSize: 1002841,
    encodedBodySize: 1002640,
    decodedBodySize: 1002640,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/performance-monitoring/transaction-service.spec.js?6456ebcc9d1a95033e60cde7a5e6144bdadeda53',
    entryType: 'resource',
    startTime: 26.875000000000004,
    duration: 230.34500000000003,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 26.875000000000004,
    domainLookupStart: 26.875000000000004,
    domainLookupEnd: 26.875000000000004,
    connectStart: 26.875000000000004,
    connectEnd: 26.875000000000004,
    secureConnectionStart: 0,
    requestStart: 92.94500000000001,
    responseStart: 100.63000000000001,
    responseEnd: 257.22,
    transferSize: 629994,
    encodedBodySize: 629793,
    decodedBodySize: 629793,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/performance-monitoring/transaction.spec.js?24c11848ccdb46774cf56164f2db7166dde0ffb8',
    entryType: 'resource',
    startTime: 27.035000000000004,
    duration: 160.57000000000002,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 27.035000000000004,
    domainLookupStart: 27.035000000000004,
    domainLookupEnd: 27.035000000000004,
    connectStart: 27.035000000000004,
    connectEnd: 27.035000000000004,
    secureConnectionStart: 0,
    requestStart: 95.745,
    responseStart: 101.71500000000002,
    responseEnd: 187.60500000000002,
    transferSize: 246427,
    encodedBodySize: 246226,
    decodedBodySize: 246226,
    serverTiming: []
  },
  {
    name:
      'http://localhost:9876/base/test/performance-monitoring/zone-service.spec.js?3ce84ffadbb223d4c7e2d349740137aff060aa47',
    entryType: 'resource',
    startTime: 27.180000000000003,
    duration: 161.54000000000002,
    initiatorType: 'script',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 27.180000000000003,
    domainLookupStart: 27.180000000000003,
    domainLookupEnd: 27.180000000000003,
    connectStart: 27.180000000000003,
    connectEnd: 27.180000000000003,
    secureConnectionStart: 0,
    requestStart: 111.25000000000001,
    responseStart: 112.905,
    responseEnd: 188.72000000000003,
    transferSize: 420580,
    encodedBodySize: 420379,
    decodedBodySize: 420379,
    serverTiming: []
  },
  {
    name: 'http://non-existing.com/v1/client-side/transactions',
    entryType: 'resource',
    startTime: 707.23,
    duration: 150.66500000000008,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 707.23,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 857.8950000000001,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/errors',
    entryType: 'resource',
    startTime: 1619.825,
    duration: 5.664999999999964,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 1619.825,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 1625.49,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/errors',
    entryType: 'resource',
    startTime: 1625.88,
    duration: 4.135000000000218,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 1625.88,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 1630.0150000000003,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/errors',
    entryType: 'resource',
    startTime: 1633.93,
    duration: 5.349999999999909,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 1633.93,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 1639.28,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/errors',
    entryType: 'resource',
    startTime: 1639.69,
    duration: 6.430000000000064,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 1639.69,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 1646.1200000000001,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/errors',
    entryType: 'resource',
    startTime: 1648.775,
    duration: 8.569999999999936,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 1648.775,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 1657.345,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/errors',
    entryType: 'resource',
    startTime: 1657.7600000000002,
    duration: 8.294999999999845,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 1657.7600000000002,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 1666.055,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/transactions',
    entryType: 'resource',
    startTime: 2796.3600000000006,
    duration: 36.18499999999949,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 2796.3600000000006,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 2832.545,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  },
  {
    name: 'http://localhost:8200/v1/client-side/transactions',
    entryType: 'resource',
    startTime: 2833.295,
    duration: 5.945000000000164,
    initiatorType: 'xmlhttprequest',
    nextHopProtocol: 'http/1.1',
    workerStart: 0,
    redirectStart: 0,
    redirectEnd: 0,
    fetchStart: 2833.295,
    domainLookupStart: 0,
    domainLookupEnd: 0,
    connectStart: 0,
    connectEnd: 0,
    secureConnectionStart: 0,
    requestStart: 0,
    responseStart: 0,
    responseEnd: 2839.2400000000002,
    transferSize: 0,
    encodedBodySize: 0,
    decodedBodySize: 0,
    serverTiming: []
  }
]
