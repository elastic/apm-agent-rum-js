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

import { Promise } from './polyfills'

const slice = [].slice
const isBrowser = typeof window !== 'undefined'
const PERF = isBrowser && typeof performance !== 'undefined' ? performance : {}

function isCORSSupported() {
  var xhr = new window.XMLHttpRequest()
  return 'withCredentials' in xhr
}

/**
 * Original source is from uuid module to strip `-` in the UUID generation logic
 * https://github.com/uuidjs/uuid/blob/8977966d0061cca33a01a88f5b4893d3304d4840/src/bytesToUuid.js
 */
var byteToHex = []
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1)
}

function bytesToHex(buffer) {
  const hexOctets = []
  for (let i = 0; i < buffer.length; i++) {
    hexOctets.push(byteToHex[buffer[i]])
  }
  return hexOctets.join('')
}

/**
 * Random number generator using crypto.getRandomValues
 * uses msCrypto for supporting IE 11
 * https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
 */
const destination = new Uint8Array(16)

function rng() {
  if (
    typeof crypto != 'undefined' &&
    typeof crypto.getRandomValues == 'function'
  ) {
    return crypto.getRandomValues(destination)
  } else if (
    typeof msCrypto != 'undefined' &&
    typeof msCrypto.getRandomValues == 'function'
  ) {
    return msCrypto.getRandomValues(destination)
  }
  return destination
}

function generateRandomId(length) {
  var id = bytesToHex(rng())
  return id.substr(0, length)
}

function getDtHeaderValue(span) {
  const dtVersion = '00'
  const dtUnSampledFlags = '00'
  // 00000001 ->  '01' -> recorded
  const dtSampledFlags = '01'
  if (span && span.traceId && span.id && span.parentId) {
    var flags = span.sampled ? dtSampledFlags : dtUnSampledFlags
    /**
     * In the case of unsampled traces, propagate transaction id (parentId)
     * instead of span id to the downstream
     */
    var id = span.sampled ? span.id : span.parentId
    return dtVersion + '-' + span.traceId + '-' + id + '-' + flags
  }
}

function parseDtHeaderValue(value) {
  var parsed = /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/.exec(
    value
  )
  if (parsed) {
    var flags = parsed[4]
    var sampled = flags !== '00'
    return {
      traceId: parsed[2],
      id: parsed[3],
      sampled
    }
  }
}

function isDtHeaderValid(header) {
  return (
    /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header) &&
    header.slice(3, 35) !== '00000000000000000000000000000000' &&
    header.slice(36, 52) !== '0000000000000000'
  )
}

function checkSameOrigin(source, target) {
  let isSame = false
  if (typeof target === 'string') {
    isSame = source === target
  } else if (Array.isArray(target)) {
    target.forEach(function(t) {
      if (!isSame) {
        isSame = checkSameOrigin(source, t)
      }
    })
  }
  return isSame
}

function isPlatformSupported() {
  return (
    isBrowser &&
    typeof Set === 'function' &&
    typeof JSON.stringify === 'function' &&
    PERF &&
    typeof PERF.now === 'function' &&
    isCORSSupported()
  )
}

/**
 * Support for boolean and number in the APM server landed in 6.7
 * therefore, we keep these values unchange but convert any other
 * type to string.
 */
function setLabel(key, value, obj) {
  if (!obj || !key) return
  const skey = removeInvalidChars(key)
  let valueType = typeof value
  if (value != undefined && valueType !== 'boolean' && valueType !== 'number') {
    value = String(value)
  }
  obj[skey] = value
  return obj
}

/**
 *  Server timing information on Performance resource timing entries
 *  https://www.w3.org/TR/server-timing/
 *  [
 *    {
 *      name: "cdn-cache",
 *      duration: 0,
 *      desciprion: "HIT"
 *    },
 *    {
 *      name: "edge",
 *      duration: 4,
 *      desciption: ''
 *    }
 *  ]
 *  returns "cdn-cache;desc=HIT, edge;dur=4"
 */
function getServerTimingInfo(serverTimingEntries = []) {
  let serverTimingInfo = []
  const entrySeparator = ', '
  const valueSeparator = ';'
  for (let i = 0; i < serverTimingEntries.length; i++) {
    const { name, duration, description } = serverTimingEntries[i]
    let timingValue = name
    if (description) {
      timingValue += valueSeparator + 'desc=' + description
    }
    if (duration) {
      timingValue += valueSeparator + 'dur=' + duration
    }
    serverTimingInfo.push(timingValue)
  }
  return serverTimingInfo.join(entrySeparator)
}

