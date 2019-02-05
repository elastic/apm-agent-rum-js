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

const constants = require('./constants')
const slice = [].slice
const Url = require('../common/url')
const rng = require('uuid/lib/rng-browser')

function isCORSSupported () {
  var xhr = new window.XMLHttpRequest()
  return 'withCredentials' in xhr
}

var byteToHex = []
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1)
}

function bytesToHex (buf, offset) {
  var i = offset || 0
  var bth = byteToHex
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return [
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]]
  ].join('')
}

function getDtHeaderValue (span) {
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

function parseDtHeaderValue (value) {
  var parsed = /^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$/.exec(value)
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

function isDtHeaderValid (header) {
  return (
    /^[\da-f]{2}-[\da-f]{32}-[\da-f]{16}-[\da-f]{2}$/.test(header) &&
    header.slice(3, 35) !== '00000000000000000000000000000000' &&
    header.slice(36, 52) !== '0000000000000000'
  )
}

function checkSameOrigin (source, target) {
  let isSame = false
  if (typeof target === 'string') {
    const src = new Url(source)
    const tar = new Url(target)
    isSame = src.origin === tar.origin
  } else if (Array.isArray(target)) {
    target.forEach(function (t) {
      if (!isSame) {
        isSame = checkSameOrigin(source, t)
      }
    })
  }
  return isSame
}

function generateRandomId (length) {
  var id = bytesToHex(rng())
  return id.substr(0, length)
}

function isPlatformSupported () {
  return (
    typeof window !== 'undefined' &&
    typeof Array.prototype.forEach === 'function' &&
    typeof JSON.stringify === 'function' &&
    typeof Function.bind === 'function' &&
    window.performance &&
    typeof window.performance.now === 'function' &&
    isCORSSupported()
  )
}

function sanitizeString (value, limit, required, placeholder) {
  if (typeof value === 'number') {
    value = String(value)
  }
  if (required && !value) {
    value = placeholder || 'NA'
  }
  if (value) {
    return String(value).substr(0, limit)
  } else {
    return value
  }
}

function setTag (key, value, obj) {
  if (!obj || !key) return
  var skey = removeInvalidChars(key)
  obj[skey] = sanitizeString(value, constants.serverStringLimit)
  return obj
}

function sanitizeObjectStrings (obj, limit, required, placeholder) {
  if (!obj) return obj
  if (typeof obj === 'string') {
    return sanitizeString(obj, limit, required, placeholder)
  }
  var keys = Object.keys(obj)
  keys.forEach(function (k) {
    var value = obj[k]
    if (typeof value === 'string') {
      value = sanitizeString(obj[k], limit, required, placeholder)
    } else if (typeof value === 'object') {
      value = sanitizeObjectStrings(value, limit, required, placeholder)
    }
    obj[k] = value
  })
  return obj
}

const navigationTimingKeys = [
  'fetchStart',
  'domainLookupStart',
  'domainLookupEnd',
  'connectStart',
  'connectEnd',
  'secureConnectionStart',
  'requestStart',
  'responseStart',
  'responseEnd',
  'domLoading',
  'domInteractive',
  'domContentLoadedEventStart',
  'domContentLoadedEventEnd',
  'domComplete',
  'loadEventStart',
  'loadEventEnd'
]

function getNavigationTimingMarks () {
  var timing = window.performance.timing
  var fetchStart = timing.fetchStart
  var marks = {}
  navigationTimingKeys.forEach(function (timingKey) {
    var m = timing[timingKey]
    if (m && m >= fetchStart) {
      marks[timingKey] = m - fetchStart
    }
  })
  return marks
}

/**
 * Paint Timing Metrics that is available during page load
 * https://www.w3.org/TR/paint-timing/
 */
function getPaintTimingMarks () {
  var paints = {}
  var perf = window.performance
  if (perf.getEntriesByType) {
    var entries = perf.getEntriesByType('paint')
    if (entries.length > 0) {
      var timings = perf.timing
      /**
       * To avoid capturing the unload event handler effect in paint timings
       */
      var unloadDiff = timings.fetchStart - timings.navigationStart
      for (var i = 0; i < entries.length; i++) {
        var data = entries[i]
        var calcPaintTime = unloadDiff >= 0 ? data.startTime - unloadDiff : data.startTime
        paints[data.name] = calcPaintTime
      }
    }
  }
  return paints
}

function getTimeOrigin () {
  return window.performance.timing.fetchStart
}

function getPageMetadata () {
  return {
    page: {
      referer: document.referrer,
      url: window.location.href
    }
  }
}

function stripQueryStringFromUrl (url) {
  return url && url.split('?')[0]
}

function isObject (value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === 'object'
}

function isFunction (value) {
  return typeof value === 'function'
}

function baseExtend (dst, objs, deep) {
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

function getElasticScript () {
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

function getCurrentScript () {
  if (typeof document !== 'undefined') {
    // Source http://www.2ality.com/2014/05/current-script.html
    var currentScript = document.currentScript
    if (!currentScript) {
      return getElasticScript()
    }
    return currentScript
  }
}

function extend (dst) {
  return baseExtend(dst, slice.call(arguments, 1), false)
}

function merge (dst) {
  return baseExtend(dst, slice.call(arguments, 1), true)
}

function isUndefined (obj) {
  return typeof obj === 'undefined'
}

function noop () {}

function find (array, predicate, thisArg) {
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

function removeInvalidChars (key) {
  return key.replace(/[.*"]/g, '_')
}

module.exports = {
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
  getNavigationTimingMarks,
  getPaintTimingMarks,
  getDtHeaderValue,
  getPageMetadata,
  getCurrentScript,
  getElasticScript,
  getTimeOrigin,
  generateRandomId,
  rng,
  checkSameOrigin,
  sanitizeString,
  sanitizeObjectStrings,
  setTag,
  stripQueryStringFromUrl,
  find,
  removeInvalidChars
}
