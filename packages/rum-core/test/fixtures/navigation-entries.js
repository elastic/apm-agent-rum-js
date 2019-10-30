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

export const TIMING_LEVEL1_ENTRY = {
  navigationStart: 1572362095174,
  unloadEventStart: 0,
  unloadEventEnd: 0,
  redirectStart: 0,
  redirectEnd: 0,
  fetchStart: 1572362095181,
  domainLookupStart: 1572362095182,
  domainLookupEnd: 1572362095201,
  connectStart: 1572362095201,
  connectEnd: 1572362095269,
  secureConnectionStart: 1572362095229,
  requestStart: 1572362095270,
  responseStart: 1572362095320,
  responseEnd: 1572362095390,
  domLoading: 1572362095346,
  domInteractive: 1572362095723,
  domContentLoadedEventStart: 1572362095815,
  domContentLoadedEventEnd: 1572362095835,
  domComplete: 1572362096143,
  loadEventStart: 1572362096143,
  loadEventEnd: 1572362096145
}

export const TIMING_LEVEL2_ENTRIES = [
  {
    transferSize: 26941,
    encodedBodySize: 105297,
    decodedBodySize: 42687,
    serverTiming: [
      {
        description: '',
        duration: 4,
        name: 'edge'
      },
      {
        description: 'HIT',
        duration: 0,
        name: 'cdn-cache'
      }
    ]
  }
]