function getTimeOrigin() {
  return PERF.timing.fetchStart
}

function stripQueryStringFromUrl(url) {
  return url && url.split('?')[0]
}

function isObject(value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === 'object'
}

function isFunction(value) {
  return typeof value === 'function'
}

function baseExtend(dst, objs, deep) {
  for (var i = 0, ii = objs.length; i < ii; ++i) {
    var obj = objs[i]
    if (!isObject(obj) && !isFunction(obj)) continue
    var keys = Object.keys(obj)
    for (var j = 0, jj = keys.length; j < jj; j++) {
      var key = keys[j]
      var src = obj[key]

      if (deep && isObject(src)) {
        if (!isObject(dst[key])) dst[key] = Array.isArray(src) ? [] : {}
        baseExtend(dst[key], [src], false) // only one level of deep merge
      } else {
        dst[key] = src
      }
    }
  }

  return dst
}

function getElasticScript() {
  if (typeof document !== 'undefined') {
    var scripts = document.getElementsByTagName('script')
    for (var i = 0, l = scripts.length; i < l; i++) {
      var sc = scripts[i]
      if (sc.src.indexOf('elastic') > 0) {
        return sc
      }
    }
  }
}

function getCurrentScript() {
  if (typeof document !== 'undefined') {
    // Source http://www.2ality.com/2014/05/current-script.html
    var currentScript = document.currentScript
    if (!currentScript) {
      return getElasticScript()
    }
    return currentScript
  }
}

function extend(dst) {
  return baseExtend(dst, slice.call(arguments, 1), false)
}

function merge(dst) {
  return baseExtend(dst, slice.call(arguments, 1), true)
}

function isUndefined(obj) {
  return typeof obj === 'undefined'
}

function noop() {}

function find(array, predicate, thisArg) {
  // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
  if (array == null) {
    throw new TypeError('array is null or not defined')
  }

  var o = Object(array)
  var len = o.length >>> 0

  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function')
  }

  var k = 0

  while (k < len) {
    var kValue = o[k]
    if (predicate.call(thisArg, kValue, k, o)) {
      return kValue
    }
    k++
  }

  return undefined
}

function removeInvalidChars(key) {
  return key.replace(/[.*"]/g, '_')
}

function getLatestNonXHRSpan(spans) {
  let latestSpan = null
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i]
    if (
      String(span.type).indexOf('external') === -1 &&
      (!latestSpan || latestSpan._end < span._end)
    ) {
      latestSpan = span
    }
  }
  return latestSpan
}

function getEarliestSpan(spans) {
  let earliestSpan = spans[0]
  for (let i = 1; i < spans.length; i++) {
    const span = spans[i]
    if (earliestSpan._start > span._start) {
      earliestSpan = span
    }
  }
  return earliestSpan
}

function now() {
  return PERF.now()
}

function getTime(time) {
  return typeof time === 'number' && time >= 0 ? time : now()
}

function getDuration(start, end) {
  if (isUndefined(end) || isUndefined(start)) {
    return null
  }
  return parseInt(end - start)
}

function scheduleMacroTask(callback) {
  setTimeout(callback, 0)
}

function scheduleMicroTask(callback) {
  Promise.resolve().then(callback)
}

/**
 * Check if performance Timeline is supported in browsers
 * Performane Timeline imples `getEntriesByType`
 */
function isPerfTimelineSupported() {
  return typeof PERF.getEntriesByType === 'function'
}

function isPerfTypeSupported(type) {
  return (
    typeof PerformanceObserver !== 'undefined' &&
    PerformanceObserver.supportedEntryTypes &&
    PerformanceObserver.supportedEntryTypes.indexOf(type) >= 0
  )
}

export {
  extend,
  merge,
  isUndefined,
  noop,
  baseExtend,
  bytesToHex,
  isCORSSupported,
  isObject,
  isFunction,
  isPlatformSupported,
  isDtHeaderValid,
  parseDtHeaderValue,
  getServerTimingInfo,
  getDtHeaderValue,
  getCurrentScript,
  getElasticScript,
  getTimeOrigin,
  generateRandomId,
  getEarliestSpan,
  getLatestNonXHRSpan,
  getDuration,
  getTime,
  now,
  rng,
  checkSameOrigin,
  scheduleMacroTask,
  scheduleMicroTask,
  setLabel,
  stripQueryStringFromUrl,
  find,
  removeInvalidChars,
  PERF,
  isPerfTimelineSupported,
  isBrowser,
  isPerfTypeSupported
}
