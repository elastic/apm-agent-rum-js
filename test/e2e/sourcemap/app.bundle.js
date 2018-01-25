/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["elastic-apm-js-base"] = factory();
	else
		root["elastic-apm-js-base"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var slice = [].slice;

function isCORSSupported() {
  var xhr = new window.XMLHttpRequest();
  return 'withCredentials' in xhr;
}

function isPlatformSupported() {
  return typeof window !== 'undefined' && typeof Array.prototype.forEach === 'function' && typeof JSON.stringify === 'function' && typeof Function.bind === 'function' && window.performance && typeof window.performance.now === 'function' && isCORSSupported();
}

module.exports = {
  getViewPortInfo: function getViewPort() {
    var e = document.documentElement;
    var g = document.getElementsByTagName('body')[0];
    var x = window.innerWidth || e.clientWidth || g.clientWidth;
    var y = window.innerHeight || e.clientHeight || g.clientHeight;

    return {
      width: x,
      height: y
    };
  },

  mergeObject: function mergeObject(o1, o2) {
    var a;
    var o3 = {};

    for (a in o1) {
      o3[a] = o1[a];
    }

    for (a in o2) {
      o3[a] = o2[a];
    }

    return o3;
  },

  extend: function extend(dst) {
    return this.baseExtend(dst, slice.call(arguments, 1), false);
  },

  merge: function merge(dst) {
    return this.baseExtend(dst, slice.call(arguments, 1), true);
  },

  baseExtend: function baseExtend(dst, objs, deep) {
    for (var i = 0, ii = objs.length; i < ii; ++i) {
      var obj = objs[i];
      if (!isObject(obj) && !isFunction(obj)) continue;
      var keys = Object.keys(obj);
      for (var j = 0, jj = keys.length; j < jj; j++) {
        var key = keys[j];
        var src = obj[key];

        if (deep && isObject(src)) {
          if (!isObject(dst[key])) dst[key] = Array.isArray(src) ? [] : {};
          baseExtend(dst[key], [src], false); // only one level of deep merge
        } else {
          dst[key] = src;
        }
      }
    }

    return dst;
  },

  isObject: isObject,

  isFunction: isFunction,

  arrayReduce: function arrayReduce(arrayValue, callback, value) {
    // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
    if (arrayValue == null) {
      throw new TypeError('Array.prototype.reduce called on null or undefined');
    }
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    var t = Object(arrayValue);
    var len = t.length >>> 0;
    var k = 0;

    if (!value) {
      while (k < len && !(k in t)) {
        k++;
      }
      if (k >= len) {
        throw new TypeError('Reduce of empty array with no initial value');
      }
      value = t[k++];
    }

    for (; k < len; k++) {
      if (k in t) {
        value = callback(value, t[k], k, t);
      }
    }
    return value;
  },

  arraySome: function arraySome(value, callback, thisArg) {
    // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
    if (value == null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }

    if (typeof callback !== 'function') {
      throw new TypeError();
    }

    var t = Object(value);
    var len = t.length >>> 0;

    if (!thisArg) {
      thisArg = void 0;
    }

    for (var i = 0; i < len; i++) {
      if (i in t && callback.call(thisArg, t[i], i, t)) {
        return true;
      }
    }
    return false;
  },

  arrayMap: function arrayMap(arrayValue, callback, thisArg) {
    // Source https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Map
    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }
    var O = Object(arrayValue);
    var len = O.length >>> 0;

    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }
    if (arguments.length > 1) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
      var kValue, mappedValue;
      if (k in O) {
        kValue = O[k];
        mappedValue = callback.call(T, kValue, k, O);
        A[k] = mappedValue;
      }
      k++;
    }
    return A;
  },

  arrayIndexOf: function arrayIndexOf(arrayVal, searchElement, fromIndex) {
    // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
    var k;
    if (arrayVal == null) {
      throw new TypeError('"arrayVal" is null or not defined');
    }

    var o = Object(arrayVal);
    var len = o.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    if (n >= len) {
      return -1;
    }

    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    while (k < len) {
      if (k in o && o[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  },

  functionBind: function functionBind(func, oThis) {
    // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
    var aArgs = Array.prototype.slice.call(arguments, 2);
    var FNOP = function FNOP() {};
    var fBound = function fBound() {
      return func.apply(oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
    };

    FNOP.prototype = func.prototype;
    fBound.prototype = new FNOP();
    return fBound;
  },

  getRandomInt: function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  isUndefined: function isUndefined(obj) {
    return typeof obj === 'undefined';
  },

  isCORSSupported: isCORSSupported,
  getElasticScript: function getElasticScript() {
    if (typeof document !== 'undefined') {
      var scripts = document.getElementsByTagName('script');
      for (var i = 0, l = scripts.length; i < l; i++) {
        var sc = scripts[i];
        if (sc.src.indexOf('elastic') > 0) {
          return sc;
        }
      }
    }
  },

  getCurrentScript: function getCurrentScript() {
    if (typeof document !== 'undefined') {
      // Source http://www.2ality.com/2014/05/current-script.html
      var currentScript = document.currentScript;
      if (!currentScript) {
        return this.getElasticScript();
      }
      return currentScript;
    }
  },

  generateUuid: function generateUuid() {
    function _p8(s) {
      var p = (Math.random().toString(16) + '000000000').substr(2, 8);
      return s ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
  },

  parseUrl: function parseUrl(url) {
    // source: angular.js/$LocationProvider
    var PATH_MATCH = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/;
    var match = PATH_MATCH.exec(url);
    var path = match[1] || '';
    var queryString = match[3] || '';
    var hash = match[5] ? '#' + match[5] : '';

    var protocol = '';
    if (url.indexOf('://') > -1) {
      protocol = url.split('://')[0] + ':';
    }

    var params = {};
    var queries = queryString.split('&');
    for (var i = 0, l = queries.length; i < l; i++) {
      var query = queries[i];
      if (query === '' || typeof query === 'undefined' || query === null) {
        continue;
      }
      var keyvalue = queries[i].split('=');
      var key = keyvalue.shift();
      params[key] = keyvalue.join('=');
    }
    return { protocol: protocol, path: path, queryString: queryString, queryStringParsed: params, hash: hash };
  },

  isPlatformSupported: isPlatformSupported
};

function isObject(value) {
  // http://jsperf.com/isobject4
  return value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

function isFunction(value) {
  return typeof value === 'function';
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function Subscription() {
  this.subscriptions = [];
}

Subscription.prototype.subscribe = function (fn) {
  var self = this;
  this.subscriptions.push(fn);

  return function () {
    var index = self.subscriptions.indexOf(fn);
    if (index > -1) {
      self.subscriptions.splice(index, 1);
    }
  };
};

Subscription.prototype.applyAll = function (applyTo, applyWith) {
  this.subscriptions.forEach(function (fn) {
    try {
      fn.apply(applyTo, applyWith);
    } catch (error) {
      console.log(error, error.stack);
    }
  }, this);
};

module.exports = Subscription;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  apmSymbol: apmSymbol,
  patchMethod: patchMethod
};

function apmSymbol(name) {
  return '__apm_symbol__' + name;
}

function patchMethod(target, name, patchFn) {
  var proto = target;
  while (proto && !proto.hasOwnProperty(name)) {
    proto = Object.getPrototypeOf(proto);
  }
  if (!proto && target[name]) {
    // somehow we did not find it, but we can see it. This happens on IE for Window properties.
    proto = target;
  }
  var delegateName = apmSymbol(name);
  var delegate;
  if (proto && !(delegate = proto[delegateName])) {
    delegate = proto[delegateName] = proto[name];
    proto[name] = createNamedFn(name, patchFn(delegate, delegateName, name));
  }
  return delegate;
}

function createNamedFn(name, delegate) {
  try {
    return Function('f', 'return function ' + name + '(){return f(this, arguments)}')(delegate); // eslint-disable-line
  } catch (e) {
    // if we fail, we must be CSP, just return delegate.
    return function () {
      return delegate(this, arguments);
    };
  }
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// export public core APIs.

var ErrorLogging = __webpack_require__(9);
var PerformanceMonitoring = __webpack_require__(16);

var ServiceFactory = __webpack_require__(22);
var utils = __webpack_require__(0);
module.exports = {
  createServiceFactory: function createServiceFactory() {
    var serviceFactory = new ServiceFactory();
    serviceFactory.registerCoreServices();
    ErrorLogging.registerServices(serviceFactory);
    PerformanceMonitoring.registerServices(serviceFactory);
    return serviceFactory;
  },
  ServiceFactory: ServiceFactory,
  patchCommon: __webpack_require__(28),
  utils: utils
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var rng = __webpack_require__(11);
var bytesToUuid = __webpack_require__(12);

function v4(options, buf, offset) {
  var i = buf && offset || 0;

  if (typeof options == 'string') {
    buf = options == 'binary' ? new Array(16) : null;
    options = null;
  }
  options = options || {};

  var rnds = options.random || (options.rng || rng)();

  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80;

  // Copy bytes to buffer, if provided
  if (buf) {
    for (var ii = 0; ii < 16; ++ii) {
      buf[i + ii] = rnds[ii];
    }
  }

  return buf || bytesToUuid(rnds);
}

module.exports = v4;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var g;

// This works in non-strict mode
g = function () {
	return this;
}();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1, eval)("this");
} catch (e) {
	// This works if the window reference is available
	if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(0);

function Span(signature, type, options) {
  var opts = options || {};
  if (typeof opts.onSpanEnd === 'function') {
    this.onSpanEnd = opts.onSpanEnd;
  } else {
    this.onSpanEnd = function () {};
  }
  this.signature = signature;
  this.type = type;
  this.ended = false;
  this._end = null;

  // Start timers
  this._start = window.performance.now();
}

Span.prototype.end = function () {
  this._end = window.performance.now();

  this.ended = true;
  this.onSpanEnd(this);
};

Span.prototype.duration = function () {
  if (utils.isUndefined(this.ended) || utils.isUndefined(this._start)) {
    return null;
  }

  var diff = this._end - this._start;

  return parseFloat(diff);
};

module.exports = Span;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bootstrap = __webpack_require__(8);
var enabled = bootstrap();

var apmCore = __webpack_require__(3);
var ApmBase = __webpack_require__(31);

var serviceFactory = apmCore.createServiceFactory();

var apmBase = new ApmBase(serviceFactory, !enabled);

if (typeof window !== 'undefined') {
  window.elasticApm = apmBase;
}

var _exports = {
  __esModule: true,
  default: apmBase.init.bind(apmBase),
  init: apmBase.init.bind(apmBase),
  ApmBase: ApmBase,
  apmBase: apmBase
};

module.exports = _exports;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var alreadyBootstrap = false;
var enabled = false;
module.exports = function bootstrap() {
  if (alreadyBootstrap) {
    return enabled;
  }
  alreadyBootstrap = true;

  var apmCore = __webpack_require__(3);
  if (apmCore.utils.isPlatformSupported()) {
    __webpack_require__(30);
    apmCore.patchCommon();
    enabled = true;
  } else {
    console.log('APM: Platform is not supported!');
  }

  return enabled;
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ErrorLogging = __webpack_require__(10);

module.exports = {
  ErrorLogging: ErrorLogging,
  registerServices: function registerServices(serviceFactory) {
    serviceFactory.registerServiceCreator('ErrorLogging', function () {
      var apmService = serviceFactory.getService('ApmServer');
      var configService = serviceFactory.getService('ConfigService');
      return new ErrorLogging(apmService, configService);
    });
  }
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var uuidv4 = __webpack_require__(4);
var StackTraceService = __webpack_require__(13);

var utils = __webpack_require__(0);

var ErrorLogging = function () {
  function ErrorLogging(apmServer, configService) {
    _classCallCheck(this, ErrorLogging);

    this._apmServer = apmServer;
    this._configService = configService;
    this._stackTraceService = new StackTraceService(configService);
  }

  // errorEvent = {message, filename, lineno, colno, error}


  _createClass(ErrorLogging, [{
    key: 'createErrorDataModel',
    value: function createErrorDataModel(errorEvent) {
      var filePath = this._stackTraceService.cleanFilePath(errorEvent.filename);
      var fileName = this._stackTraceService.filePathToFileName(filePath);
      var culprit;
      var frames = this._stackTraceService.createStackTraces(errorEvent);
      frames = this._stackTraceService.filterInvalidFrames(frames);

      if (!fileName && frames.length) {
        var lastFrame = frames[frames.length - 1];
        if (lastFrame.filename) {
          fileName = lastFrame.filename;
        } else {
          // If filename empty, assume inline script
          fileName = '(inline script)';
        }
      }

      if (this._stackTraceService.isFileInline(filePath)) {
        culprit = '(inline script)';
      } else {
        culprit = fileName;
      }

      var message = errorEvent.message || errorEvent.error && errorEvent.error.message;
      var errorType = errorEvent.error ? errorEvent.error.name : undefined;
      if (!errorType) {
        // Try to extract type from message formatted like 'ReferenceError: Can't find variable: initHighlighting'
        if (message && message.indexOf(':') > -1) {
          errorType = message.split(':')[0];
        } else {
          errorType = '';
        }
      }

      var configContext = this._configService.get('context');
      var errorContext;
      if (errorEvent.error) {
        errorContext = this._getErrorProperties(errorEvent.error);
      }
      var browserMetadata = this._getBrowserSpecificMetadata();
      var context = utils.merge({}, browserMetadata, configContext, errorContext);

      var errorObject = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        culprit: culprit,
        exception: {
          message: message,
          stacktrace: frames,
          type: errorType
        },
        context: context
      };
      return errorObject;
    }
  }, {
    key: 'logErrorEvent',
    value: function logErrorEvent(errorEvent) {
      if (typeof errorEvent === 'undefined') {
        return;
      }
      var errorObject = this.createErrorDataModel(errorEvent);
      if (typeof errorObject.exception.message === 'undefined') {
        return;
      }
      return this._apmServer.sendErrors([errorObject]);
    }
  }, {
    key: 'registerGlobalEventListener',
    value: function registerGlobalEventListener() {
      var errorLogging = this;
      window.onerror = function (messageOrEvent, source, lineno, colno, error) {
        var errorEvent;
        if (typeof messageOrEvent !== 'undefined' && typeof messageOrEvent !== 'string') {
          errorEvent = messageOrEvent;
        } else {
          errorEvent = {
            message: messageOrEvent,
            filename: source,
            lineno: lineno,
            colno: colno,
            error: error
          };
        }
        errorLogging.logErrorEvent(errorEvent);
      };
    }
  }, {
    key: 'logError',
    value: function logError(messageOrError) {
      var errorEvent = {};
      if (typeof messageOrError === 'string') {
        errorEvent.message = messageOrError;
      } else {
        errorEvent.error = messageOrError;
      }
      return this.logErrorEvent(errorEvent);
    }
  }, {
    key: '_getErrorProperties',
    value: function _getErrorProperties(error) {
      var properties = {};
      Object.keys(error).forEach(function (key) {
        if (key === 'stack') return;
        var val = error[key];
        if (val === null) return; // null is typeof object and well break the switch below
        switch (typeof val === 'undefined' ? 'undefined' : _typeof(val)) {
          case 'function':
            return;
          case 'object':
            // ignore all objects except Dates
            if (typeof val.toISOString !== 'function') return;
            val = val.toISOString();
        }
        properties[key] = val;
      });
      return properties;
    }
  }, {
    key: '_getBrowserSpecificMetadata',
    value: function _getBrowserSpecificMetadata() {
      var viewportInfo = utils.getViewPortInfo();
      var metadata = {
        'environment': {
          'browserWidth': viewportInfo.width,
          'browserHeight': viewportInfo.height,
          'screenWidth': window.screen.width,
          'screenHeight': window.screen.height,
          'language': navigator.language,
          'userAgent': navigator.userAgent,
          'platform': navigator.platform
        },
        'page': {
          'referer': document.referrer,
          'host': document.domain,
          'location': window.location.href
        }
      };

      return metadata;
    }
  }]);

  return ErrorLogging;
}();

module.exports = ErrorLogging;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

// Unique ID creation requires a high quality random # generator.  In the
// browser this is a little complicated due to unknown quality of Math.random()
// and inconsistent support for the `crypto` API.  We do the best we can via
// feature-detection
var rng;

var crypto = global.crypto || global.msCrypto; // for IE 11
if (crypto && crypto.getRandomValues) {
  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef
  rng = function whatwgRNG() {
    crypto.getRandomValues(rnds8);
    return rnds8;
  };
}

if (!rng) {
  // Math.random()-based (RNG)
  //
  // If all else fails, use Math.random().  It's fast, but is of unspecified
  // quality.
  var rnds = new Array(16);
  rng = function rng() {
    for (var i = 0, r; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return rnds;
  };
}

module.exports = rng;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */
var byteToHex = [];
for (var i = 0; i < 256; ++i) {
  byteToHex[i] = (i + 0x100).toString(16).substr(1);
}

function bytesToUuid(buf, offset) {
  var i = offset || 0;
  var bth = byteToHex;
  return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
}

module.exports = bytesToUuid;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var errorStackParser = __webpack_require__(14);

var StackTraceService = function () {
  function StackTraceService(configService) {
    _classCallCheck(this, StackTraceService);

    this._configService = configService;
  }

  _createClass(StackTraceService, [{
    key: 'createStackTraces',
    value: function createStackTraces(errorEvent) {
      var stackTraceService = this;
      var error = errorEvent.error;

      var stackTraces;
      if (error) {
        stackTraces = errorStackParser.parse(error);
      }

      if (!stackTraces || stackTraces.length === 0) {
        stackTraces = [{
          'fileName': errorEvent.filename,
          'lineNumber': errorEvent.lineno,
          'columnNumber': errorEvent.colno
        }];
      }

      stackTraces = ErrorStackNormalizer(stackTraces);

      stackTraces = stackTraces.map(function (stack) {
        if (!stack.fileName && !stack.lineNumber) {
          return {};
        }
        if (!stack.columnNumber && !stack.lineNumber) {
          return {};
        }

        var filePath = stackTraceService.cleanFilePath(stack.fileName);
        var fileName = stackTraceService.filePathToFileName(filePath);

        if (stackTraceService.isFileInline(filePath)) {
          fileName = '(inline script)';
        }

        return {
          'abs_path': stack.fileName,
          'filename': fileName,
          'function': stack.functionName || '<anonymous>',
          'lineno': stack.lineNumber,
          'colno': stack.columnNumber
        };
      });

      return stackTraces;
    }
  }, {
    key: 'filterInvalidFrames',
    value: function filterInvalidFrames(frames) {
      var result = [];
      if (Array.isArray(frames)) {
        result = frames.filter(function (f) {
          return typeof f['filename'] !== 'undefined' && typeof f['lineno'] !== 'undefined';
        });
      }
      return result;
    }
  }, {
    key: 'filePathToFileName',
    value: function filePathToFileName(fileUrl) {
      var origin = window.location.origin || window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

      if (fileUrl.indexOf(origin) > -1) {
        fileUrl = fileUrl.replace(origin + '/', '');
      }

      return fileUrl;
    }
  }, {
    key: 'cleanFilePath',
    value: function cleanFilePath(filePath) {
      if (!filePath) {
        filePath = '';
      }

      if (filePath === '<anonymous>') {
        filePath = '';
      }

      return filePath;
    }
  }, {
    key: 'isFileInline',
    value: function isFileInline(fileUrl) {
      if (fileUrl) {
        return window.location.href.indexOf(fileUrl) === 0;
      } else {
        return false;
      }
    }
  }]);

  return StackTraceService;
}();

function ErrorStackNormalizer(stackFrames) {
  return stackFrames.map(function (frame) {
    if (frame.functionName) {
      frame.functionName = normalizeFunctionName(frame.functionName);
    }
    return frame;
  });
}

function normalizeFunctionName(fnName) {
  // SpinderMonkey name convetion (https://developer.mozilla.org/en-US/docs/Tools/Debugger-API/Debugger.Object#Accessor_Properties_of_the_Debugger.Object_prototype)

  // We use a/b to refer to the b defined within a
  var parts = fnName.split('/');
  if (parts.length > 1) {
    fnName = ['Object', parts[parts.length - 1]].join('.');
  } else {
    fnName = parts[0];
  }

  // a< to refer to a function that occurs somewhere within an expression that is assigned to a.
  fnName = fnName.replace(/.<$/gi, '.<anonymous>');

  // Normalize IE's 'Anonymous function'
  fnName = fnName.replace(/^Anonymous function$/, '<anonymous>');

  // Always use the last part
  parts = fnName.split('.');
  if (parts.length > 1) {
    fnName = parts[parts.length - 1];
  } else {
    fnName = parts[0];
  }

  return fnName;
}

module.exports = StackTraceService;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */

    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(15)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
})(undefined, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    function _map(array, fn, thisArg) {
        if (typeof Array.prototype.map === 'function') {
            return array.map(fn, thisArg);
        } else {
            var output = new Array(array.length);
            for (var i = 0; i < array.length; i++) {
                output[i] = fn.call(thisArg, array[i]);
            }
            return output;
        }
    }

    function _filter(array, fn, thisArg) {
        if (typeof Array.prototype.filter === 'function') {
            return array.filter(fn, thisArg);
        } else {
            var output = [];
            for (var i = 0; i < array.length; i++) {
                if (fn.call(thisArg, array[i])) {
                    output.push(array[i]);
                }
            }
            return output;
        }
    }

    function _indexOf(array, target) {
        if (typeof Array.prototype.indexOf === 'function') {
            return array.indexOf(target);
        } else {
            for (var i = 0; i < array.length; i++) {
                if (array[i] === target) {
                    return i;
                }
            }
            return -1;
        }
    }

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = _filter(error.stack.split('\n'), function (line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return _map(filtered, function (line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = _indexOf(['eval', '<anonymous>'], locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame(functionName, undefined, fileName, locationParts[1], locationParts[2], line);
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = _filter(error.stack.split('\n'), function (line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return _map(filtered, function (line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame(line);
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;
                    return new StackFrame(functionName, undefined, locationParts[0], locationParts[1], locationParts[2], line);
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame(match[3] || undefined, undefined, match[2], match[1], undefined, lines[i]));
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = _filter(error.stack.split('\n'), function (line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return _map(filtered, function (line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = tokens.shift() || '';
                var functionName = functionCall.replace(/<anonymous function(: (\w+))?>/, '$2').replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = argsRaw === undefined || argsRaw === '[arguments not available]' ? undefined : argsRaw.split(',');
                return new StackFrame(functionName, args, locationParts[0], locationParts[1], locationParts[2], line);
            }, this);
        }
    };
});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */

    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
        module.exports = factory();
    } else {
        root.StackFrame = factory();
    }
})(undefined, function () {
    'use strict';

    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function StackFrame(functionName, args, fileName, lineNumber, columnNumber, source) {
        if (functionName !== undefined) {
            this.setFunctionName(functionName);
        }
        if (args !== undefined) {
            this.setArgs(args);
        }
        if (fileName !== undefined) {
            this.setFileName(fileName);
        }
        if (lineNumber !== undefined) {
            this.setLineNumber(lineNumber);
        }
        if (columnNumber !== undefined) {
            this.setColumnNumber(columnNumber);
        }
        if (source !== undefined) {
            this.setSource(source);
        }
    }

    StackFrame.prototype = {
        getFunctionName: function getFunctionName() {
            return this.functionName;
        },
        setFunctionName: function setFunctionName(v) {
            this.functionName = String(v);
        },

        getArgs: function getArgs() {
            return this.args;
        },
        setArgs: function setArgs(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        // NOTE: Property name may be misleading as it includes the path,
        // but it somewhat mirrors V8's JavaScriptStackTraceApi
        // https://code.google.com/p/v8/wiki/JavaScriptStackTraceApi and Gecko's
        // http://mxr.mozilla.org/mozilla-central/source/xpcom/base/nsIException.idl#14
        getFileName: function getFileName() {
            return this.fileName;
        },
        setFileName: function setFileName(v) {
            this.fileName = String(v);
        },

        getLineNumber: function getLineNumber() {
            return this.lineNumber;
        },
        setLineNumber: function setLineNumber(v) {
            if (!_isNumber(v)) {
                throw new TypeError('Line Number must be a Number');
            }
            this.lineNumber = Number(v);
        },

        getColumnNumber: function getColumnNumber() {
            return this.columnNumber;
        },
        setColumnNumber: function setColumnNumber(v) {
            if (!_isNumber(v)) {
                throw new TypeError('Column Number must be a Number');
            }
            this.columnNumber = Number(v);
        },

        getSource: function getSource() {
            return this.source;
        },
        setSource: function setSource(v) {
            this.source = String(v);
        },

        toString: function toString() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? '@' + this.getFileName() : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? ':' + this.getLineNumber() : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? ':' + this.getColumnNumber() : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    return StackFrame;
});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var PerformanceMonitoring = __webpack_require__(17);
var TransactionService = __webpack_require__(18);
var ZoneService = __webpack_require__(21);

module.exports = {
  PerformanceMonitoring: PerformanceMonitoring,
  registerServices: function registerServices(serviceFactory) {
    serviceFactory.registerServiceCreator('ZoneService', function () {
      var configService = serviceFactory.getService('ConfigService');
      var loggingService = serviceFactory.getService('LoggingService');
      return new ZoneService(loggingService, configService);
    });

    serviceFactory.registerServiceCreator('TransactionService', function () {
      var configService = serviceFactory.getService('ConfigService');
      var loggingService = serviceFactory.getService('LoggingService');
      var zoneService = serviceFactory.getService('ZoneService');
      return new TransactionService(zoneService, loggingService, configService);
    });

    serviceFactory.registerServiceCreator('PerformanceMonitoring', function () {
      var configService = serviceFactory.getService('ConfigService');
      var loggingService = serviceFactory.getService('LoggingService');
      var apmService = serviceFactory.getService('ApmServer');
      var zoneService = serviceFactory.getService('ZoneService');
      var transactionService = serviceFactory.getService('TransactionService');
      return new PerformanceMonitoring(apmService, configService, loggingService, zoneService, transactionService);
    });
  }
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var utils = __webpack_require__(0);

var PerformanceMonitoring = function () {
  function PerformanceMonitoring(apmServer, configService, loggingService, zoneService, transactionService) {
    _classCallCheck(this, PerformanceMonitoring);

    this._apmServer = apmServer;
    this._configService = configService;
    this._logginService = loggingService;
    this._zoneService = zoneService;
    this._transactionService = transactionService;
  }

  _createClass(PerformanceMonitoring, [{
    key: 'init',
    value: function init() {
      this._zoneService.initialize(window.Zone.current);
      var performanceMonitoring = this;
      this._transactionService.subscribe(function (tr) {
        var payload = performanceMonitoring.createTransactionPayload(tr);
        if (payload) {
          performanceMonitoring._apmServer.addTransaction(payload);
        }
      });
    }
  }, {
    key: 'setTransactionContextInfo',
    value: function setTransactionContextInfo(transaction) {
      var context = this._configService.get('context');
      if (context) {
        transaction.addContextInfo(context);
      }
    }
  }, {
    key: 'filterTransaction',
    value: function filterTransaction(tr) {
      var performanceMonitoring = this;
      var browserResponsivenessInterval = this._configService.get('browserResponsivenessInterval');
      var checkBrowserResponsiveness = this._configService.get('checkBrowserResponsiveness');

      if (checkBrowserResponsiveness && !tr.isHardNavigation) {
        var buffer = performanceMonitoring._configService.get('browserResponsivenessBuffer');

        var duration = tr.duration();
        var wasBrowserResponsive = performanceMonitoring.checkBrowserResponsiveness(tr, browserResponsivenessInterval, buffer);
        if (!wasBrowserResponsive) {
          performanceMonitoring._logginService.debug('Transaction was discarded! browser was not responsive enough during the transaction.', ' duration:', duration, ' browserResponsivenessCounter:', tr.browserResponsivenessCounter, 'interval:', browserResponsivenessInterval);
          return false;
        }
      }
      return true;
    }
  }, {
    key: 'prepareTransaction',
    value: function prepareTransaction(transaction) {
      var performanceMonitoring = this;
      transaction.spans.sort(function (spanA, spanB) {
        return spanA._start - spanB._start;
      });

      if (performanceMonitoring._configService.get('groupSimilarSpans')) {
        var similarSpanThreshold = performanceMonitoring._configService.get('similarSpanThreshold');
        transaction.spans = performanceMonitoring.groupSmallContinuouslySimilarSpans(transaction, similarSpanThreshold);
      }
      performanceMonitoring.setTransactionContextInfo(transaction);
    }
  }, {
    key: 'createTransactionDataModel',
    value: function createTransactionDataModel(transaction) {
      var configContext = this._configService.get('context');
      var spans = transaction.spans.map(function (span) {
        return {
          name: span.signature,
          type: span.type,
          start: span._start,
          duration: span.duration()
        };
      });

      var context = utils.merge({}, configContext, transaction.contextInfo);
      return {
        id: transaction.id,
        timestamp: transaction.timestamp,
        name: transaction.name,
        type: transaction.type,
        duration: transaction.duration(),
        spans: spans,
        context: context,
        marks: transaction.marks
      };
    }
  }, {
    key: 'createTransactionPayload',
    value: function createTransactionPayload(transaction) {
      this.prepareTransaction(transaction);
      var filtered = this.filterTransaction(transaction);
      if (filtered) {
        return this.createTransactionDataModel(transaction);
      }
    }
  }, {
    key: 'sendTransactions',
    value: function sendTransactions(transactions) {
      var payload = transactions.map(this.createTransactionPayload.bind(this)).filter(function (tr) {
        return tr;
      });
      this._logginService.debug('Sending Transactions to apm server.', transactions.length);

      // todo: check if transactions are already being sent
      var promise = this._apmServer.sendTransactions(payload);
      return promise;
    }
  }, {
    key: 'convertTransactionsToServerModel',
    value: function convertTransactionsToServerModel(transactions) {
      return transactions.map(this.createTransactionDataModel.bind(this));
    }
  }, {
    key: 'groupSmallContinuouslySimilarSpans',
    value: function groupSmallContinuouslySimilarSpans(transaction, threshold) {
      var transDuration = transaction.duration();
      var spans = [];
      var lastCount = 1;
      transaction.spans.forEach(function (span, index) {
        if (spans.length === 0) {
          spans.push(span);
        } else {
          var lastSpan = spans[spans.length - 1];

          var isContinuouslySimilar = lastSpan.type === span.type && lastSpan.signature === span.signature && span.duration() / transDuration < threshold && (span._start - lastSpan._end) / transDuration < threshold;

          var isLastSpan = transaction.spans.length === index + 1;

          if (isContinuouslySimilar) {
            lastCount++;
            lastSpan._end = span._end;
          }

          if (lastCount > 1 && (!isContinuouslySimilar || isLastSpan)) {
            lastSpan.signature = lastCount + 'x ' + lastSpan.signature;
            lastCount = 1;
          }

          if (!isContinuouslySimilar) {
            spans.push(span);
          }
        }
      });
      return spans;
    }
  }, {
    key: 'checkBrowserResponsiveness',
    value: function checkBrowserResponsiveness(transaction, interval, buffer) {
      var counter = transaction.browserResponsivenessCounter;
      if (typeof interval === 'undefined' || typeof counter === 'undefined') {
        return true;
      }

      var duration = transaction.duration();
      var expectedCount = Math.floor(duration / interval);
      var wasBrowserResponsive = counter + buffer >= expectedCount;

      return wasBrowserResponsive;
    }
  }]);

  return PerformanceMonitoring;
}();

module.exports = PerformanceMonitoring;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Transaction = __webpack_require__(19);
var utils = __webpack_require__(0);
var Subscription = __webpack_require__(1);

var captureHardNavigation = __webpack_require__(20);

function TransactionService(zoneService, logger, config) {
  this._config = config;
  if (typeof config === 'undefined') {
    logger.debug('TransactionService: config is not provided');
  }
  this._logger = logger;
  this._zoneService = zoneService;

  this.nextAutoTaskId = 1;

  this.taskMap = {};
  this.metrics = {};

  this.initialPageLoadName = undefined;

  this._subscription = new Subscription();

  var transactionService = this;
  this._alreadyCapturedPageLoad = false;

  function onBeforeInvokeTask(task) {
    if (task.source === 'XMLHttpRequest.send' && task.span && !task.span.ended) {
      task.span.end();
    }
    transactionService.logInTransaction('Executing', task.taskId);
  }
  zoneService.spec.onBeforeInvokeTask = onBeforeInvokeTask;

  var self = this;

  function onScheduleTask(task) {
    if (task.source === 'XMLHttpRequest.send') {
      var url = task['XHR']['url'];
      var spanSignature = task['XHR']['method'] + ' ';
      if (transactionService._config.get('includeXHRQueryString')) {
        spanSignature = spanSignature + url;
      } else {
        var parsed = utils.parseUrl(url);
        spanSignature = spanSignature + parsed.path;
      }

      var span = transactionService.startSpan(spanSignature, 'ext.HttpRequest', { 'enableStackFrames': false });
      task.span = span;
    } else if (task.type === 'interaction') {
      if (typeof self.interactionStarted === 'function') {
        self.interactionStarted(task);
      }
    }
    transactionService.addTask(task.taskId);
  }
  zoneService.spec.onScheduleTask = onScheduleTask;

  function onInvokeTask(task) {
    if (task.source === 'XMLHttpRequest.send' && task.span && !task.span.ended) {
      task.span.end();
      transactionService.logInTransaction('xhr late ending');
      transactionService.setDebugDataOnTransaction('xhrLateEnding', true);
    }
    transactionService.removeTask(task.taskId);
    transactionService.detectFinish();
  }
  zoneService.spec.onInvokeTask = onInvokeTask;

  function onCancelTask(task) {
    transactionService.removeTask(task.taskId);
    transactionService.detectFinish();
  }
  zoneService.spec.onCancelTask = onCancelTask;
  function onInvokeEnd(task) {
    logger.trace('onInvokeEnd', 'source:', task.source, 'type:', task.type);
    transactionService.detectFinish();
  }
  zoneService.spec.onInvokeEnd = onInvokeEnd;

  function onInvokeStart(task) {
    logger.trace('onInvokeStart', 'source:', task.source, 'type:', task.type);
  }
  zoneService.spec.onInvokeStart = onInvokeStart;
}

TransactionService.prototype.createTransaction = function (name, type, options) {
  var perfOptions = options;
  if (utils.isUndefined(perfOptions)) {
    perfOptions = this._config.config;
  }
  if (!this._config.isActive() || !this._zoneService.isApmZone()) {
    return;
  }

  var tr = new Transaction(name, type, perfOptions, this._logger);
  tr.setDebugData('zone', this._zoneService.getCurrentZone().name);
  this._zoneService.set('transaction', tr);
  if (perfOptions.checkBrowserResponsiveness) {
    this.startCounter(tr);
  }
  return tr;
};

TransactionService.prototype.createZoneTransaction = function () {
  return this.createTransaction('ZoneTransaction', 'transaction');
};

TransactionService.prototype.getCurrentTransaction = function () {
  if (!this._config.isActive() || !this._zoneService.isApmZone()) {
    return;
  }
  var tr = this._zoneService.get('transaction');
  if (!utils.isUndefined(tr) && !tr.ended) {
    return tr;
  }
  return this.createZoneTransaction();
};

TransactionService.prototype.startCounter = function (transaction) {
  transaction.browserResponsivenessCounter = 0;
  var interval = this._config.get('browserResponsivenessInterval');
  if (typeof interval === 'undefined') {
    this._logger.debug('browserResponsivenessInterval is undefined!');
    return;
  }
  this._zoneService.runOuter(function () {
    var id = setInterval(function () {
      if (transaction.ended) {
        window.clearInterval(id);
      } else {
        transaction.browserResponsivenessCounter++;
      }
    }, interval);
  });
};

TransactionService.prototype.sendPageLoadMetrics = function (name) {
  var self = this;
  var perfOptions = this._config.config;
  var tr;

  tr = this._zoneService.getFromApmZone('transaction');

  var trName = name || this.initialPageLoadName;
  var unknownName = false;
  if (!trName) {
    trName = 'Unknown';
    unknownName = true;
  }

  if (tr && tr.name === 'ZoneTransaction') {
    tr.redefine(trName, 'page-load', perfOptions);
  } else {
    tr = new Transaction(trName, 'page-load', perfOptions, this._logger);
  }
  tr.isHardNavigation = true;
  tr.unknownName = unknownName;

  tr.doneCallback = function () {
    self.applyAsync(function () {
      var captured = self.capturePageLoadMetrics(tr);
      if (captured) {
        self.add(tr);
      }
    });
  };
  tr.detectFinish();
  return tr;
};

TransactionService.prototype.capturePageLoadMetrics = function (tr) {
  var self = this;
  var capturePageLoad = self._config.get('capturePageLoad');
  if (capturePageLoad && !self._alreadyCapturedPageLoad && tr.isHardNavigation) {
    tr.addMarks(self.metrics);
    captureHardNavigation(tr);
    self._alreadyCapturedPageLoad = true;
    return true;
  }
};

TransactionService.prototype.startTransaction = function (name, type) {
  var self = this;
  var perfOptions = this._config.config;
  if (type === 'interaction' && !perfOptions.captureInteractions) {
    return;
  }

  // this will create a zone transaction if possible
  var tr = this.getCurrentTransaction();

  if (tr) {
    if (tr.name !== 'ZoneTransaction') {
      // todo: need to handle cases in which the transaction has active spans and/or scheduled tasks
      this.logInTransaction('Ending early to start a new transaction:', name, type);
      this._logger.debug('Ending old transaction', tr);
      tr.end();
      tr = this.createTransaction(name, type);
    } else {
      tr.redefine(name, type, perfOptions);
    }
  } else {
    return;
  }

  this._logger.debug('TransactionService.startTransaction', tr);
  tr.doneCallback = function () {
    self.applyAsync(function () {
      self._logger.debug('TransactionService transaction finished', tr);

      if (tr.spans.length > 0 && !self.shouldIgnoreTransaction(tr.name)) {
        self.capturePageLoadMetrics(tr);
        self.add(tr);
      }
    });
  };
  return tr;
};

TransactionService.prototype.applyAsync = function (fn, applyThis, applyArgs) {
  return this._zoneService.runOuter(function () {
    return Promise.resolve().then(function () {
      return fn.apply(applyThis, applyArgs);
    }, function (reason) {
      console.log(reason);
    });
  });
};

TransactionService.prototype.shouldIgnoreTransaction = function (transaction_name) {
  var ignoreList = this._config.get('ignoreTransactions');

  for (var i = 0; i < ignoreList.length; i++) {
    var element = ignoreList[i];
    if (typeof element.test === 'function') {
      if (element.test(transaction_name)) {
        return true;
      }
    } else if (element === transaction_name) {
      return true;
    }
  }
  return false;
};

TransactionService.prototype.startSpan = function (signature, type, options) {
  var trans = this.getCurrentTransaction();

  if (trans) {
    this._logger.debug('TransactionService.startSpan', signature, type);
    var span = trans.startSpan(signature, type, options);
    return span;
  }
};

TransactionService.prototype.add = function (transaction) {
  if (!this._config.isActive()) {
    return;
  }

  this._subscription.applyAll(this, [transaction]);
  this._logger.debug('TransactionService.add', transaction);
};

TransactionService.prototype.subscribe = function (fn) {
  return this._subscription.subscribe(fn);
};

TransactionService.prototype.addTask = function (taskId) {
  var tr = this.getCurrentTransaction();
  if (tr) {
    if (typeof taskId === 'undefined') {
      taskId = 'autoId' + this.nextAutoTaskId++;
    }
    tr.addTask(taskId);
    this._logger.debug('TransactionService.addTask', taskId);
  }
  return taskId;
};
TransactionService.prototype.removeTask = function (taskId) {
  var tr = this._zoneService.get('transaction');
  if (!utils.isUndefined(tr) && !tr.ended) {
    tr.removeTask(taskId);
    this._logger.debug('TransactionService.removeTask', taskId);
  }
};
TransactionService.prototype.logInTransaction = function () {
  var tr = this._zoneService.get('transaction');
  if (!utils.isUndefined(tr) && !tr.ended) {
    tr.debugLog.apply(tr, arguments);
  }
};
TransactionService.prototype.setDebugDataOnTransaction = function setDebugDataOnTransaction(key, value) {
  var tr = this._zoneService.get('transaction');
  if (!utils.isUndefined(tr) && !tr.ended) {
    tr.setDebugData(key, value);
  }
};

TransactionService.prototype.detectFinish = function () {
  var tr = this._zoneService.get('transaction');
  if (!utils.isUndefined(tr) && !tr.ended) {
    tr.detectFinish();
    this._logger.debug('TransactionService.detectFinish');
  }
};

module.exports = TransactionService;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Span = __webpack_require__(6);
var utils = __webpack_require__(0);
var uuidv4 = __webpack_require__(4);

var Transaction = function Transaction(name, type, options, logger) {
  this.id = uuidv4();
  this.timestamp = new Date().toISOString();
  this.metadata = {};
  this.name = name;
  this.type = type;
  this.ended = false;
  this._isDone = false;
  this._options = options;
  this._logger = logger;
  if (typeof options === 'undefined') {
    this._options = {};
  }

  this.contextInfo = {
    _debug: {}
  };

  this.marks = {};
  if (this._options.sendVerboseDebugInfo) {
    this.contextInfo._debug.log = [];
    this.debugLog('Transaction', name, type);
  }

  this.spans = [];
  this._activeSpans = {};

  this._scheduledTasks = {};

  this.events = {};

  this.doneCallback = function noop() {};

  this._rootSpan = new Span('transaction', 'transaction', { enableStackFrames: false });

  this._startStamp = new Date();

  this.duration = this._rootSpan.duration.bind(this._rootSpan);
  this.nextId = 0;

  this.isHardNavigation = false;
};

Transaction.prototype.debugLog = function () {
  if (this._options.sendVerboseDebugInfo) {
    var messages = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
    messages.unshift(Date.now().toString());
    var textMessage = messages.join(' - ');
    this.contextInfo._debug.log.push(textMessage);
    if (this._logger) this._logger.debug(textMessage);
  }
};

Transaction.prototype.addContextInfo = function (obj) {
  utils.merge(this.contextInfo, obj);
};

Transaction.prototype.setDebugData = function setDebugData(key, value) {
  this.contextInfo._debug[key] = value;
};

Transaction.prototype.addMarks = function (obj) {
  this.marks = utils.merge(this.marks, obj);
};

Transaction.prototype.redefine = function (name, type, options) {
  this.debugLog('redefine', name, type);
  this.name = name;
  this.type = type;
  this._options = options;
};

Transaction.prototype.startSpan = function (signature, type, options) {
  // todo: should not accept more spans if the transaction is alreadyFinished
  var transaction = this;
  this.debugLog('startSpan', signature, type);
  var opts = typeof options === 'undefined' ? {} : options;
  opts.enableStackFrames = this._options.enableStackFrames === true && opts.enableStackFrames !== false;

  opts.onSpanEnd = function (trc) {
    transaction._onSpanEnd(trc);
  };

  var span = new Span(signature, type, opts);
  span.id = this.nextId;
  this.nextId++;
  this._activeSpans[span.id] = span;

  return span;
};

Transaction.prototype.isFinished = function () {
  var scheduledTasks = Object.keys(this._scheduledTasks);
  this.debugLog('isFinished scheduledTasks', scheduledTasks);
  return scheduledTasks.length === 0;
};

Transaction.prototype.detectFinish = function () {
  if (this.isFinished()) this.end();
};

Transaction.prototype.end = function () {
  if (this.ended) {
    return;
  }
  this.debugLog('end');
  this.ended = true;

  this.addContextInfo({
    url: {
      location: window.location.href
    }
  });
  this._rootSpan.end();

  if (this.isFinished() === true) {
    this._finish();
  }
};

Transaction.prototype.addTask = function (taskId) {
  // todo: should not accept more tasks if the transaction is alreadyFinished]
  this.debugLog('addTask', taskId);
  this._scheduledTasks[taskId] = taskId;
};

Transaction.prototype.removeTask = function (taskId) {
  this.debugLog('removeTask', taskId);
  this.setDebugData('lastRemovedTask', taskId);
  delete this._scheduledTasks[taskId];
};

Transaction.prototype.addEndedSpans = function (existingSpans) {
  this.spans = this.spans.concat(existingSpans);
};

Transaction.prototype._onSpanEnd = function (span) {
  this.spans.push(span);
  span._scheduledTasks = Object.keys(this._scheduledTasks);
  // Remove span from _activeSpans
  delete this._activeSpans[span.id];
};

Transaction.prototype._finish = function () {
  if (this._alreadFinished === true) {
    return;
  }

  this._alreadFinished = true;

  this._adjustStartToEarliestSpan();
  this._adjustEndToLatestSpan();
  this.doneCallback(this);
};

Transaction.prototype._adjustEndToLatestSpan = function () {
  var latestSpan = findLatestNonXHRSpan(this.spans);

  if (latestSpan) {
    this._rootSpan._end = latestSpan._end;

    // set all spans that now are longer than the transaction to
    // be truncated spans
    for (var i = 0; i < this.spans.length; i++) {
      var span = this.spans[i];
      if (span._end > this._rootSpan._end) {
        span._end = this._rootSpan._end;
        span.type = span.type + '.truncated';
      }
    }
  }
};

Transaction.prototype._adjustStartToEarliestSpan = function () {
  var span = getEarliestSpan(this.spans);

  if (span && span._start < this._rootSpan._start) {
    this._rootSpan._start = span._start;
  }
};

function findLatestNonXHRSpan(spans) {
  var latestSpan = null;
  for (var i = 0; i < spans.length; i++) {
    var span = spans[i];
    if (span.type && span.type.indexOf('ext') === -1 && span.type !== 'transaction' && (!latestSpan || latestSpan._end < span._end)) {
      latestSpan = span;
    }
  }
  return latestSpan;
}

function getEarliestSpan(spans) {
  var earliestSpan = null;

  spans.forEach(function (span) {
    if (!earliestSpan) {
      earliestSpan = span;
    }
    if (earliestSpan && earliestSpan._start > span._start) {
      earliestSpan = span;
    }
  });

  return earliestSpan;
}

module.exports = Transaction;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Span = __webpack_require__(6);

var eventPairs = [['domainLookupStart', 'domainLookupEnd', 'DNS lookup'], ['connectStart', 'connectEnd', 'Connect'], ['requestStart', 'responseStart', 'Sending and waiting for first byte'], ['responseStart', 'responseEnd', 'Downloading'], ['domLoading', 'domInteractive', 'Fetching, parsing and sync. execution'], ['domContentLoadedEventStart', 'domContentLoadedEventEnd', '"DOMContentLoaded" event handling'], ['loadEventStart', 'loadEventEnd', '"load" event handling']];

var navigationTimingKeys = ['navigationStart', 'unloadEventStart', 'unloadEventEnd', 'redirectStart', 'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'connectEnd', 'secureConnectionStart', 'requestStart', 'responseStart', 'responseEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd'];

var spanThreshold = 5 * 60 * 1000; // 5 minutes
function isValidSpan(transaction, span) {
  var d = span.duration();
  return d < spanThreshold && d > 0 && span._start <= transaction._rootSpan._end && span._end <= transaction._rootSpan._end;
}

module.exports = function captureHardNavigation(transaction) {
  if (transaction.isHardNavigation && window.performance && window.performance.timing) {
    var baseTime = window.performance.timing.fetchStart;
    var timings = window.performance.timing;

    transaction._rootSpan._start = 0;
    transaction.type = 'page-load';
    for (var i = 0; i < eventPairs.length; i++) {
      // var transactionStart = eventPairs[0]
      var start = timings[eventPairs[i][0]];
      var end = timings[eventPairs[i][1]];
      if (start && end && end - start !== 0) {
        var span = new Span(eventPairs[i][2], 'hard-navigation.browser-timing');
        span._start = timings[eventPairs[i][0]] - baseTime;
        span.ended = true;
        span.end();
        span._end = timings[eventPairs[i][1]] - baseTime;
        if (isValidSpan(transaction, span)) {
          transaction.spans.push(span);
        }
      }
    }

    if (window.performance.getEntriesByType) {
      var entries = window.performance.getEntriesByType('resource');

      var ajaxUrls = transaction.spans.filter(function (span) {
        return span.type.indexOf('ext.HttpRequest') > -1;
      }).map(function (span) {
        return span.signature.split(' ')[1];
      });

      for (i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.initiatorType && entry.initiatorType === 'xmlhttprequest') {
          continue;
        } else if (entry.initiatorType !== 'css' && entry.initiatorType !== 'img' && entry.initiatorType !== 'script' && entry.initiatorType !== 'link') {
          // is web request? test for css/img before the expensive operation
          var foundAjaxReq = false;
          for (var j = 0; j < ajaxUrls.length; j++) {
            // entry.name.endsWith(ajaxUrls[j])
            var idx = entry.name.lastIndexOf(ajaxUrls[j]);
            if (idx > -1 && idx === entry.name.length - ajaxUrls[j].length) {
              foundAjaxReq = true;
              break;
            }
          }
          if (foundAjaxReq) {
            continue;
          }
        } else {
          var kind = 'resource';
          if (entry.initiatorType) {
            kind += '.' + entry.initiatorType;
          }

          span = new Span(entry.name, kind);
          span._start = entry.startTime;
          span.ended = true;
          span.end();
          span._end = entry.responseEnd;
          if (isValidSpan(transaction, span)) {
            transaction.spans.push(span);
          }
        }
      }
    }
    transaction._adjustStartToEarliestSpan();
    transaction._adjustEndToLatestSpan();

    var marks = {
      agent: {
        timeToComplete: transaction._rootSpan._end
      },
      navigationTiming: {}
    };
    var navigationStart = window.performance.timing.navigationStart;
    navigationTimingKeys.forEach(function (timingKey) {
      var m = timings[timingKey];
      if (m) {
        marks.navigationTiming[timingKey] = m - navigationStart;
      }
    });
    transaction.addMarks(marks);
  }
  return 0;
};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Subscription = __webpack_require__(1);
var patchUtils = __webpack_require__(2);
var apmTaskSymbol = patchUtils.apmSymbol('taskData');

var urlSympbol = patchUtils.apmSymbol('url');
var methodSymbol = patchUtils.apmSymbol('method');

var XMLHttpRequest_send = 'XMLHttpRequest.send';

var apmDataSymbol = patchUtils.apmSymbol('apmData');

var testTransactionAfterEvents = ['click', 'contextmenu', 'dblclick', 'mousedown', 'keydown', 'keypress', 'keyup']; // leave these out for now: 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover',
var testTransactionAfterEventsObj = {};
testTransactionAfterEvents.forEach(function (ev) {
  testTransactionAfterEventsObj[ev] = 1;
});

function ZoneService(logger, config) {
  this.events = new Subscription();

  var nextId = 0;

  // var zoneService = this
  function noop() {}
  var spec = this.spec = {
    onScheduleTask: noop,
    onBeforeInvokeTask: noop,
    onInvokeTask: noop,
    onCancelTask: noop,
    onHandleError: noop,
    onInvokeStart: noop,
    onInvokeEnd: noop
  };

  this.zoneConfig = {
    name: 'apmRootZone',
    onScheduleTask: function onScheduleTask(parentZoneDelegate, currentZone, targetZone, task) {
      logger.trace('zoneservice.onScheduleTask', task.source, ' type:', task.type);
      if (task.type === 'eventTask') {
        var target = task.data.taskData.target;
        var eventName = task.data.taskData.eventName;

        if (target && typeof target[apmDataSymbol] === 'undefined') {
          target[apmDataSymbol] = { registeredEventListeners: {} };
        }

        if (task.type === 'eventTask' && eventName === 'apmImmediatelyFiringEvent') {
          task.callback(task.data.taskData);
          return task;
        }

        if (target && (eventName === 'readystatechange' || eventName === 'load')) {
          target[apmDataSymbol].registeredEventListeners[eventName] = { resolved: false };
        }
      } else if (task.type === 'macroTask') {
        logger.trace('Zone: ', targetZone.name);
        var taskId = nextId++;
        var apmTask = {
          taskId: task.source + taskId,
          source: task.source,
          type: task.type
        };

        if (task.source === 'setTimeout') {
          if (task.data.args[1] === 0 || typeof task.data.args[1] === 'undefined') {
            task[apmTaskSymbol] = apmTask;
            spec.onScheduleTask(apmTask);
          }
        } else if (task.source === XMLHttpRequest_send) {
          /*
                  "XMLHttpRequest.addEventListener:load"
                  "XMLHttpRequest.addEventListener:error"
                  "XMLHttpRequest.addEventListener:abort"
                  "XMLHttpRequest.send"
                  "XMLHttpRequest.addEventListener:readystatechange"
          */

          apmTask['XHR'] = {
            resolved: false,
            'send': false,
            url: task.data.target[urlSympbol],
            method: task.data.target[methodSymbol]

            // target for event tasks is different instance from the XMLHttpRequest, on mobile browsers
            // A hack to get the correct target for event tasks
          };task.data.target.addEventListener('apmImmediatelyFiringEvent', function (event) {
            if (typeof event.target[apmDataSymbol] !== 'undefined') {
              task.data.target[apmDataSymbol] = event.target[apmDataSymbol];
            } else {
              task.data.target[apmDataSymbol] = event.target[apmDataSymbol] = { registeredEventListeners: {} };
            }
          });

          task.data.target[apmDataSymbol].task = apmTask;
          task.data.target[apmDataSymbol].typeName = 'XMLHttpRequest';

          spec.onScheduleTask(apmTask);
        }
      } else if (task.type === 'microTask' && task.source === 'Promise.then') {
        taskId = nextId++;
        apmTask = {
          taskId: task.source + taskId,
          source: task.source,
          type: task.type
        };

        task[apmTaskSymbol] = apmTask;
        spec.onScheduleTask(apmTask);
      }

      var delegateTask = parentZoneDelegate.scheduleTask(targetZone, task);
      return delegateTask;
    },
    onInvoke: function onInvoke(parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) {
      var taskId = nextId++;
      var apmTask = {
        taskId: source + taskId,
        source: source,
        type: 'invoke'
      };
      spec.onInvokeStart(apmTask);
      var result = delegate.apply(applyThis, applyArgs);
      spec.onInvokeEnd(apmTask);
      return result;
    },
    onInvokeTask: function onInvokeTask(parentZoneDelegate, currentZone, targetZone, task, applyThis, applyArgs) {
      spec.onInvokeStart({ source: task.source, type: task.type });
      logger.trace('zoneservice.onInvokeTask', task.source, ' type:', task.type);
      var target = task.target || task.data && task.data.target;
      var eventName = task.eventName;
      var result;

      if (target && target[apmDataSymbol].typeName === 'XMLHttpRequest') {
        var apmData = target[apmDataSymbol];
        logger.trace('apmData', apmData);
        var apmTask = apmData.task;
        if (apmTask && eventName === 'readystatechange' && target.readyState === target.DONE) {
          apmData.registeredEventListeners['readystatechange'].resolved = true;
          spec.onBeforeInvokeTask(apmTask);
        } else if (apmTask && eventName === 'load' && 'load' in apmData.registeredEventListeners) {
          apmData.registeredEventListeners.load.resolved = true;
        } else if (apmTask && task.source === XMLHttpRequest_send) {
          apmTask.XHR.resolved = true;
        }

        result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
        if (apmTask && (!apmData.registeredEventListeners['load'] || apmData.registeredEventListeners['load'].resolved) && (!apmData.registeredEventListeners['readystatechange'] || apmData.registeredEventListeners['readystatechange'].resolved) && apmTask.XHR.resolved) {
          spec.onInvokeTask(apmTask);
        }
      } else if (task[apmTaskSymbol] && (task.source === 'setTimeout' || task.source === 'Promise.then')) {
        spec.onBeforeInvokeTask(task[apmTaskSymbol]);
        result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
        spec.onInvokeTask(task[apmTaskSymbol]);
      } else if (task.type === 'eventTask' && target && eventName in testTransactionAfterEventsObj) {
        var taskId = nextId++;
        apmTask = {
          taskId: task.source + taskId,
          source: task.source,
          type: 'interaction',
          applyArgs: applyArgs
        };

        spec.onScheduleTask(apmTask);

        // clear spans on the zone transaction
        result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
        spec.onInvokeTask(apmTask);
      } else {
        result = parentZoneDelegate.invokeTask(targetZone, task, applyThis, applyArgs);
      }
      spec.onInvokeEnd({ source: task.source, type: task.type });
      return result;
    },
    onCancelTask: function onCancelTask(parentZoneDelegate, currentZone, targetZone, task) {
      // logger.trace('Zone: ', targetZone.name)
      var apmTask;
      if (task.type === 'macroTask') {
        if (task.source === XMLHttpRequest_send) {
          apmTask = task.data.target[apmDataSymbol].task;
          spec.onCancelTask(apmTask);
        } else if (task[apmTaskSymbol] && task.source === 'setTimeout') {
          apmTask = task[apmTaskSymbol];
          spec.onCancelTask(apmTask);
        }
      }
      return parentZoneDelegate.cancelTask(targetZone, task);
    }
    // onHandleError: function (parentZoneDelegate, currentZone, targetZone, error) {
    //   spec.onHandleError(error)
    //   parentZoneDelegate.handleError(targetZone, error)
    // }
  };
}

ZoneService.prototype.initialize = function (zone) {
  this.outer = zone;
  this.zone = zone.fork(this.zoneConfig);
};

ZoneService.prototype.set = function (key, value) {
  window.Zone.current._properties[key] = value;
};
ZoneService.prototype.get = function (key) {
  return window.Zone.current.get(key);
};

ZoneService.prototype.getFromApmZone = function (key) {
  return this.zone.get(key);
};
ZoneService.prototype.setOnApmZone = function (key, value) {
  this.zone._properties[key] = value;
};

ZoneService.prototype.getCurrentZone = function () {
  return window.Zone.current;
};

ZoneService.prototype.isApmZone = function () {
  return this.zone.name === window.Zone.current.name;
};

ZoneService.prototype.runOuter = function (fn, applyThis, applyArgs) {
  if (this.outer) {
    return this.outer.run(fn, applyThis, applyArgs);
  } else {
    return fn.apply(applyThis, applyArgs);
  }
};

ZoneService.prototype.runInApmZone = function runInApmZone(fn, applyThis, applyArgs, source) {
  return this.zone.run(fn, applyThis, applyArgs, source || 'runInApmZone:' + fn.name);
};

module.exports = ZoneService;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApmServer = __webpack_require__(23);
var ConfigService = __webpack_require__(26);
var Logger = __webpack_require__(27);

var patchUtils = __webpack_require__(2);
var utils = __webpack_require__(0);

var ServiceFactory = function () {
  function ServiceFactory() {
    _classCallCheck(this, ServiceFactory);

    this._serviceCreators = {};
    this._serviceInstances = {};
    this.initialized = false;
  }

  _createClass(ServiceFactory, [{
    key: 'registerCoreServices',
    value: function registerCoreServices() {
      var serviceFactory = this;

      this.registerServiceCreator('ConfigService', function () {
        var configService = new ConfigService();
        return configService;
      });

      this.registerServiceInstance('LoggingService', Logger);
      this.registerServiceCreator('ApmServer', function () {
        return new ApmServer(serviceFactory.getService('ConfigService'), serviceFactory.getService('LoggingService'));
      });
      this.registerServiceInstance('PatchUtils', patchUtils);
      this.registerServiceInstance('Utils', utils);
    }
  }, {
    key: 'init',
    value: function init() {
      if (this.initialized) {
        return;
      }
      this.initialized = true;
      var serviceFactory = this;

      var configService = serviceFactory.getService('ConfigService');
      configService.init();

      function setLogLevel(loggingService, configService) {
        if (configService.get('debug') === true && configService.config.logLevel !== 'trace') {
          loggingService.setLevel('debug', false);
        } else {
          loggingService.setLevel(configService.get('logLevel'), false);
        }
      }

      setLogLevel(Logger, configService);
      configService.subscribeToChange(function (newConfig) {
        setLogLevel(Logger, configService);
      });

      var apmServer = serviceFactory.getService('ApmServer');
      apmServer.init();
    }
  }, {
    key: 'registerServiceCreator',
    value: function registerServiceCreator(name, creator) {
      this._serviceCreators[name] = creator;
    }
  }, {
    key: 'registerServiceInstance',
    value: function registerServiceInstance(name, instance) {
      this._serviceInstances[name] = instance;
    }
  }, {
    key: 'getService',
    value: function getService(name) {
      if (!this._serviceInstances[name]) {
        if (typeof this._serviceCreators[name] === 'function') {
          this._serviceInstances[name] = this._serviceCreators[name](this);
        } else {
          throw new Error('Can not get service, No creator for: ' + name);
        }
      }
      return this._serviceInstances[name];
    }
  }]);

  return ServiceFactory;
}();

module.exports = ServiceFactory;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = __webpack_require__(24);
var throttle = __webpack_require__(25);

var ApmServer = function () {
  function ApmServer(configService, loggingService) {
    _classCallCheck(this, ApmServer);

    this._configService = configService;
    this._loggingService = loggingService;
    this.logMessages = {
      invalidConfig: { message: 'Configuration is invalid!', level: 'warn' }
    };

    this.errorQueue = undefined;
    this.transactionQueue = undefined;

    this.initialized = false;
    this._throttledMakeRequest;
  }

  _createClass(ApmServer, [{
    key: 'init',
    value: function init() {
      if (this.initialized) {
        return;
      }
      this.initialized = true;

      this.initErrorQueue();
      this.initTransactionQueue();
      this.initThrottledMakeRequest();
    }
  }, {
    key: 'createServiceObject',
    value: function createServiceObject() {
      var cfg = this._configService;
      var serviceObject = {
        name: cfg.get('serviceName'),
        version: cfg.get('serviceVersion'),
        agent: {
          name: cfg.get('agentName'),
          version: cfg.get('agentVersion')
        },
        language: {
          name: 'javascript'
        }
      };
      return serviceObject;
    }
  }, {
    key: 'initThrottledMakeRequest',
    value: function initThrottledMakeRequest() {
      var apmServer = this;
      var throttlingRequestLimit = apmServer._configService.get('throttlingRequestLimit');
      var throttlingInterval = apmServer._configService.get('throttlingInterval');
      this._throttledMakeRequest = throttle(apmServer._makeHttpRequest.bind(apmServer), function (method, url) {
        apmServer._loggingService.warn('ElasticAPM: Dropped request to ' + url + ' due to throttling!');
      }, {
        limit: throttlingRequestLimit,
        interval: throttlingInterval
      });
    }
  }, {
    key: '_postJson',
    value: function _postJson(endPoint, payload) {
      if (!this._throttledMakeRequest) {
        this.initThrottledMakeRequest();
      }

      return this._throttledMakeRequest('POST', endPoint, JSON.stringify(payload), { 'Content-Type': 'application/json' });
    }
  }, {
    key: '_makeHttpRequest',
    value: function _makeHttpRequest(method, url, payload, headers) {
      return new Promise(function (resolve, reject) {
        var xhr = new window.XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.timeout = 10000;

        if (headers) {
          for (var header in headers) {
            if (headers.hasOwnProperty(header)) {
              xhr.setRequestHeader(header, headers[header]);
            }
          }
        }

        xhr.onreadystatechange = function (evt) {
          if (xhr.readyState === 4) {
            var status = xhr.status;
            if (status === 0 || status > 399 && status < 600) {
              // An http 4xx or 5xx error. Signal an error.
              var err = new Error(url + ' HTTP status: ' + status);
              err.xhr = xhr;
              reject(err);
            } else {
              resolve(xhr.responseText);
            }
          }
        };

        xhr.onerror = function (err) {
          reject(err);
        };

        xhr.send(payload);
      });
    }
  }, {
    key: '_createQueue',
    value: function _createQueue(onFlush) {
      var queueLimit = this._configService.get('queueLimit');
      var flushInterval = this._configService.get('flushInterval');
      return new Queue(onFlush, {
        queueLimit: queueLimit,
        flushInterval: flushInterval
      });
    }
  }, {
    key: 'initErrorQueue',
    value: function initErrorQueue() {
      var apmServer = this;
      if (this.errorQueue) {
        this.errorQueue.flush();
      }
      this.errorQueue = this._createQueue(function (errors) {
        var p = apmServer.sendErrors(errors);
        if (p) {
          p.then(undefined, function (reason) {
            apmServer._loggingService.debug('Failed sending errors!', reason);
          });
        }
      });
    }
  }, {
    key: 'initTransactionQueue',
    value: function initTransactionQueue() {
      var apmServer = this;
      if (this.transactionQueue) {
        this.transactionQueue.flush();
      }
      this.transactionQueue = this._createQueue(function (transactions) {
        var p = apmServer.sendTransactions(transactions);
        if (p) {
          p.then(undefined, function (reason) {
            apmServer._loggingService.debug('Failed sending transactions!', reason);
          });
        }
      });
    }
  }, {
    key: 'addError',
    value: function addError(error) {
      if (!this.errorQueue) {
        this.initErrorQueue();
      }
      this.errorQueue.add(error);
    }
  }, {
    key: 'addTransaction',
    value: function addTransaction(transaction) {
      if (!this.transactionQueue) {
        this.initTransactionQueue();
      }
      this.transactionQueue.add(transaction);
    }
  }, {
    key: 'warnOnce',
    value: function warnOnce(logObject) {
      if (logObject.level === 'warn') {
        logObject.level = 'debug';
        this._loggingService.warn(logObject.message);
      } else {
        this._loggingService.debug(logObject.message);
      }
    }
  }, {
    key: 'sendErrors',
    value: function sendErrors(errors) {
      if (this._configService.isValid()) {
        if (errors && errors.length > 0) {
          var payload = {
            service: this.createServiceObject(),
            errors: errors
          };
          payload = this._configService.applyFilters(payload);
          var endPoint = this._configService.getEndpointUrl('errors');
          return this._postJson(endPoint, payload);
        }
      } else {
        this.warnOnce(this.logMessages.invalidConfig);
      }
    }
  }, {
    key: 'sendTransactions',
    value: function sendTransactions(transactions) {
      if (this._configService.isValid()) {
        if (transactions && transactions.length > 0) {
          var payload = {
            service: this.createServiceObject(),
            transactions: transactions
          };
          payload = this._configService.applyFilters(payload);
          var endPoint = this._configService.getEndpointUrl('transactions');
          return this._postJson(endPoint, payload);
        }
      } else {
        this.warnOnce(this.logMessages.invalidConfig);
      }
    }
  }]);

  return ApmServer;
}();

module.exports = ApmServer;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = function () {
  function Queue(onFlush, opts) {
    _classCallCheck(this, Queue);

    if (!opts) opts = {};
    this.onFlush = onFlush;
    this.items = [];
    this.queueLimit = opts.queueLimit || -1;
    this.flushInterval = opts.flushInterval || 0;
    this.timeoutId = undefined;
  }

  _createClass(Queue, [{
    key: '_setTimer',
    value: function _setTimer() {
      var _this = this;

      this.timeoutId = setTimeout(function () {
        _this.flush();
      }, this.flushInterval);
    }
  }, {
    key: 'flush',
    value: function flush() {
      this.onFlush(this.items);
      this._clear();
    }
  }, {
    key: '_clear',
    value: function _clear() {
      if (typeof this.timeoutId !== 'undefined') {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }
      this.items = [];
    }
  }, {
    key: 'add',
    value: function add(item) {
      this.items.push(item);
      if (this.queueLimit !== -1 && this.items.length >= this.queueLimit) {
        this.flush();
      } else {
        if (typeof this.timeoutId === 'undefined') {
          this._setTimer();
        }
      }
    }
  }]);

  return Queue;
}();

module.exports = Queue;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function throttle(fn, onThrottle, opts) {
  var context = opts.context || this;
  var limit = opts.limit;
  var interval = opts.interval;
  var countFn = opts.countFn || function () {};
  var counter = 0;
  var timeoutId;
  return function () {
    var count = typeof countFn === 'function' && countFn.apply(context, arguments);
    if (typeof count !== 'number') {
      count = 1;
    }
    counter = counter + count;
    if (typeof timeoutId === 'undefined') {
      timeoutId = setTimeout(function () {
        counter = 0;
        timeoutId = undefined;
      }, interval);
    }
    if (counter > limit) {
      if (typeof onThrottle === 'function') {
        return onThrottle.apply(context, arguments);
      }
    } else {
      return fn.apply(context, arguments);
    }
  };
}

module.exports = throttle;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = __webpack_require__(0);
var Subscription = __webpack_require__(1);

function Config() {
  this.config = {};
  this.defaults = {
    serviceName: '',
    serviceVersion: '',
    agentName: 'js-base',
    agentVersion: '0.3.0',
    serverUrl: 'http://localhost:8200',
    serverStringLimit: 1024,
    serverUrlPrefix: '/v1/client-side',
    active: true,
    isInstalled: false,
    debug: false,
    logLevel: 'warn',
    // performance monitoring
    browserResponsivenessInterval: 500,
    browserResponsivenessBuffer: 3,
    checkBrowserResponsiveness: true,
    enable: true,
    enableStackFrames: false,
    groupSimilarSpans: true,
    similarSpanThreshold: 0.05,
    captureInteractions: false,
    sendVerboseDebugInfo: false,
    includeXHRQueryString: false,
    capturePageLoad: true,
    ignoreTransactions: [],
    throttlingRequestLimit: 20,
    throttlingInterval: 30000, // 30s
    queueLimit: 20,
    flushInterval: 500,

    hasRouterLibrary: false,

    context: {},
    platform: {}
  };

  this._changeSubscription = new Subscription();
  this.filters = [];
}

Config.prototype.isActive = function isActive() {
  return this.get('active');
};

Config.prototype.addFilter = function addFilter(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Argument to must be function');
  }
  this.filters.push(cb);
};

Config.prototype.applyFilters = function applyFilters(data) {
  for (var i = 0; i < this.filters.length; i++) {
    data = this.filters[i](data);
    if (!data) {
      return;
    }
  }
  return data;
};

Config.prototype.init = function () {
  var scriptData = _getConfigFromScript();
  this.setConfig(scriptData);
};

Config.prototype.get = function (key) {
  return utils.arrayReduce(key.split('.'), function (obj, i) {
    return obj && obj[i];
  }, this.config);
};

Config.prototype.getEndpointUrl = function getEndpointUrl(endpoint) {
  var url = this.get('serverUrl') + this.get('serverUrlPrefix') + '/' + endpoint;
  return url;
};

Config.prototype.set = function (key, value) {
  var levels = key.split('.');
  var max_level = levels.length - 1;
  var target = this.config;

  utils.arraySome(levels, function (level, i) {
    if (typeof level === 'undefined') {
      return true;
    }
    if (i === max_level) {
      target[level] = value;
    } else {
      var obj = target[level] || {};
      target[level] = obj;
      target = obj;
    }
  });
};

Config.prototype.setUserContext = function (userContext) {
  var context = {};
  if (typeof userContext.id === 'number') {
    context.id = userContext.id;
  } else if (typeof userContext.id === 'string') {
    context.id = this.truncateString(userContext.id);
  }
  if (typeof userContext.username === 'string') {
    context.username = this.truncateString(userContext.username);
  }
  if (typeof userContext.email === 'string') {
    context.email = this.truncateString(userContext.email);
  }
  this.set('context.user', context);
};

Config.prototype.setCustomContext = function (customContext) {
  if (customContext && (typeof customContext === 'undefined' ? 'undefined' : _typeof(customContext)) === 'object') {
    this.set('context.custom', customContext);
  }
};

Config.prototype.truncateString = function (value) {
  return String(value).substr(0, this.config.serverStringLimit);
};

Config.prototype.setTag = function (key, value) {
  if (!key) return false;
  if (!this.config.context.tags) {
    this.config.context.tags = {};
  }
  var skey = key.replace(/[.*]/g, '_');
  this.config.context.tags[skey] = this.truncateString(value);
};

Config.prototype.getAgentName = function () {
  var version = this.config['agentVersion'];
  if (!version) {
    version = 'dev';
  }
  return this.get('agentName') + '/' + version;
};

Config.prototype.setConfig = function (properties) {
  properties = properties || {};
  this.config = utils.merge({}, this.defaults, this.config, properties);

  this._changeSubscription.applyAll(this, [this.config]);
};

Config.prototype.subscribeToChange = function (fn) {
  return this._changeSubscription.subscribe(fn);
};

Config.prototype.isValid = function () {
  var requiredKeys = ['serviceName', 'serverUrl'];
  var values = utils.arrayMap(requiredKeys, utils.functionBind(function (key) {
    return this.config[key] === null || this.config[key] === undefined || this.config[key] === '';
  }, this));

  return utils.arrayIndexOf(values, true) === -1;
};

var _getConfigFromScript = function _getConfigFromScript() {
  var script = utils.getCurrentScript();
  var config = _getDataAttributesFromNode(script);
  return config;
};

function _getDataAttributesFromNode(node) {
  var dataAttrs = {};
  var dataRegex = /^data\-([\w\-]+)$/;

  if (node) {
    var attrs = node.attributes;
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (dataRegex.test(attr.nodeName)) {
        var key = attr.nodeName.match(dataRegex)[1];

        // camelCase key
        key = utils.arrayMap(key.split('-'), function (group, index) {
          return index > 0 ? group.charAt(0).toUpperCase() + group.substring(1) : group;
        }).join('');

        dataAttrs[key] = attr.value || attr.nodeValue;
      }
    }
  }

  return dataAttrs;
}

Config.prototype.isPlatformSupported = function () {
  return typeof Array.prototype.forEach === 'function' && typeof JSON.stringify === 'function' && typeof Function.bind === 'function' && window.performance && typeof window.performance.now === 'function' && utils.isCORSSupported();
};

module.exports = Config;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*
* loglevel - https://github.com/pimterry/loglevel
*
* Copyright (c) 2013 Tim Perry
* Licensed under the MIT license.
*/
(function (root, definition) {
    "use strict";

    if (true) {
        !(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = definition();
    } else {
        root.log = definition();
    }
})(undefined, function () {
    "use strict";

    var noop = function noop() {};
    var undefinedType = "undefined";

    function realMethod(methodName) {
        if ((typeof console === 'undefined' ? 'undefined' : _typeof(console)) === undefinedType) {
            return false; // We can't build a real method without a console to log to
        } else if (console[methodName] !== undefined) {
            return bindMethod(console, methodName);
        } else if (console.log !== undefined) {
            return bindMethod(console, 'log');
        } else {
            return noop;
        }
    }

    function bindMethod(obj, methodName) {
        var method = obj[methodName];
        if (typeof method.bind === 'function') {
            return method.bind(obj);
        } else {
            try {
                return Function.prototype.bind.call(method, obj);
            } catch (e) {
                // Missing bind shim or IE8 + Modernizr, fallback to wrapping
                return function () {
                    return Function.prototype.apply.apply(method, [obj, arguments]);
                };
            }
        }
    }

    // these private functions always need `this` to be set properly

    function enableLoggingWhenConsoleArrives(methodName, level, loggerName) {
        return function () {
            if ((typeof console === 'undefined' ? 'undefined' : _typeof(console)) !== undefinedType) {
                replaceLoggingMethods.call(this, level, loggerName);
                this[methodName].apply(this, arguments);
            }
        };
    }

    function replaceLoggingMethods(level, loggerName) {
        /*jshint validthis:true */
        for (var i = 0; i < logMethods.length; i++) {
            var methodName = logMethods[i];
            this[methodName] = i < level ? noop : this.methodFactory(methodName, level, loggerName);
        }
    }

    function defaultMethodFactory(methodName, level, loggerName) {
        /*jshint validthis:true */
        return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
    }

    var logMethods = ["trace", "debug", "info", "warn", "error"];

    function Logger(name, defaultLevel, factory) {
        var self = this;
        var currentLevel;
        var storageKey = "loglevel";
        if (name) {
            storageKey += ":" + name;
        }

        function persistLevelIfPossible(levelNum) {
            var levelName = (logMethods[levelNum] || 'silent').toUpperCase();

            // Use localStorage if available
            try {
                window.localStorage[storageKey] = levelName;
                return;
            } catch (ignore) {}

            // Use session cookie as fallback
            try {
                window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
            } catch (ignore) {}
        }

        function getPersistedLevel() {
            var storedLevel;

            try {
                storedLevel = window.localStorage[storageKey];
            } catch (ignore) {}

            if ((typeof storedLevel === 'undefined' ? 'undefined' : _typeof(storedLevel)) === undefinedType) {
                try {
                    var cookie = window.document.cookie;
                    var location = cookie.indexOf(encodeURIComponent(storageKey) + "=");
                    if (location) {
                        storedLevel = /^([^;]+)/.exec(cookie.slice(location))[1];
                    }
                } catch (ignore) {}
            }

            // If the stored level is not valid, treat it as if nothing was stored.
            if (self.levels[storedLevel] === undefined) {
                storedLevel = undefined;
            }

            return storedLevel;
        }

        /*
         *
         * Public API
         *
         */

        self.levels = { "TRACE": 0, "DEBUG": 1, "INFO": 2, "WARN": 3,
            "ERROR": 4, "SILENT": 5 };

        self.methodFactory = factory || defaultMethodFactory;

        self.getLevel = function () {
            return currentLevel;
        };

        self.setLevel = function (level, persist) {
            if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
                level = self.levels[level.toUpperCase()];
            }
            if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
                currentLevel = level;
                if (persist !== false) {
                    // defaults to true
                    persistLevelIfPossible(level);
                }
                replaceLoggingMethods.call(self, level, name);
                if ((typeof console === 'undefined' ? 'undefined' : _typeof(console)) === undefinedType && level < self.levels.SILENT) {
                    return "No console available for logging";
                }
            } else {
                throw "log.setLevel() called with invalid level: " + level;
            }
        };

        self.setDefaultLevel = function (level) {
            if (!getPersistedLevel()) {
                self.setLevel(level, false);
            }
        };

        self.enableAll = function (persist) {
            self.setLevel(self.levels.TRACE, persist);
        };

        self.disableAll = function (persist) {
            self.setLevel(self.levels.SILENT, persist);
        };

        // Initialize with the right level
        var initialLevel = getPersistedLevel();
        if (initialLevel == null) {
            initialLevel = defaultLevel == null ? "WARN" : defaultLevel;
        }
        self.setLevel(initialLevel, false);
    }

    /*
     *
     * Package-level API
     *
     */

    var defaultLogger = new Logger();

    var _loggersByName = {};
    defaultLogger.getLogger = function getLogger(name) {
        if (typeof name !== "string" || name === "") {
            throw new TypeError("You must supply a name when creating a logger.");
        }

        var logger = _loggersByName[name];
        if (!logger) {
            logger = _loggersByName[name] = new Logger(name, defaultLogger.getLevel(), defaultLogger.methodFactory);
        }
        return logger;
    };

    // Grab the current global log variable in case of overwrite
    var _log = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== undefinedType ? window.log : undefined;
    defaultLogger.noConflict = function () {
        if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) !== undefinedType && window.log === defaultLogger) {
            window.log = _log;
        }

        return defaultLogger;
    };

    return defaultLogger;
});

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var patchXMLHttpRequest = __webpack_require__(29);

function patchCommon() {
  patchXMLHttpRequest();
}

module.exports = patchCommon;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var patchUtils = __webpack_require__(2);

var urlSympbol = patchUtils.apmSymbol('url');
var methodSymbol = patchUtils.apmSymbol('method');
var isAsyncSymbol = patchUtils.apmSymbol('isAsync');

module.exports = function patchXMLHttpRequest() {
  patchUtils.patchMethod(window.XMLHttpRequest.prototype, 'open', function (delegate) {
    return function (self, args) {
      self[methodSymbol] = args[0];
      self[urlSympbol] = args[1];
      self[isAsyncSymbol] = args[2];
      delegate.apply(self, args);
    };
  });
};

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
(function (global, factory) {
    ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : factory();
})(undefined, function () {
    'use strict';

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */

    var Zone$1 = function (global) {
        var FUNCTION = 'function';
        var performance = global['performance'];
        function mark(name) {
            performance && performance['mark'] && performance['mark'](name);
        }
        function performanceMeasure(name, label) {
            performance && performance['measure'] && performance['measure'](name, label);
        }
        mark('Zone');
        if (global['Zone']) {
            throw new Error('Zone already loaded.');
        }
        var Zone = function () {
            function Zone(parent, zoneSpec) {
                this._properties = null;
                this._parent = parent;
                this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
                this._properties = zoneSpec && zoneSpec.properties || {};
                this._zoneDelegate = new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
            }
            Zone.assertZonePatched = function () {
                if (global['Promise'] !== patches['ZoneAwarePromise']) {
                    throw new Error('Zone.js has detected that ZoneAwarePromise `(window|global).Promise` ' + 'has been overwritten.\n' + 'Most likely cause is that a Promise polyfill has been loaded ' + 'after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. ' + 'If you must load one, do so before loading zone.js.)');
                }
            };
            Object.defineProperty(Zone, "root", {
                get: function get() {
                    var zone = Zone.current;
                    while (zone.parent) {
                        zone = zone.parent;
                    }
                    return zone;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Zone, "current", {
                get: function get() {
                    return _currentZoneFrame.zone;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Zone, "currentTask", {
                get: function get() {
                    return _currentTask;
                },
                enumerable: true,
                configurable: true
            });
            Zone.__load_patch = function (name, fn) {
                if (patches.hasOwnProperty(name)) {
                    throw Error('Already loaded patch: ' + name);
                } else if (!global['__Zone_disable_' + name]) {
                    var perfName = 'Zone:' + name;
                    mark(perfName);
                    patches[name] = fn(global, Zone, _api);
                    performanceMeasure(perfName, perfName);
                }
            };
            Object.defineProperty(Zone.prototype, "parent", {
                get: function get() {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Zone.prototype, "name", {
                get: function get() {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });
            Zone.prototype.get = function (key) {
                var zone = this.getZoneWith(key);
                if (zone) return zone._properties[key];
            };
            Zone.prototype.getZoneWith = function (key) {
                var current = this;
                while (current) {
                    if (current._properties.hasOwnProperty(key)) {
                        return current;
                    }
                    current = current._parent;
                }
                return null;
            };
            Zone.prototype.fork = function (zoneSpec) {
                if (!zoneSpec) throw new Error('ZoneSpec required!');
                return this._zoneDelegate.fork(this, zoneSpec);
            };
            Zone.prototype.wrap = function (callback, source) {
                if ((typeof callback === 'undefined' ? 'undefined' : _typeof(callback)) !== FUNCTION) {
                    throw new Error('Expecting function got: ' + callback);
                }
                var _callback = this._zoneDelegate.intercept(this, callback, source);
                var zone = this;
                return function () {
                    return zone.runGuarded(_callback, this, arguments, source);
                };
            };
            Zone.prototype.run = function (callback, applyThis, applyArgs, source) {
                if (applyThis === void 0) {
                    applyThis = undefined;
                }
                if (applyArgs === void 0) {
                    applyArgs = null;
                }
                if (source === void 0) {
                    source = null;
                }
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                } finally {
                    _currentZoneFrame = _currentZoneFrame.parent;
                }
            };
            Zone.prototype.runGuarded = function (callback, applyThis, applyArgs, source) {
                if (applyThis === void 0) {
                    applyThis = null;
                }
                if (applyArgs === void 0) {
                    applyArgs = null;
                }
                if (source === void 0) {
                    source = null;
                }
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    try {
                        return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                    } catch (error) {
                        if (this._zoneDelegate.handleError(this, error)) {
                            throw error;
                        }
                    }
                } finally {
                    _currentZoneFrame = _currentZoneFrame.parent;
                }
            };
            Zone.prototype.runTask = function (task, applyThis, applyArgs) {
                if (task.zone != this) {
                    throw new Error('A task can only be run in the zone of creation! (Creation: ' + (task.zone || NO_ZONE).name + '; Execution: ' + this.name + ')');
                }
                // https://github.com/angular/zone.js/issues/778, sometimes eventTask
                // will run in notScheduled(canceled) state, we should not try to
                // run such kind of task but just return
                // we have to define an variable here, if not
                // typescript compiler will complain below
                var isNotScheduled = task.state === notScheduled;
                if (isNotScheduled && task.type === eventTask) {
                    return;
                }
                var reEntryGuard = task.state != running;
                reEntryGuard && task._transitionTo(running, scheduled);
                task.runCount++;
                var previousTask = _currentTask;
                _currentTask = task;
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    if (task.type == macroTask && task.data && !task.data.isPeriodic) {
                        task.cancelFn = null;
                    }
                    try {
                        return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
                    } catch (error) {
                        if (this._zoneDelegate.handleError(this, error)) {
                            throw error;
                        }
                    }
                } finally {
                    // if the task's state is notScheduled or unknown, then it has already been cancelled
                    // we should not reset the state to scheduled
                    if (task.state !== notScheduled && task.state !== unknown) {
                        if (task.type == eventTask || task.data && task.data.isPeriodic) {
                            reEntryGuard && task._transitionTo(scheduled, running);
                        } else {
                            task.runCount = 0;
                            this._updateTaskCount(task, -1);
                            reEntryGuard && task._transitionTo(notScheduled, running, notScheduled);
                        }
                    }
                    _currentZoneFrame = _currentZoneFrame.parent;
                    _currentTask = previousTask;
                }
            };
            Zone.prototype.scheduleTask = function (task) {
                if (task.zone && task.zone !== this) {
                    // check if the task was rescheduled, the newZone
                    // should not be the children of the original zone
                    var newZone = this;
                    while (newZone) {
                        if (newZone === task.zone) {
                            throw Error("can not reschedule task to " + this.name + " which is descendants of the original zone " + task.zone.name);
                        }
                        newZone = newZone.parent;
                    }
                }
                task._transitionTo(scheduling, notScheduled);
                var zoneDelegates = [];
                task._zoneDelegates = zoneDelegates;
                task._zone = this;
                try {
                    task = this._zoneDelegate.scheduleTask(this, task);
                } catch (err) {
                    // should set task's state to unknown when scheduleTask throw error
                    // because the err may from reschedule, so the fromState maybe notScheduled
                    task._transitionTo(unknown, scheduling, notScheduled);
                    // TODO: @JiaLiPassion, should we check the result from handleError?
                    this._zoneDelegate.handleError(this, err);
                    throw err;
                }
                if (task._zoneDelegates === zoneDelegates) {
                    // we have to check because internally the delegate can reschedule the task.
                    this._updateTaskCount(task, 1);
                }
                if (task.state == scheduling) {
                    task._transitionTo(scheduled, scheduling);
                }
                return task;
            };
            Zone.prototype.scheduleMicroTask = function (source, callback, data, customSchedule) {
                return this.scheduleTask(new ZoneTask(microTask, source, callback, data, customSchedule, null));
            };
            Zone.prototype.scheduleMacroTask = function (source, callback, data, customSchedule, customCancel) {
                return this.scheduleTask(new ZoneTask(macroTask, source, callback, data, customSchedule, customCancel));
            };
            Zone.prototype.scheduleEventTask = function (source, callback, data, customSchedule, customCancel) {
                return this.scheduleTask(new ZoneTask(eventTask, source, callback, data, customSchedule, customCancel));
            };
            Zone.prototype.cancelTask = function (task) {
                if (task.zone != this) throw new Error('A task can only be cancelled in the zone of creation! (Creation: ' + (task.zone || NO_ZONE).name + '; Execution: ' + this.name + ')');
                task._transitionTo(canceling, scheduled, running);
                try {
                    this._zoneDelegate.cancelTask(this, task);
                } catch (err) {
                    // if error occurs when cancelTask, transit the state to unknown
                    task._transitionTo(unknown, canceling);
                    this._zoneDelegate.handleError(this, err);
                    throw err;
                }
                this._updateTaskCount(task, -1);
                task._transitionTo(notScheduled, canceling);
                task.runCount = 0;
                return task;
            };
            Zone.prototype._updateTaskCount = function (task, count) {
                var zoneDelegates = task._zoneDelegates;
                if (count == -1) {
                    task._zoneDelegates = null;
                }
                for (var i = 0; i < zoneDelegates.length; i++) {
                    zoneDelegates[i]._updateTaskCount(task.type, count);
                }
            };
            return Zone;
        }();
        Zone.__symbol__ = __symbol__;
        var DELEGATE_ZS = {
            name: '',
            onHasTask: function onHasTask(delegate, _, target, hasTaskState) {
                return delegate.hasTask(target, hasTaskState);
            },
            onScheduleTask: function onScheduleTask(delegate, _, target, task) {
                return delegate.scheduleTask(target, task);
            },
            onInvokeTask: function onInvokeTask(delegate, _, target, task, applyThis, applyArgs) {
                return delegate.invokeTask(target, task, applyThis, applyArgs);
            },
            onCancelTask: function onCancelTask(delegate, _, target, task) {
                return delegate.cancelTask(target, task);
            }
        };
        var ZoneDelegate = function () {
            function ZoneDelegate(zone, parentDelegate, zoneSpec) {
                this._taskCounts = { 'microTask': 0, 'macroTask': 0, 'eventTask': 0 };
                this.zone = zone;
                this._parentDelegate = parentDelegate;
                this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
                this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
                this._forkCurrZone = zoneSpec && (zoneSpec.onFork ? this.zone : parentDelegate.zone);
                this._interceptZS = zoneSpec && (zoneSpec.onIntercept ? zoneSpec : parentDelegate._interceptZS);
                this._interceptDlgt = zoneSpec && (zoneSpec.onIntercept ? parentDelegate : parentDelegate._interceptDlgt);
                this._interceptCurrZone = zoneSpec && (zoneSpec.onIntercept ? this.zone : parentDelegate.zone);
                this._invokeZS = zoneSpec && (zoneSpec.onInvoke ? zoneSpec : parentDelegate._invokeZS);
                this._invokeDlgt = zoneSpec && (zoneSpec.onInvoke ? parentDelegate : parentDelegate._invokeDlgt);
                this._invokeCurrZone = zoneSpec && (zoneSpec.onInvoke ? this.zone : parentDelegate.zone);
                this._handleErrorZS = zoneSpec && (zoneSpec.onHandleError ? zoneSpec : parentDelegate._handleErrorZS);
                this._handleErrorDlgt = zoneSpec && (zoneSpec.onHandleError ? parentDelegate : parentDelegate._handleErrorDlgt);
                this._handleErrorCurrZone = zoneSpec && (zoneSpec.onHandleError ? this.zone : parentDelegate.zone);
                this._scheduleTaskZS = zoneSpec && (zoneSpec.onScheduleTask ? zoneSpec : parentDelegate._scheduleTaskZS);
                this._scheduleTaskDlgt = zoneSpec && (zoneSpec.onScheduleTask ? parentDelegate : parentDelegate._scheduleTaskDlgt);
                this._scheduleTaskCurrZone = zoneSpec && (zoneSpec.onScheduleTask ? this.zone : parentDelegate.zone);
                this._invokeTaskZS = zoneSpec && (zoneSpec.onInvokeTask ? zoneSpec : parentDelegate._invokeTaskZS);
                this._invokeTaskDlgt = zoneSpec && (zoneSpec.onInvokeTask ? parentDelegate : parentDelegate._invokeTaskDlgt);
                this._invokeTaskCurrZone = zoneSpec && (zoneSpec.onInvokeTask ? this.zone : parentDelegate.zone);
                this._cancelTaskZS = zoneSpec && (zoneSpec.onCancelTask ? zoneSpec : parentDelegate._cancelTaskZS);
                this._cancelTaskDlgt = zoneSpec && (zoneSpec.onCancelTask ? parentDelegate : parentDelegate._cancelTaskDlgt);
                this._cancelTaskCurrZone = zoneSpec && (zoneSpec.onCancelTask ? this.zone : parentDelegate.zone);
                this._hasTaskZS = null;
                this._hasTaskDlgt = null;
                this._hasTaskDlgtOwner = null;
                this._hasTaskCurrZone = null;
                var zoneSpecHasTask = zoneSpec && zoneSpec.onHasTask;
                var parentHasTask = parentDelegate && parentDelegate._hasTaskZS;
                if (zoneSpecHasTask || parentHasTask) {
                    // If we need to report hasTask, than this ZS needs to do ref counting on tasks. In such
                    // a case all task related interceptors must go through this ZD. We can't short circuit it.
                    this._hasTaskZS = zoneSpecHasTask ? zoneSpec : DELEGATE_ZS;
                    this._hasTaskDlgt = parentDelegate;
                    this._hasTaskDlgtOwner = this;
                    this._hasTaskCurrZone = zone;
                    if (!zoneSpec.onScheduleTask) {
                        this._scheduleTaskZS = DELEGATE_ZS;
                        this._scheduleTaskDlgt = parentDelegate;
                        this._scheduleTaskCurrZone = this.zone;
                    }
                    if (!zoneSpec.onInvokeTask) {
                        this._invokeTaskZS = DELEGATE_ZS;
                        this._invokeTaskDlgt = parentDelegate;
                        this._invokeTaskCurrZone = this.zone;
                    }
                    if (!zoneSpec.onCancelTask) {
                        this._cancelTaskZS = DELEGATE_ZS;
                        this._cancelTaskDlgt = parentDelegate;
                        this._cancelTaskCurrZone = this.zone;
                    }
                }
            }
            ZoneDelegate.prototype.fork = function (targetZone, zoneSpec) {
                return this._forkZS ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec) : new Zone(targetZone, zoneSpec);
            };
            ZoneDelegate.prototype.intercept = function (targetZone, callback, source) {
                return this._interceptZS ? this._interceptZS.onIntercept(this._interceptDlgt, this._interceptCurrZone, targetZone, callback, source) : callback;
            };
            ZoneDelegate.prototype.invoke = function (targetZone, callback, applyThis, applyArgs, source) {
                return this._invokeZS ? this._invokeZS.onInvoke(this._invokeDlgt, this._invokeCurrZone, targetZone, callback, applyThis, applyArgs, source) : callback.apply(applyThis, applyArgs);
            };
            ZoneDelegate.prototype.handleError = function (targetZone, error) {
                return this._handleErrorZS ? this._handleErrorZS.onHandleError(this._handleErrorDlgt, this._handleErrorCurrZone, targetZone, error) : true;
            };
            ZoneDelegate.prototype.scheduleTask = function (targetZone, task) {
                var returnTask = task;
                if (this._scheduleTaskZS) {
                    if (this._hasTaskZS) {
                        returnTask._zoneDelegates.push(this._hasTaskDlgtOwner);
                    }
                    returnTask = this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt, this._scheduleTaskCurrZone, targetZone, task);
                    if (!returnTask) returnTask = task;
                } else {
                    if (task.scheduleFn) {
                        task.scheduleFn(task);
                    } else if (task.type == microTask) {
                        scheduleMicroTask(task);
                    } else {
                        throw new Error('Task is missing scheduleFn.');
                    }
                }
                return returnTask;
            };
            ZoneDelegate.prototype.invokeTask = function (targetZone, task, applyThis, applyArgs) {
                return this._invokeTaskZS ? this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis, applyArgs) : task.callback.apply(applyThis, applyArgs);
            };
            ZoneDelegate.prototype.cancelTask = function (targetZone, task) {
                var value;
                if (this._cancelTaskZS) {
                    value = this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt, this._cancelTaskCurrZone, targetZone, task);
                } else {
                    if (!task.cancelFn) {
                        throw Error('Task is not cancelable');
                    }
                    value = task.cancelFn(task);
                }
                return value;
            };
            ZoneDelegate.prototype.hasTask = function (targetZone, isEmpty) {
                // hasTask should not throw error so other ZoneDelegate
                // can still trigger hasTask callback
                try {
                    return this._hasTaskZS && this._hasTaskZS.onHasTask(this._hasTaskDlgt, this._hasTaskCurrZone, targetZone, isEmpty);
                } catch (err) {
                    this.handleError(targetZone, err);
                }
            };
            ZoneDelegate.prototype._updateTaskCount = function (type, count) {
                var counts = this._taskCounts;
                var prev = counts[type];
                var next = counts[type] = prev + count;
                if (next < 0) {
                    return; // throw new Error('More tasks executed then were scheduled.');
                }
                if (prev == 0 || next == 0) {
                    var isEmpty = {
                        microTask: counts['microTask'] > 0,
                        macroTask: counts['macroTask'] > 0,
                        eventTask: counts['eventTask'] > 0,
                        change: type
                    };
                    this.hasTask(this.zone, isEmpty);
                }
            };
            return ZoneDelegate;
        }();
        var ZoneTask = function () {
            function ZoneTask(type, source, callback, options, scheduleFn, cancelFn) {
                this._zone = null;
                this.runCount = 0;
                this._zoneDelegates = null;
                this._state = 'notScheduled';
                this.type = type;
                this.source = source;
                this.data = options;
                this.scheduleFn = scheduleFn;
                this.cancelFn = cancelFn;
                this.callback = callback;
                var self = this;
                if (type === eventTask && options && options.isUsingGlobalCallback) {
                    this.invoke = ZoneTask.invokeTask;
                } else {
                    this.invoke = function () {
                        return ZoneTask.invokeTask.apply(global, [self, this, arguments]);
                    };
                }
            }
            ZoneTask.invokeTask = function (task, target, args) {
                if (!task) {
                    task = this;
                }
                _numberOfNestedTaskFrames++;
                try {
                    task.runCount++;
                    return task.zone.runTask(task, target, args);
                } finally {
                    if (_numberOfNestedTaskFrames == 1) {
                        drainMicroTaskQueue();
                    }
                    _numberOfNestedTaskFrames--;
                }
            };
            Object.defineProperty(ZoneTask.prototype, "zone", {
                get: function get() {
                    return this._zone;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ZoneTask.prototype, "state", {
                get: function get() {
                    return this._state;
                },
                enumerable: true,
                configurable: true
            });
            ZoneTask.prototype.cancelScheduleRequest = function () {
                this._transitionTo(notScheduled, scheduling);
            };
            ZoneTask.prototype._transitionTo = function (toState, fromState1, fromState2) {
                if (this._state === fromState1 || this._state === fromState2) {
                    this._state = toState;
                    if (toState == notScheduled) {
                        this._zoneDelegates = null;
                    }
                } else {
                    throw new Error(this.type + " '" + this.source + "': can not transition to '" + toState + "', expecting state '" + fromState1 + "'" + (fromState2 ? ' or \'' + fromState2 + '\'' : '') + ", was '" + this._state + "'.");
                }
            };
            ZoneTask.prototype.toString = function () {
                if (this.data && typeof this.data.handleId !== 'undefined') {
                    return this.data.handleId;
                } else {
                    return Object.prototype.toString.call(this);
                }
            };
            // add toJSON method to prevent cyclic error when
            // call JSON.stringify(zoneTask)
            ZoneTask.prototype.toJSON = function () {
                return {
                    type: this.type,
                    state: this.state,
                    source: this.source,
                    zone: this.zone.name,
                    runCount: this.runCount
                };
            };
            return ZoneTask;
        }();
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        ///  MICROTASK QUEUE
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        var symbolSetTimeout = __symbol__('setTimeout');
        var symbolPromise = __symbol__('Promise');
        var symbolThen = __symbol__('then');
        var _microTaskQueue = [];
        var _isDrainingMicrotaskQueue = false;
        var nativeMicroTaskQueuePromise;
        function scheduleMicroTask(task) {
            // if we are not running in any task, and there has not been anything scheduled
            // we must bootstrap the initial task creation by manually scheduling the drain
            if (_numberOfNestedTaskFrames === 0 && _microTaskQueue.length === 0) {
                // We are not running in Task, so we need to kickstart the microtask queue.
                if (!nativeMicroTaskQueuePromise) {
                    if (global[symbolPromise]) {
                        nativeMicroTaskQueuePromise = global[symbolPromise].resolve(0);
                    }
                }
                if (nativeMicroTaskQueuePromise) {
                    nativeMicroTaskQueuePromise[symbolThen](drainMicroTaskQueue);
                } else {
                    global[symbolSetTimeout](drainMicroTaskQueue, 0);
                }
            }
            task && _microTaskQueue.push(task);
        }
        function drainMicroTaskQueue() {
            if (!_isDrainingMicrotaskQueue) {
                _isDrainingMicrotaskQueue = true;
                while (_microTaskQueue.length) {
                    var queue = _microTaskQueue;
                    _microTaskQueue = [];
                    for (var i = 0; i < queue.length; i++) {
                        var task = queue[i];
                        try {
                            task.zone.runTask(task, null, null);
                        } catch (error) {
                            _api.onUnhandledError(error);
                        }
                    }
                }
                var showError = !Zone[__symbol__('ignoreConsoleErrorUncaughtError')];
                _api.microtaskDrainDone();
                _isDrainingMicrotaskQueue = false;
            }
        }
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        ///  BOOTSTRAP
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        var NO_ZONE = { name: 'NO ZONE' };
        var notScheduled = 'notScheduled',
            scheduling = 'scheduling',
            scheduled = 'scheduled',
            running = 'running',
            canceling = 'canceling',
            unknown = 'unknown';
        var microTask = 'microTask',
            macroTask = 'macroTask',
            eventTask = 'eventTask';
        var patches = {};
        var _api = {
            symbol: __symbol__,
            currentZoneFrame: function currentZoneFrame() {
                return _currentZoneFrame;
            },
            onUnhandledError: noop,
            microtaskDrainDone: noop,
            scheduleMicroTask: scheduleMicroTask,
            showUncaughtError: function showUncaughtError() {
                return !Zone[__symbol__('ignoreConsoleErrorUncaughtError')];
            },
            patchEventTarget: function patchEventTarget() {
                return [];
            },
            patchOnProperties: noop,
            patchMethod: function patchMethod() {
                return noop;
            },
            patchArguments: function patchArguments() {
                return noop;
            },
            setNativePromise: function setNativePromise(NativePromise) {
                // sometimes NativePromise.resolve static function
                // is not ready yet, (such as core-js/es6.promise)
                // so we need to check here.
                if (NativePromise && _typeof(NativePromise.resolve) === FUNCTION) {
                    nativeMicroTaskQueuePromise = NativePromise.resolve(0);
                }
            }
        };
        var symbolRootZoneSpec = '__rootZoneSpec__';
        var rootZone = new Zone(null, null);
        if (global[symbolRootZoneSpec]) {
            rootZone = rootZone.fork(global[symbolRootZoneSpec]);
            delete global[symbolRootZoneSpec];
        }
        var _currentZoneFrame = { parent: null, zone: rootZone };
        var _currentTask = null;
        var _numberOfNestedTaskFrames = 0;
        function noop() {}
        function __symbol__(name) {
            return '__zone_symbol__' + name;
        }
        performanceMeasure('Zone', 'Zone');
        return global['Zone'] = Zone;
    }(typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global);

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    Zone.__load_patch('ZoneAwarePromise', function (global, Zone, api) {
        function readableObjectToString(obj) {
            if (obj && obj.toString === Object.prototype.toString) {
                var className = obj.constructor && obj.constructor.name;
                return (className ? className : '') + ': ' + JSON.stringify(obj);
            }
            return obj ? obj.toString() : Object.prototype.toString.call(obj);
        }
        var __symbol__ = api.symbol;
        var _uncaughtPromiseErrors = [];
        var symbolPromise = __symbol__('Promise');
        var symbolThen = __symbol__('then');
        var creationTrace = '__creationTrace__';
        api.onUnhandledError = function (e) {
            if (api.showUncaughtError()) {
                var rejection = e && e.rejection;
                if (rejection) {
                    console.error('Unhandled Promise rejection:', rejection instanceof Error ? rejection.message : rejection, '; Zone:', e.zone.name, '; Task:', e.task && e.task.source, '; Value:', rejection, rejection instanceof Error ? rejection.stack : undefined);
                } else {
                    console.error(e);
                }
            }
        };
        api.microtaskDrainDone = function () {
            while (_uncaughtPromiseErrors.length) {
                var _loop_1 = function _loop_1() {
                    var uncaughtPromiseError = _uncaughtPromiseErrors.shift();
                    try {
                        uncaughtPromiseError.zone.runGuarded(function () {
                            throw uncaughtPromiseError;
                        });
                    } catch (error) {
                        handleUnhandledRejection(error);
                    }
                };
                while (_uncaughtPromiseErrors.length) {
                    _loop_1();
                }
            }
        };
        var UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL = __symbol__('unhandledPromiseRejectionHandler');
        function handleUnhandledRejection(e) {
            api.onUnhandledError(e);
            try {
                var handler = Zone[UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL];
                if (handler && typeof handler === 'function') {
                    handler.apply(this, [e]);
                }
            } catch (err) {}
        }
        function isThenable(value) {
            return value && value.then;
        }
        function forwardResolution(value) {
            return value;
        }
        function forwardRejection(rejection) {
            return ZoneAwarePromise.reject(rejection);
        }
        var symbolState = __symbol__('state');
        var symbolValue = __symbol__('value');
        var source = 'Promise.then';
        var UNRESOLVED = null;
        var RESOLVED = true;
        var REJECTED = false;
        var REJECTED_NO_CATCH = 0;
        function makeResolver(promise, state) {
            return function (v) {
                try {
                    resolvePromise(promise, state, v);
                } catch (err) {
                    resolvePromise(promise, false, err);
                }
                // Do not return value or you will break the Promise spec.
            };
        }
        var once = function once() {
            var wasCalled = false;
            return function wrapper(wrappedFunction) {
                return function () {
                    if (wasCalled) {
                        return;
                    }
                    wasCalled = true;
                    wrappedFunction.apply(null, arguments);
                };
            };
        };
        var TYPE_ERROR = 'Promise resolved with itself';
        var OBJECT = 'object';
        var FUNCTION = 'function';
        var CURRENT_TASK_TRACE_SYMBOL = __symbol__('currentTaskTrace');
        // Promise Resolution
        function resolvePromise(promise, state, value) {
            var onceWrapper = once();
            if (promise === value) {
                throw new TypeError(TYPE_ERROR);
            }
            if (promise[symbolState] === UNRESOLVED) {
                // should only get value.then once based on promise spec.
                var then = null;
                try {
                    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === OBJECT || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === FUNCTION) {
                        then = value && value.then;
                    }
                } catch (err) {
                    onceWrapper(function () {
                        resolvePromise(promise, false, err);
                    })();
                    return promise;
                }
                // if (value instanceof ZoneAwarePromise) {
                if (state !== REJECTED && value instanceof ZoneAwarePromise && value.hasOwnProperty(symbolState) && value.hasOwnProperty(symbolValue) && value[symbolState] !== UNRESOLVED) {
                    clearRejectedNoCatch(value);
                    resolvePromise(promise, value[symbolState], value[symbolValue]);
                } else if (state !== REJECTED && (typeof then === 'undefined' ? 'undefined' : _typeof(then)) === FUNCTION) {
                    try {
                        then.apply(value, [onceWrapper(makeResolver(promise, state)), onceWrapper(makeResolver(promise, false))]);
                    } catch (err) {
                        onceWrapper(function () {
                            resolvePromise(promise, false, err);
                        })();
                    }
                } else {
                    promise[symbolState] = state;
                    var queue = promise[symbolValue];
                    promise[symbolValue] = value;
                    // record task information in value when error occurs, so we can
                    // do some additional work such as render longStackTrace
                    if (state === REJECTED && value instanceof Error) {
                        // check if longStackTraceZone is here
                        var trace = Zone.currentTask && Zone.currentTask.data && Zone.currentTask.data[creationTrace];
                        if (trace) {
                            // only keep the long stack trace into error when in longStackTraceZone
                            Object.defineProperty(value, CURRENT_TASK_TRACE_SYMBOL, { configurable: true, enumerable: false, writable: true, value: trace });
                        }
                    }
                    for (var i = 0; i < queue.length;) {
                        scheduleResolveOrReject(promise, queue[i++], queue[i++], queue[i++], queue[i++]);
                    }
                    if (queue.length == 0 && state == REJECTED) {
                        promise[symbolState] = REJECTED_NO_CATCH;
                        try {
                            // try to print more readable error log
                            throw new Error('Uncaught (in promise): ' + readableObjectToString(value) + (value && value.stack ? '\n' + value.stack : ''));
                        } catch (err) {
                            var error_1 = err;
                            error_1.rejection = value;
                            error_1.promise = promise;
                            error_1.zone = Zone.current;
                            error_1.task = Zone.currentTask;
                            _uncaughtPromiseErrors.push(error_1);
                            api.scheduleMicroTask(); // to make sure that it is running
                        }
                    }
                }
            }
            // Resolving an already resolved promise is a noop.
            return promise;
        }
        var REJECTION_HANDLED_HANDLER = __symbol__('rejectionHandledHandler');
        function clearRejectedNoCatch(promise) {
            if (promise[symbolState] === REJECTED_NO_CATCH) {
                // if the promise is rejected no catch status
                // and queue.length > 0, means there is a error handler
                // here to handle the rejected promise, we should trigger
                // windows.rejectionhandled eventHandler or nodejs rejectionHandled
                // eventHandler
                try {
                    var handler = Zone[REJECTION_HANDLED_HANDLER];
                    if (handler && (typeof handler === 'undefined' ? 'undefined' : _typeof(handler)) === FUNCTION) {
                        handler.apply(this, [{ rejection: promise[symbolValue], promise: promise }]);
                    }
                } catch (err) {}
                promise[symbolState] = REJECTED;
                for (var i = 0; i < _uncaughtPromiseErrors.length; i++) {
                    if (promise === _uncaughtPromiseErrors[i].promise) {
                        _uncaughtPromiseErrors.splice(i, 1);
                    }
                }
            }
        }
        function scheduleResolveOrReject(promise, zone, chainPromise, onFulfilled, onRejected) {
            clearRejectedNoCatch(promise);
            var delegate = promise[symbolState] ? (typeof onFulfilled === 'undefined' ? 'undefined' : _typeof(onFulfilled)) === FUNCTION ? onFulfilled : forwardResolution : (typeof onRejected === 'undefined' ? 'undefined' : _typeof(onRejected)) === FUNCTION ? onRejected : forwardRejection;
            zone.scheduleMicroTask(source, function () {
                try {
                    resolvePromise(chainPromise, true, zone.run(delegate, undefined, [promise[symbolValue]]));
                } catch (error) {
                    resolvePromise(chainPromise, false, error);
                }
            });
        }
        var ZONE_AWARE_PROMISE_TO_STRING = 'function ZoneAwarePromise() { [native code] }';
        var ZoneAwarePromise = function () {
            function ZoneAwarePromise(executor) {
                var promise = this;
                if (!(promise instanceof ZoneAwarePromise)) {
                    throw new Error('Must be an instanceof Promise.');
                }
                promise[symbolState] = UNRESOLVED;
                promise[symbolValue] = []; // queue;
                try {
                    executor && executor(makeResolver(promise, RESOLVED), makeResolver(promise, REJECTED));
                } catch (error) {
                    resolvePromise(promise, false, error);
                }
            }
            ZoneAwarePromise.toString = function () {
                return ZONE_AWARE_PROMISE_TO_STRING;
            };
            ZoneAwarePromise.resolve = function (value) {
                return resolvePromise(new this(null), RESOLVED, value);
            };
            ZoneAwarePromise.reject = function (error) {
                return resolvePromise(new this(null), REJECTED, error);
            };
            ZoneAwarePromise.race = function (values) {
                var resolve;
                var reject;
                var promise = new this(function (res, rej) {
                    resolve = res;
                    reject = rej;
                });
                function onResolve(value) {
                    promise && (promise = null || resolve(value));
                }
                function onReject(error) {
                    promise && (promise = null || reject(error));
                }
                for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                    var value = values_1[_i];
                    if (!isThenable(value)) {
                        value = this.resolve(value);
                    }
                    value.then(onResolve, onReject);
                }
                return promise;
            };
            ZoneAwarePromise.all = function (values) {
                var resolve;
                var reject;
                var promise = new this(function (res, rej) {
                    resolve = res;
                    reject = rej;
                });
                var count = 0;
                var resolvedValues = [];
                for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
                    var value = values_2[_i];
                    if (!isThenable(value)) {
                        value = this.resolve(value);
                    }
                    value.then(function (index) {
                        return function (value) {
                            resolvedValues[index] = value;
                            count--;
                            if (!count) {
                                resolve(resolvedValues);
                            }
                        };
                    }(count), reject);
                    count++;
                }
                if (!count) resolve(resolvedValues);
                return promise;
            };
            ZoneAwarePromise.prototype.then = function (onFulfilled, onRejected) {
                var chainPromise = new this.constructor(null);
                var zone = Zone.current;
                if (this[symbolState] == UNRESOLVED) {
                    this[symbolValue].push(zone, chainPromise, onFulfilled, onRejected);
                } else {
                    scheduleResolveOrReject(this, zone, chainPromise, onFulfilled, onRejected);
                }
                return chainPromise;
            };
            ZoneAwarePromise.prototype.catch = function (onRejected) {
                return this.then(null, onRejected);
            };
            return ZoneAwarePromise;
        }();
        // Protect against aggressive optimizers dropping seemingly unused properties.
        // E.g. Closure Compiler in advanced mode.
        ZoneAwarePromise['resolve'] = ZoneAwarePromise.resolve;
        ZoneAwarePromise['reject'] = ZoneAwarePromise.reject;
        ZoneAwarePromise['race'] = ZoneAwarePromise.race;
        ZoneAwarePromise['all'] = ZoneAwarePromise.all;
        var NativePromise = global[symbolPromise] = global['Promise'];
        var ZONE_AWARE_PROMISE = Zone.__symbol__('ZoneAwarePromise');
        var desc = Object.getOwnPropertyDescriptor(global, 'Promise');
        if (!desc || desc.configurable) {
            desc && delete desc.writable;
            desc && delete desc.value;
            if (!desc) {
                desc = { configurable: true, enumerable: true };
            }
            desc.get = function () {
                // if we already set ZoneAwarePromise, use patched one
                // otherwise return native one.
                return global[ZONE_AWARE_PROMISE] ? global[ZONE_AWARE_PROMISE] : global[symbolPromise];
            };
            desc.set = function (NewNativePromise) {
                if (NewNativePromise === ZoneAwarePromise) {
                    // if the NewNativePromise is ZoneAwarePromise
                    // save to global
                    global[ZONE_AWARE_PROMISE] = NewNativePromise;
                } else {
                    // if the NewNativePromise is not ZoneAwarePromise
                    // for example: after load zone.js, some library just
                    // set es6-promise to global, if we set it to global
                    // directly, assertZonePatched will fail and angular
                    // will not loaded, so we just set the NewNativePromise
                    // to global[symbolPromise], so the result is just like
                    // we load ES6 Promise before zone.js
                    global[symbolPromise] = NewNativePromise;
                    if (!NewNativePromise.prototype[symbolThen]) {
                        patchThen(NewNativePromise);
                    }
                    api.setNativePromise(NewNativePromise);
                }
            };
            Object.defineProperty(global, 'Promise', desc);
        }
        global['Promise'] = ZoneAwarePromise;
        var symbolThenPatched = __symbol__('thenPatched');
        function patchThen(Ctor) {
            var proto = Ctor.prototype;
            var originalThen = proto.then;
            // Keep a reference to the original method.
            proto[symbolThen] = originalThen;
            // check Ctor.prototype.then propertyDescritor is writable or not
            // in meteor env, writable is false, we have to make it to be true.
            var prop = Object.getOwnPropertyDescriptor(Ctor.prototype, 'then');
            if (prop && prop.writable === false && prop.configurable) {
                Object.defineProperty(Ctor.prototype, 'then', { writable: true });
            }
            Ctor.prototype.then = function (onResolve, onReject) {
                var _this = this;
                var wrapped = new ZoneAwarePromise(function (resolve, reject) {
                    originalThen.call(_this, resolve, reject);
                });
                return wrapped.then(onResolve, onReject);
            };
            Ctor[symbolThenPatched] = true;
        }
        function zoneify(fn) {
            return function () {
                var resultPromise = fn.apply(this, arguments);
                if (resultPromise instanceof ZoneAwarePromise) {
                    return resultPromise;
                }
                var ctor = resultPromise.constructor;
                if (!ctor[symbolThenPatched]) {
                    patchThen(ctor);
                }
                return resultPromise;
            };
        }
        if (NativePromise) {
            patchThen(NativePromise);
            var fetch_1 = global['fetch'];
            if ((typeof fetch_1 === 'undefined' ? 'undefined' : _typeof(fetch_1)) == FUNCTION) {
                global['fetch'] = zoneify(fetch_1);
            }
        }
        // This is not part of public API, but it is useful for tests, so we expose it.
        Promise[Zone.__symbol__('uncaughtPromiseErrors')] = _uncaughtPromiseErrors;
        return ZoneAwarePromise;
    });

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * Suppress closure compiler errors about unknown 'Zone' variable
     * @fileoverview
     * @suppress {undefinedVars,globalThis,missingRequire}
     */
    var zoneSymbol = Zone.__symbol__;
    var _global = (typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object' && window || (typeof self === 'undefined' ? 'undefined' : _typeof(self)) === 'object' && self || global;
    var FUNCTION = 'function';
    var UNDEFINED = 'undefined';
    var REMOVE_ATTRIBUTE = 'removeAttribute';
    var NULL_ON_PROP_VALUE = [null];
    function bindArguments(args, source) {
        for (var i = args.length - 1; i >= 0; i--) {
            if (_typeof(args[i]) === FUNCTION) {
                args[i] = Zone.current.wrap(args[i], source + '_' + i);
            }
        }
        return args;
    }
    function wrapFunctionArgs(func, source) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            var wrappedArgs = bindArguments(args, source ? source : func.name);
            return func.apply(this, wrappedArgs);
        };
    }
    function patchArguments(target, name, source) {
        return patchMethod(target, name, function (delegate, delegateName, name) {
            return function (self, args) {
                return delegate && delegate.apply(self, bindArguments(args, source));
            };
        });
    }
    function patchPrototype(prototype, fnNames) {
        var source = prototype.constructor['name'];
        var _loop_1 = function _loop_1(i) {
            var name_1 = fnNames[i];
            var delegate = prototype[name_1];
            if (delegate) {
                var prototypeDesc = Object.getOwnPropertyDescriptor(prototype, name_1);
                if (!isPropertyWritable(prototypeDesc)) {
                    return "continue";
                }
                prototype[name_1] = function (delegate) {
                    var patched = function patched() {
                        return delegate.apply(this, bindArguments(arguments, source + '.' + name_1));
                    };
                    attachOriginToPatched(patched, delegate);
                    return patched;
                }(delegate);
            }
        };
        for (var i = 0; i < fnNames.length; i++) {
            _loop_1(i);
        }
    }
    function isPropertyWritable(propertyDesc) {
        if (!propertyDesc) {
            return true;
        }
        if (propertyDesc.writable === false) {
            return false;
        }
        if (_typeof(propertyDesc.get) === FUNCTION && _typeof(propertyDesc.set) === UNDEFINED) {
            return false;
        }
        return true;
    }
    var isWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
    // Make sure to access `process` through `_global` so that WebPack does not accidently browserify
    // this code.
    var isNode = !('nw' in _global) && typeof _global.process !== 'undefined' && {}.toString.call(_global.process) === '[object process]';
    var isBrowser = !isNode && !isWebWorker && !!(typeof window !== 'undefined' && window['HTMLElement']);
    // we are in electron of nw, so we are both browser and nodejs
    // Make sure to access `process` through `_global` so that WebPack does not accidently browserify
    // this code.
    var isMix = typeof _global.process !== 'undefined' && {}.toString.call(_global.process) === '[object process]' && !isWebWorker && !!(typeof window !== 'undefined' && window['HTMLElement']);
    var zoneSymbolEventNames = {};
    var wrapFn = function wrapFn(event) {
        // https://github.com/angular/zone.js/issues/911, in IE, sometimes
        // event will be undefined, so we need to use window.event
        event = event || _global.event;
        if (!event) {
            return;
        }
        var eventNameSymbol = zoneSymbolEventNames[event.type];
        if (!eventNameSymbol) {
            eventNameSymbol = zoneSymbolEventNames[event.type] = zoneSymbol('ON_PROPERTY' + event.type);
        }
        var target = this || event.target || _global;
        var listener = target[eventNameSymbol];
        var result = listener && listener.apply(this, arguments);
        if (result != undefined && !result) {
            event.preventDefault();
        }
        return result;
    };
    function patchProperty(obj, prop, prototype) {
        var desc = Object.getOwnPropertyDescriptor(obj, prop);
        if (!desc && prototype) {
            // when patch window object, use prototype to check prop exist or not
            var prototypeDesc = Object.getOwnPropertyDescriptor(prototype, prop);
            if (prototypeDesc) {
                desc = { enumerable: true, configurable: true };
            }
        }
        // if the descriptor not exists or is not configurable
        // just return
        if (!desc || !desc.configurable) {
            return;
        }
        // A property descriptor cannot have getter/setter and be writable
        // deleting the writable and value properties avoids this error:
        //
        // TypeError: property descriptors must not specify a value or be writable when a
        // getter or setter has been specified
        delete desc.writable;
        delete desc.value;
        var originalDescGet = desc.get;
        var originalDescSet = desc.set;
        // substr(2) cuz 'onclick' -> 'click', etc
        var eventName = prop.substr(2);
        var eventNameSymbol = zoneSymbolEventNames[eventName];
        if (!eventNameSymbol) {
            eventNameSymbol = zoneSymbolEventNames[eventName] = zoneSymbol('ON_PROPERTY' + eventName);
        }
        desc.set = function (newValue) {
            // in some of windows's onproperty callback, this is undefined
            // so we need to check it
            var target = this;
            if (!target && obj === _global) {
                target = _global;
            }
            if (!target) {
                return;
            }
            var previousValue = target[eventNameSymbol];
            if (previousValue) {
                target.removeEventListener(eventName, wrapFn);
            }
            // issue #978, when onload handler was added before loading zone.js
            // we should remove it with originalDescSet
            if (originalDescSet) {
                originalDescSet.apply(target, NULL_ON_PROP_VALUE);
            }
            if (typeof newValue === 'function') {
                target[eventNameSymbol] = newValue;
                target.addEventListener(eventName, wrapFn, false);
            } else {
                target[eventNameSymbol] = null;
            }
        };
        // The getter would return undefined for unassigned properties but the default value of an
        // unassigned property is null
        desc.get = function () {
            // in some of windows's onproperty callback, this is undefined
            // so we need to check it
            var target = this;
            if (!target && obj === _global) {
                target = _global;
            }
            if (!target) {
                return null;
            }
            var listener = target[eventNameSymbol];
            if (listener) {
                return listener;
            } else if (originalDescGet) {
                // result will be null when use inline event attribute,
                // such as <button onclick="func();">OK</button>
                // because the onclick function is internal raw uncompiled handler
                // the onclick will be evaluated when first time event was triggered or
                // the property is accessed, https://github.com/angular/zone.js/issues/525
                // so we should use original native get to retrieve the handler
                var value = originalDescGet && originalDescGet.apply(this);
                if (value) {
                    desc.set.apply(this, [value]);
                    if (_typeof(target[REMOVE_ATTRIBUTE]) === FUNCTION) {
                        target.removeAttribute(prop);
                    }
                    return value;
                }
            }
            return null;
        };
        Object.defineProperty(obj, prop, desc);
    }
    function patchOnProperties(obj, properties, prototype) {
        if (properties) {
            for (var i = 0; i < properties.length; i++) {
                patchProperty(obj, 'on' + properties[i], prototype);
            }
        } else {
            var onProperties = [];
            for (var prop in obj) {
                if (prop.substr(0, 2) == 'on') {
                    onProperties.push(prop);
                }
            }
            for (var j = 0; j < onProperties.length; j++) {
                patchProperty(obj, onProperties[j], prototype);
            }
        }
    }
    var originalInstanceKey = zoneSymbol('originalInstance');
    // wrap some native API on `window`
    function patchClass(className) {
        var OriginalClass = _global[className];
        if (!OriginalClass) return;
        // keep original class in global
        _global[zoneSymbol(className)] = OriginalClass;
        _global[className] = function () {
            var a = bindArguments(arguments, className);
            switch (a.length) {
                case 0:
                    this[originalInstanceKey] = new OriginalClass();
                    break;
                case 1:
                    this[originalInstanceKey] = new OriginalClass(a[0]);
                    break;
                case 2:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
                    break;
                case 3:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
                    break;
                case 4:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
                    break;
                default:
                    throw new Error('Arg list too long.');
            }
        };
        // attach original delegate to patched function
        attachOriginToPatched(_global[className], OriginalClass);
        var instance = new OriginalClass(function () {});
        var prop;
        for (prop in instance) {
            // https://bugs.webkit.org/show_bug.cgi?id=44721
            if (className === 'XMLHttpRequest' && prop === 'responseBlob') continue;
            (function (prop) {
                if (typeof instance[prop] === 'function') {
                    _global[className].prototype[prop] = function () {
                        return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
                    };
                } else {
                    Object.defineProperty(_global[className].prototype, prop, {
                        set: function set(fn) {
                            if (typeof fn === 'function') {
                                this[originalInstanceKey][prop] = Zone.current.wrap(fn, className + '.' + prop);
                                // keep callback in wrapped function so we can
                                // use it in Function.prototype.toString to return
                                // the native one.
                                attachOriginToPatched(this[originalInstanceKey][prop], fn);
                            } else {
                                this[originalInstanceKey][prop] = fn;
                            }
                        },
                        get: function get() {
                            return this[originalInstanceKey][prop];
                        }
                    });
                }
            })(prop);
        }
        for (prop in OriginalClass) {
            if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
                _global[className][prop] = OriginalClass[prop];
            }
        }
    }
    function patchMethod(target, name, patchFn) {
        var proto = target;
        while (proto && !proto.hasOwnProperty(name)) {
            proto = Object.getPrototypeOf(proto);
        }
        if (!proto && target[name]) {
            // somehow we did not find it, but we can see it. This happens on IE for Window properties.
            proto = target;
        }
        var delegateName = zoneSymbol(name);
        var delegate;
        if (proto && !(delegate = proto[delegateName])) {
            delegate = proto[delegateName] = proto[name];
            // check whether proto[name] is writable
            // some property is readonly in safari, such as HtmlCanvasElement.prototype.toBlob
            var desc = proto && Object.getOwnPropertyDescriptor(proto, name);
            if (isPropertyWritable(desc)) {
                var patchDelegate_1 = patchFn(delegate, delegateName, name);
                proto[name] = function () {
                    return patchDelegate_1(this, arguments);
                };
                attachOriginToPatched(proto[name], delegate);
            }
        }
        return delegate;
    }
    // TODO: @JiaLiPassion, support cancel task later if necessary
    function patchMacroTask(obj, funcName, metaCreator) {
        var setNative = null;
        function scheduleTask(task) {
            var data = task.data;
            data.args[data.callbackIndex] = function () {
                task.invoke.apply(this, arguments);
            };
            setNative.apply(data.target, data.args);
            return task;
        }
        setNative = patchMethod(obj, funcName, function (delegate) {
            return function (self, args) {
                var meta = metaCreator(self, args);
                if (meta.callbackIndex >= 0 && typeof args[meta.callbackIndex] === 'function') {
                    var task = Zone.current.scheduleMacroTask(meta.name, args[meta.callbackIndex], meta, scheduleTask, null);
                    return task;
                } else {
                    // cause an error by calling it directly.
                    return delegate.apply(self, args);
                }
            };
        });
    }

    function attachOriginToPatched(patched, original) {
        patched[zoneSymbol('OriginalDelegate')] = original;
    }
    var isDetectedIEOrEdge = false;
    var ieOrEdge = false;
    function isIEOrEdge() {
        if (isDetectedIEOrEdge) {
            return ieOrEdge;
        }
        isDetectedIEOrEdge = true;
        try {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            if (ua.indexOf('MSIE ') !== -1 || ua.indexOf('Trident/') !== -1 || ua.indexOf('Edge/') !== -1) {
                ieOrEdge = true;
            }
            return ieOrEdge;
        } catch (error) {}
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // override Function.prototype.toString to make zone.js patched function
    // look like native function
    Zone.__load_patch('toString', function (global, Zone, api) {
        // patch Func.prototype.toString to let them look like native
        var originalFunctionToString = Zone['__zone_symbol__originalToString'] = Function.prototype.toString;
        var FUNCTION = 'function';
        var ORIGINAL_DELEGATE_SYMBOL = zoneSymbol('OriginalDelegate');
        var PROMISE_SYMBOL = zoneSymbol('Promise');
        var ERROR_SYMBOL = zoneSymbol('Error');
        Function.prototype.toString = function () {
            if (_typeof(this) === FUNCTION) {
                var originalDelegate = this[ORIGINAL_DELEGATE_SYMBOL];
                if (originalDelegate) {
                    if ((typeof originalDelegate === 'undefined' ? 'undefined' : _typeof(originalDelegate)) === FUNCTION) {
                        return originalFunctionToString.apply(this[ORIGINAL_DELEGATE_SYMBOL], arguments);
                    } else {
                        return Object.prototype.toString.call(originalDelegate);
                    }
                }
                if (this === Promise) {
                    var nativePromise = global[PROMISE_SYMBOL];
                    if (nativePromise) {
                        return originalFunctionToString.apply(nativePromise, arguments);
                    }
                }
                if (this === Error) {
                    var nativeError = global[ERROR_SYMBOL];
                    if (nativeError) {
                        return originalFunctionToString.apply(nativeError, arguments);
                    }
                }
            }
            return originalFunctionToString.apply(this, arguments);
        };
        // patch Object.prototype.toString to let them look like native
        var originalObjectToString = Object.prototype.toString;
        var PROMISE_OBJECT_TO_STRING = '[object Promise]';
        Object.prototype.toString = function () {
            if (this instanceof Promise) {
                return PROMISE_OBJECT_TO_STRING;
            }
            return originalObjectToString.apply(this, arguments);
        };
    });

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    var TRUE_STR = 'true';
    var FALSE_STR = 'false';
    // an identifier to tell ZoneTask do not create a new invoke closure
    var OPTIMIZED_ZONE_EVENT_TASK_DATA = {
        isUsingGlobalCallback: true
    };
    var zoneSymbolEventNames$1 = {};
    var globalSources = {};
    var CONSTRUCTOR_NAME = 'name';
    var FUNCTION_TYPE = 'function';
    var OBJECT_TYPE = 'object';
    var ZONE_SYMBOL_PREFIX = '__zone_symbol__';
    var EVENT_NAME_SYMBOL_REGX = /^__zone_symbol__(\w+)(true|false)$/;
    var IMMEDIATE_PROPAGATION_SYMBOL = '__zone_symbol__propagationStopped';
    function patchEventTarget(_global, apis, patchOptions) {
        var ADD_EVENT_LISTENER = patchOptions && patchOptions.addEventListenerFnName || 'addEventListener';
        var REMOVE_EVENT_LISTENER = patchOptions && patchOptions.removeEventListenerFnName || 'removeEventListener';
        var LISTENERS_EVENT_LISTENER = patchOptions && patchOptions.listenersFnName || 'eventListeners';
        var REMOVE_ALL_LISTENERS_EVENT_LISTENER = patchOptions && patchOptions.removeAllFnName || 'removeAllListeners';
        var zoneSymbolAddEventListener = zoneSymbol(ADD_EVENT_LISTENER);
        var ADD_EVENT_LISTENER_SOURCE = '.' + ADD_EVENT_LISTENER + ':';
        var PREPEND_EVENT_LISTENER = 'prependListener';
        var PREPEND_EVENT_LISTENER_SOURCE = '.' + PREPEND_EVENT_LISTENER + ':';
        var invokeTask = function invokeTask(task, target, event) {
            // for better performance, check isRemoved which is set
            // by removeEventListener
            if (task.isRemoved) {
                return;
            }
            var delegate = task.callback;
            if ((typeof delegate === 'undefined' ? 'undefined' : _typeof(delegate)) === OBJECT_TYPE && delegate.handleEvent) {
                // create the bind version of handleEvent when invoke
                task.callback = function (event) {
                    return delegate.handleEvent(event);
                };
                task.originalDelegate = delegate;
            }
            // invoke static task.invoke
            task.invoke(task, target, [event]);
            var options = task.options;
            if (options && (typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object' && options.once) {
                // if options.once is true, after invoke once remove listener here
                // only browser need to do this, nodejs eventEmitter will cal removeListener
                // inside EventEmitter.once
                var delegate_1 = task.originalDelegate ? task.originalDelegate : task.callback;
                target[REMOVE_EVENT_LISTENER].apply(target, [event.type, delegate_1, options]);
            }
        };
        // global shared zoneAwareCallback to handle all event callback with capture = false
        var globalZoneAwareCallback = function globalZoneAwareCallback(event) {
            // https://github.com/angular/zone.js/issues/911, in IE, sometimes
            // event will be undefined, so we need to use window.event
            event = event || _global.event;
            if (!event) {
                return;
            }
            // event.target is needed for Samusung TV and SourceBuffer
            // || global is needed https://github.com/angular/zone.js/issues/190
            var target = this || event.target || _global;
            var tasks = target[zoneSymbolEventNames$1[event.type][FALSE_STR]];
            if (tasks) {
                // invoke all tasks which attached to current target with given event.type and capture = false
                // for performance concern, if task.length === 1, just invoke
                if (tasks.length === 1) {
                    invokeTask(tasks[0], target, event);
                } else {
                    // https://github.com/angular/zone.js/issues/836
                    // copy the tasks array before invoke, to avoid
                    // the callback will remove itself or other listener
                    var copyTasks = tasks.slice();
                    for (var i = 0; i < copyTasks.length; i++) {
                        if (event && event[IMMEDIATE_PROPAGATION_SYMBOL] === true) {
                            break;
                        }
                        invokeTask(copyTasks[i], target, event);
                    }
                }
            }
        };
        // global shared zoneAwareCallback to handle all event callback with capture = true
        var globalZoneAwareCaptureCallback = function globalZoneAwareCaptureCallback(event) {
            // https://github.com/angular/zone.js/issues/911, in IE, sometimes
            // event will be undefined, so we need to use window.event
            event = event || _global.event;
            if (!event) {
                return;
            }
            // event.target is needed for Samusung TV and SourceBuffer
            // || global is needed https://github.com/angular/zone.js/issues/190
            var target = this || event.target || _global;
            var tasks = target[zoneSymbolEventNames$1[event.type][TRUE_STR]];
            if (tasks) {
                // invoke all tasks which attached to current target with given event.type and capture = false
                // for performance concern, if task.length === 1, just invoke
                if (tasks.length === 1) {
                    invokeTask(tasks[0], target, event);
                } else {
                    // https://github.com/angular/zone.js/issues/836
                    // copy the tasks array before invoke, to avoid
                    // the callback will remove itself or other listener
                    var copyTasks = tasks.slice();
                    for (var i = 0; i < copyTasks.length; i++) {
                        if (event && event[IMMEDIATE_PROPAGATION_SYMBOL] === true) {
                            break;
                        }
                        invokeTask(copyTasks[i], target, event);
                    }
                }
            }
        };
        function patchEventTargetMethods(obj, patchOptions) {
            if (!obj) {
                return false;
            }
            var useGlobalCallback = true;
            if (patchOptions && patchOptions.useGlobalCallback !== undefined) {
                useGlobalCallback = patchOptions.useGlobalCallback;
            }
            var validateHandler = patchOptions && patchOptions.validateHandler;
            var checkDuplicate = true;
            if (patchOptions && patchOptions.checkDuplicate !== undefined) {
                checkDuplicate = patchOptions.checkDuplicate;
            }
            var returnTarget = false;
            if (patchOptions && patchOptions.returnTarget !== undefined) {
                returnTarget = patchOptions.returnTarget;
            }
            var proto = obj;
            while (proto && !proto.hasOwnProperty(ADD_EVENT_LISTENER)) {
                proto = Object.getPrototypeOf(proto);
            }
            if (!proto && obj[ADD_EVENT_LISTENER]) {
                // somehow we did not find it, but we can see it. This happens on IE for Window properties.
                proto = obj;
            }
            if (!proto) {
                return false;
            }
            if (proto[zoneSymbolAddEventListener]) {
                return false;
            }
            // a shared global taskData to pass data for scheduleEventTask
            // so we do not need to create a new object just for pass some data
            var taskData = {};
            var nativeAddEventListener = proto[zoneSymbolAddEventListener] = proto[ADD_EVENT_LISTENER];
            var nativeRemoveEventListener = proto[zoneSymbol(REMOVE_EVENT_LISTENER)] = proto[REMOVE_EVENT_LISTENER];
            var nativeListeners = proto[zoneSymbol(LISTENERS_EVENT_LISTENER)] = proto[LISTENERS_EVENT_LISTENER];
            var nativeRemoveAllListeners = proto[zoneSymbol(REMOVE_ALL_LISTENERS_EVENT_LISTENER)] = proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER];
            var nativePrependEventListener;
            if (patchOptions && patchOptions.prependEventListenerFnName) {
                nativePrependEventListener = proto[zoneSymbol(patchOptions.prependEventListenerFnName)] = proto[patchOptions.prependEventListenerFnName];
            }
            var customScheduleGlobal = function customScheduleGlobal(task) {
                // if there is already a task for the eventName + capture,
                // just return, because we use the shared globalZoneAwareCallback here.
                if (taskData.isExisting) {
                    return;
                }
                return nativeAddEventListener.apply(taskData.target, [taskData.eventName, taskData.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, taskData.options]);
            };
            var customCancelGlobal = function customCancelGlobal(task) {
                // if task is not marked as isRemoved, this call is directly
                // from Zone.prototype.cancelTask, we should remove the task
                // from tasksList of target first
                if (!task.isRemoved) {
                    var symbolEventNames = zoneSymbolEventNames$1[task.eventName];
                    var symbolEventName = void 0;
                    if (symbolEventNames) {
                        symbolEventName = symbolEventNames[task.capture ? TRUE_STR : FALSE_STR];
                    }
                    var existingTasks = symbolEventName && task.target[symbolEventName];
                    if (existingTasks) {
                        for (var i = 0; i < existingTasks.length; i++) {
                            var existingTask = existingTasks[i];
                            if (existingTask === task) {
                                existingTasks.splice(i, 1);
                                // set isRemoved to data for faster invokeTask check
                                task.isRemoved = true;
                                if (existingTasks.length === 0) {
                                    // all tasks for the eventName + capture have gone,
                                    // remove globalZoneAwareCallback and remove the task cache from target
                                    task.allRemoved = true;
                                    task.target[symbolEventName] = null;
                                }
                                break;
                            }
                        }
                    }
                }
                // if all tasks for the eventName + capture have gone,
                // we will really remove the global event callback,
                // if not, return
                if (!task.allRemoved) {
                    return;
                }
                return nativeRemoveEventListener.apply(task.target, [task.eventName, task.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, task.options]);
            };
            var customScheduleNonGlobal = function customScheduleNonGlobal(task) {
                return nativeAddEventListener.apply(taskData.target, [taskData.eventName, task.invoke, taskData.options]);
            };
            var customSchedulePrepend = function customSchedulePrepend(task) {
                return nativePrependEventListener.apply(taskData.target, [taskData.eventName, task.invoke, taskData.options]);
            };
            var customCancelNonGlobal = function customCancelNonGlobal(task) {
                return nativeRemoveEventListener.apply(task.target, [task.eventName, task.invoke, task.options]);
            };
            var customSchedule = useGlobalCallback ? customScheduleGlobal : customScheduleNonGlobal;
            var customCancel = useGlobalCallback ? customCancelGlobal : customCancelNonGlobal;
            var compareTaskCallbackVsDelegate = function compareTaskCallbackVsDelegate(task, delegate) {
                var typeOfDelegate = typeof delegate === 'undefined' ? 'undefined' : _typeof(delegate);
                if (typeOfDelegate === FUNCTION_TYPE && task.callback === delegate || typeOfDelegate === OBJECT_TYPE && task.originalDelegate === delegate) {
                    // same callback, same capture, same event name, just return
                    return true;
                }
                return false;
            };
            var compare = patchOptions && patchOptions.compareTaskCallbackVsDelegate ? patchOptions.compareTaskCallbackVsDelegate : compareTaskCallbackVsDelegate;
            var blackListedEvents = Zone[Zone.__symbol__('BLACK_LISTED_EVENTS')];
            var makeAddListener = function makeAddListener(nativeListener, addSource, customScheduleFn, customCancelFn, returnTarget, prepend) {
                if (returnTarget === void 0) {
                    returnTarget = false;
                }
                if (prepend === void 0) {
                    prepend = false;
                }
                return function () {
                    var target = this || _global;
                    var delegate = arguments[1];
                    if (!delegate) {
                        return nativeListener.apply(this, arguments);
                    }
                    // don't create the bind delegate function for handleEvent
                    // case here to improve addEventListener performance
                    // we will create the bind delegate when invoke
                    var isHandleEvent = false;
                    if ((typeof delegate === 'undefined' ? 'undefined' : _typeof(delegate)) !== FUNCTION_TYPE) {
                        if (!delegate.handleEvent) {
                            return nativeListener.apply(this, arguments);
                        }
                        isHandleEvent = true;
                    }
                    if (validateHandler && !validateHandler(nativeListener, delegate, target, arguments)) {
                        return;
                    }
                    var eventName = arguments[0];
                    var options = arguments[2];
                    if (blackListedEvents) {
                        // check black list
                        for (var i = 0; i < blackListedEvents.length; i++) {
                            if (eventName === blackListedEvents[i]) {
                                return nativeListener.apply(this, arguments);
                            }
                        }
                    }
                    var capture;
                    var once = false;
                    if (options === undefined) {
                        capture = false;
                    } else if (options === true) {
                        capture = true;
                    } else if (options === false) {
                        capture = false;
                    } else {
                        capture = options ? !!options.capture : false;
                        once = options ? !!options.once : false;
                    }
                    var zone = Zone.current;
                    var symbolEventNames = zoneSymbolEventNames$1[eventName];
                    var symbolEventName;
                    if (!symbolEventNames) {
                        // the code is duplicate, but I just want to get some better performance
                        var falseEventName = eventName + FALSE_STR;
                        var trueEventName = eventName + TRUE_STR;
                        var symbol = ZONE_SYMBOL_PREFIX + falseEventName;
                        var symbolCapture = ZONE_SYMBOL_PREFIX + trueEventName;
                        zoneSymbolEventNames$1[eventName] = {};
                        zoneSymbolEventNames$1[eventName][FALSE_STR] = symbol;
                        zoneSymbolEventNames$1[eventName][TRUE_STR] = symbolCapture;
                        symbolEventName = capture ? symbolCapture : symbol;
                    } else {
                        symbolEventName = symbolEventNames[capture ? TRUE_STR : FALSE_STR];
                    }
                    var existingTasks = target[symbolEventName];
                    var isExisting = false;
                    if (existingTasks) {
                        // already have task registered
                        isExisting = true;
                        if (checkDuplicate) {
                            for (var i = 0; i < existingTasks.length; i++) {
                                if (compare(existingTasks[i], delegate)) {
                                    // same callback, same capture, same event name, just return
                                    return;
                                }
                            }
                        }
                    } else {
                        existingTasks = target[symbolEventName] = [];
                    }
                    var source;
                    var constructorName = target.constructor[CONSTRUCTOR_NAME];
                    var targetSource = globalSources[constructorName];
                    if (targetSource) {
                        source = targetSource[eventName];
                    }
                    if (!source) {
                        source = constructorName + addSource + eventName;
                    }
                    // do not create a new object as task.data to pass those things
                    // just use the global shared one
                    taskData.options = options;
                    if (once) {
                        // if addEventListener with once options, we don't pass it to
                        // native addEventListener, instead we keep the once setting
                        // and handle ourselves.
                        taskData.options.once = false;
                    }
                    taskData.target = target;
                    taskData.capture = capture;
                    taskData.eventName = eventName;
                    taskData.isExisting = isExisting;
                    var data = useGlobalCallback ? OPTIMIZED_ZONE_EVENT_TASK_DATA : null;
                    // keep taskData into data to allow onScheduleEventTask to acess the task information
                    if (data) {
                        data.taskData = taskData;
                    }
                    var task = zone.scheduleEventTask(source, delegate, data, customScheduleFn, customCancelFn);
                    // should clear taskData.target to avoid memory leak
                    // issue, https://github.com/angular/angular/issues/20442
                    taskData.target = null;
                    // need to clear up taskData because it is a global object
                    if (data) {
                        data.taskData = null;
                    }
                    // have to save those information to task in case
                    // application may call task.zone.cancelTask() directly
                    if (once) {
                        options.once = true;
                    }
                    task.options = options;
                    task.target = target;
                    task.capture = capture;
                    task.eventName = eventName;
                    if (isHandleEvent) {
                        // save original delegate for compare to check duplicate
                        task.originalDelegate = delegate;
                    }
                    if (!prepend) {
                        existingTasks.push(task);
                    } else {
                        existingTasks.unshift(task);
                    }
                    if (returnTarget) {
                        return target;
                    }
                };
            };
            proto[ADD_EVENT_LISTENER] = makeAddListener(nativeAddEventListener, ADD_EVENT_LISTENER_SOURCE, customSchedule, customCancel, returnTarget);
            if (nativePrependEventListener) {
                proto[PREPEND_EVENT_LISTENER] = makeAddListener(nativePrependEventListener, PREPEND_EVENT_LISTENER_SOURCE, customSchedulePrepend, customCancel, returnTarget, true);
            }
            proto[REMOVE_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                var options = arguments[2];
                var capture;
                if (options === undefined) {
                    capture = false;
                } else if (options === true) {
                    capture = true;
                } else if (options === false) {
                    capture = false;
                } else {
                    capture = options ? !!options.capture : false;
                }
                var delegate = arguments[1];
                if (!delegate) {
                    return nativeRemoveEventListener.apply(this, arguments);
                }
                if (validateHandler && !validateHandler(nativeRemoveEventListener, delegate, target, arguments)) {
                    return;
                }
                var symbolEventNames = zoneSymbolEventNames$1[eventName];
                var symbolEventName;
                if (symbolEventNames) {
                    symbolEventName = symbolEventNames[capture ? TRUE_STR : FALSE_STR];
                }
                var existingTasks = symbolEventName && target[symbolEventName];
                if (existingTasks) {
                    for (var i = 0; i < existingTasks.length; i++) {
                        var existingTask = existingTasks[i];
                        if (compare(existingTask, delegate)) {
                            existingTasks.splice(i, 1);
                            // set isRemoved to data for faster invokeTask check
                            existingTask.isRemoved = true;
                            if (existingTasks.length === 0) {
                                // all tasks for the eventName + capture have gone,
                                // remove globalZoneAwareCallback and remove the task cache from target
                                existingTask.allRemoved = true;
                                target[symbolEventName] = null;
                            }
                            existingTask.zone.cancelTask(existingTask);
                            return;
                        }
                    }
                }
                // issue 930, didn't find the event name or callback
                // from zone kept existingTasks, the callback maybe
                // added outside of zone, we need to call native removeEventListener
                // to try to remove it.
                return nativeRemoveEventListener.apply(this, arguments);
            };
            proto[LISTENERS_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                var listeners = [];
                var tasks = findEventTasks(target, eventName);
                for (var i = 0; i < tasks.length; i++) {
                    var task = tasks[i];
                    var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                    listeners.push(delegate);
                }
                return listeners;
            };
            proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (!eventName) {
                    var keys = Object.keys(target);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var match = EVENT_NAME_SYMBOL_REGX.exec(prop);
                        var evtName = match && match[1];
                        // in nodejs EventEmitter, removeListener event is
                        // used for monitoring the removeListener call,
                        // so just keep removeListener eventListener until
                        // all other eventListeners are removed
                        if (evtName && evtName !== 'removeListener') {
                            this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].apply(this, [evtName]);
                        }
                    }
                    // remove removeListener listener finally
                    this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].apply(this, ['removeListener']);
                } else {
                    var symbolEventNames = zoneSymbolEventNames$1[eventName];
                    if (symbolEventNames) {
                        var symbolEventName = symbolEventNames[FALSE_STR];
                        var symbolCaptureEventName = symbolEventNames[TRUE_STR];
                        var tasks = target[symbolEventName];
                        var captureTasks = target[symbolCaptureEventName];
                        if (tasks) {
                            var removeTasks = tasks.slice();
                            for (var i = 0; i < removeTasks.length; i++) {
                                var task = removeTasks[i];
                                var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                                this[REMOVE_EVENT_LISTENER].apply(this, [eventName, delegate, task.options]);
                            }
                        }
                        if (captureTasks) {
                            var removeTasks = captureTasks.slice();
                            for (var i = 0; i < removeTasks.length; i++) {
                                var task = removeTasks[i];
                                var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                                this[REMOVE_EVENT_LISTENER].apply(this, [eventName, delegate, task.options]);
                            }
                        }
                    }
                }
            };
            // for native toString patch
            attachOriginToPatched(proto[ADD_EVENT_LISTENER], nativeAddEventListener);
            attachOriginToPatched(proto[REMOVE_EVENT_LISTENER], nativeRemoveEventListener);
            if (nativeRemoveAllListeners) {
                attachOriginToPatched(proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER], nativeRemoveAllListeners);
            }
            if (nativeListeners) {
                attachOriginToPatched(proto[LISTENERS_EVENT_LISTENER], nativeListeners);
            }
            return true;
        }
        var results = [];
        for (var i = 0; i < apis.length; i++) {
            results[i] = patchEventTargetMethods(apis[i], patchOptions);
        }
        return results;
    }
    function findEventTasks(target, eventName) {
        var foundTasks = [];
        for (var prop in target) {
            var match = EVENT_NAME_SYMBOL_REGX.exec(prop);
            var evtName = match && match[1];
            if (evtName && (!eventName || evtName === eventName)) {
                var tasks = target[prop];
                if (tasks) {
                    for (var i = 0; i < tasks.length; i++) {
                        foundTasks.push(tasks[i]);
                    }
                }
            }
        }
        return foundTasks;
    }
    function patchEventPrototype(global, api) {
        var Event = global['Event'];
        if (Event && Event.prototype) {
            api.patchMethod(Event.prototype, 'stopImmediatePropagation', function (delegate) {
                return function (self, args) {
                    self[IMMEDIATE_PROPAGATION_SYMBOL] = true;
                    // we need to call the native stopImmediatePropagation
                    // in case in some hybrid application, some part of
                    // application will be controlled by zone, some are not
                    delegate && delegate.apply(self, args);
                };
            });
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    var taskSymbol = zoneSymbol('zoneTask');
    function patchTimer(window, setName, cancelName, nameSuffix) {
        var setNative = null;
        var clearNative = null;
        setName += nameSuffix;
        cancelName += nameSuffix;
        var tasksByHandleId = {};
        var NUMBER = 'number';
        var STRING = 'string';
        var FUNCTION = 'function';
        var INTERVAL = 'Interval';
        var TIMEOUT = 'Timeout';
        var NOT_SCHEDULED = 'notScheduled';
        function scheduleTask(task) {
            var data = task.data;
            function timer() {
                try {
                    task.invoke.apply(this, arguments);
                } finally {
                    if (task.data && task.data.isPeriodic) {
                        // issue-934, task will be cancelled
                        // even it is a periodic task such as
                        // setInterval
                        return;
                    }
                    if (_typeof(data.handleId) === NUMBER) {
                        // in non-nodejs env, we remove timerId
                        // from local cache
                        delete tasksByHandleId[data.handleId];
                    } else if (data.handleId) {
                        // Node returns complex objects as handleIds
                        // we remove task reference from timer object
                        data.handleId[taskSymbol] = null;
                    }
                }
            }
            data.args[0] = timer;
            data.handleId = setNative.apply(window, data.args);
            return task;
        }
        function clearTask(task) {
            return clearNative(task.data.handleId);
        }
        setNative = patchMethod(window, setName, function (delegate) {
            return function (self, args) {
                if (_typeof(args[0]) === FUNCTION) {
                    var zone = Zone.current;
                    var options = {
                        handleId: null,
                        isPeriodic: nameSuffix === INTERVAL,
                        delay: nameSuffix === TIMEOUT || nameSuffix === INTERVAL ? args[1] || 0 : null,
                        args: args
                    };
                    var task = zone.scheduleMacroTask(setName, args[0], options, scheduleTask, clearTask);
                    if (!task) {
                        return task;
                    }
                    // Node.js must additionally support the ref and unref functions.
                    var handle = task.data.handleId;
                    if ((typeof handle === 'undefined' ? 'undefined' : _typeof(handle)) === NUMBER) {
                        // for non nodejs env, we save handleId: task
                        // mapping in local cache for clearTimeout
                        tasksByHandleId[handle] = task;
                    } else if (handle) {
                        // for nodejs env, we save task
                        // reference in timerId Object for clearTimeout
                        handle[taskSymbol] = task;
                    }
                    // check whether handle is null, because some polyfill or browser
                    // may return undefined from setTimeout/setInterval/setImmediate/requestAnimationFrame
                    if (handle && handle.ref && handle.unref && _typeof(handle.ref) === FUNCTION && _typeof(handle.unref) === FUNCTION) {
                        task.ref = handle.ref.bind(handle);
                        task.unref = handle.unref.bind(handle);
                    }
                    if ((typeof handle === 'undefined' ? 'undefined' : _typeof(handle)) === NUMBER || handle) {
                        return handle;
                    }
                    return task;
                } else {
                    // cause an error by calling it directly.
                    return delegate.apply(window, args);
                }
            };
        });
        clearNative = patchMethod(window, cancelName, function (delegate) {
            return function (self, args) {
                var id = args[0];
                var task;
                if ((typeof id === 'undefined' ? 'undefined' : _typeof(id)) === NUMBER) {
                    // non nodejs env.
                    task = tasksByHandleId[id];
                } else {
                    // nodejs env.
                    task = id && id[taskSymbol];
                    // other environments.
                    if (!task) {
                        task = id;
                    }
                }
                if (task && _typeof(task.type) === STRING) {
                    if (task.state !== NOT_SCHEDULED && (task.cancelFn && task.data.isPeriodic || task.runCount === 0)) {
                        if ((typeof id === 'undefined' ? 'undefined' : _typeof(id)) === NUMBER) {
                            delete tasksByHandleId[id];
                        } else if (id) {
                            id[taskSymbol] = null;
                        }
                        // Do not cancel already canceled functions
                        task.zone.cancelTask(task);
                    }
                } else {
                    // cause an error by calling it directly.
                    delegate.apply(window, args);
                }
            };
        });
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /*
     * This is necessary for Chrome and Chrome mobile, to enable
     * things like redefining `createdCallback` on an element.
     */
    var _defineProperty = Object[zoneSymbol('defineProperty')] = Object.defineProperty;
    var _getOwnPropertyDescriptor = Object[zoneSymbol('getOwnPropertyDescriptor')] = Object.getOwnPropertyDescriptor;
    var _create = Object.create;
    var unconfigurablesKey = zoneSymbol('unconfigurables');
    var PROTOTYPE = 'prototype';
    var OBJECT = 'object';
    var UNDEFINED$1 = 'undefined';
    function propertyPatch() {
        Object.defineProperty = function (obj, prop, desc) {
            if (isUnconfigurable(obj, prop)) {
                throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
            }
            var originalConfigurableFlag = desc.configurable;
            if (prop !== PROTOTYPE) {
                desc = rewriteDescriptor(obj, prop, desc);
            }
            return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
        };
        Object.defineProperties = function (obj, props) {
            Object.keys(props).forEach(function (prop) {
                Object.defineProperty(obj, prop, props[prop]);
            });
            return obj;
        };
        Object.create = function (obj, proto) {
            if ((typeof proto === 'undefined' ? 'undefined' : _typeof(proto)) === OBJECT && !Object.isFrozen(proto)) {
                Object.keys(proto).forEach(function (prop) {
                    proto[prop] = rewriteDescriptor(obj, prop, proto[prop]);
                });
            }
            return _create(obj, proto);
        };
        Object.getOwnPropertyDescriptor = function (obj, prop) {
            var desc = _getOwnPropertyDescriptor(obj, prop);
            if (isUnconfigurable(obj, prop)) {
                desc.configurable = false;
            }
            return desc;
        };
    }
    function _redefineProperty(obj, prop, desc) {
        var originalConfigurableFlag = desc.configurable;
        desc = rewriteDescriptor(obj, prop, desc);
        return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
    }
    function isUnconfigurable(obj, prop) {
        return obj && obj[unconfigurablesKey] && obj[unconfigurablesKey][prop];
    }
    function rewriteDescriptor(obj, prop, desc) {
        // issue-927, if the desc is frozen, don't try to change the desc
        if (!Object.isFrozen(desc)) {
            desc.configurable = true;
        }
        if (!desc.configurable) {
            // issue-927, if the obj is frozen, don't try to set the desc to obj
            if (!obj[unconfigurablesKey] && !Object.isFrozen(obj)) {
                _defineProperty(obj, unconfigurablesKey, { writable: true, value: {} });
            }
            if (obj[unconfigurablesKey]) {
                obj[unconfigurablesKey][prop] = true;
            }
        }
        return desc;
    }
    function _tryDefineProperty(obj, prop, desc, originalConfigurableFlag) {
        try {
            return _defineProperty(obj, prop, desc);
        } catch (error) {
            if (desc.configurable) {
                // In case of errors, when the configurable flag was likely set by rewriteDescriptor(), let's
                // retry with the original flag value
                if ((typeof originalConfigurableFlag === 'undefined' ? 'undefined' : _typeof(originalConfigurableFlag)) == UNDEFINED$1) {
                    delete desc.configurable;
                } else {
                    desc.configurable = originalConfigurableFlag;
                }
                try {
                    return _defineProperty(obj, prop, desc);
                } catch (error) {
                    var descJson = null;
                    try {
                        descJson = JSON.stringify(desc);
                    } catch (error) {
                        descJson = desc.toString();
                    }
                    console.log("Attempting to configure '" + prop + "' with descriptor '" + descJson + "' on object '" + obj + "' and got error, giving up: " + error);
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    // we have to patch the instance since the proto is non-configurable
    function apply(api, _global) {
        var WS = _global.WebSocket;
        // On Safari window.EventTarget doesn't exist so need to patch WS add/removeEventListener
        // On older Chrome, no need since EventTarget was already patched
        if (!_global.EventTarget) {
            patchEventTarget(_global, [WS.prototype]);
        }
        _global.WebSocket = function (a, b) {
            var socket = arguments.length > 1 ? new WS(a, b) : new WS(a);
            var proxySocket;
            var proxySocketProto;
            // Safari 7.0 has non-configurable own 'onmessage' and friends properties on the socket instance
            var onmessageDesc = Object.getOwnPropertyDescriptor(socket, 'onmessage');
            if (onmessageDesc && onmessageDesc.configurable === false) {
                proxySocket = Object.create(socket);
                // socket have own property descriptor 'onopen', 'onmessage', 'onclose', 'onerror'
                // but proxySocket not, so we will keep socket as prototype and pass it to
                // patchOnProperties method
                proxySocketProto = socket;
                ['addEventListener', 'removeEventListener', 'send', 'close'].forEach(function (propName) {
                    proxySocket[propName] = function () {
                        var args = Array.prototype.slice.call(arguments);
                        if (propName === 'addEventListener' || propName === 'removeEventListener') {
                            var eventName = args.length > 0 ? args[0] : undefined;
                            if (eventName) {
                                var propertySymbol = Zone.__symbol__('ON_PROPERTY' + eventName);
                                socket[propertySymbol] = proxySocket[propertySymbol];
                            }
                        }
                        return socket[propName].apply(socket, args);
                    };
                });
            } else {
                // we can patch the real socket
                proxySocket = socket;
            }
            patchOnProperties(proxySocket, ['close', 'error', 'message', 'open'], proxySocketProto);
            return proxySocket;
        };
        var globalWebSocket = _global['WebSocket'];
        for (var prop in WS) {
            globalWebSocket[prop] = WS[prop];
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @fileoverview
     * @suppress {globalThis}
     */
    var globalEventHandlersEventNames = ['abort', 'animationcancel', 'animationend', 'animationiteration', 'auxclick', 'beforeinput', 'blur', 'cancel', 'canplay', 'canplaythrough', 'change', 'compositionstart', 'compositionupdate', 'compositionend', 'cuechange', 'click', 'close', 'contextmenu', 'curechange', 'dblclick', 'drag', 'dragend', 'dragenter', 'dragexit', 'dragleave', 'dragover', 'drop', 'durationchange', 'emptied', 'ended', 'error', 'focus', 'focusin', 'focusout', 'gotpointercapture', 'input', 'invalid', 'keydown', 'keypress', 'keyup', 'load', 'loadstart', 'loadeddata', 'loadedmetadata', 'lostpointercapture', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'mousewheel', 'orientationchange', 'pause', 'play', 'playing', 'pointercancel', 'pointerdown', 'pointerenter', 'pointerleave', 'pointerlockchange', 'mozpointerlockchange', 'webkitpointerlockerchange', 'pointerlockerror', 'mozpointerlockerror', 'webkitpointerlockerror', 'pointermove', 'pointout', 'pointerover', 'pointerup', 'progress', 'ratechange', 'reset', 'resize', 'scroll', 'seeked', 'seeking', 'select', 'selectionchange', 'selectstart', 'show', 'sort', 'stalled', 'submit', 'suspend', 'timeupdate', 'volumechange', 'touchcancel', 'touchmove', 'touchstart', 'touchend', 'transitioncancel', 'transitionend', 'waiting', 'wheel'];
    var documentEventNames = ['afterscriptexecute', 'beforescriptexecute', 'DOMContentLoaded', 'fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'msfullscreenchange', 'fullscreenerror', 'mozfullscreenerror', 'webkitfullscreenerror', 'msfullscreenerror', 'readystatechange', 'visibilitychange'];
    var windowEventNames = ['absolutedeviceorientation', 'afterinput', 'afterprint', 'appinstalled', 'beforeinstallprompt', 'beforeprint', 'beforeunload', 'devicelight', 'devicemotion', 'deviceorientation', 'deviceorientationabsolute', 'deviceproximity', 'hashchange', 'languagechange', 'message', 'mozbeforepaint', 'offline', 'online', 'paint', 'pageshow', 'pagehide', 'popstate', 'rejectionhandled', 'storage', 'unhandledrejection', 'unload', 'userproximity', 'vrdisplyconnected', 'vrdisplaydisconnected', 'vrdisplaypresentchange'];
    var htmlElementEventNames = ['beforecopy', 'beforecut', 'beforepaste', 'copy', 'cut', 'paste', 'dragstart', 'loadend', 'animationstart', 'search', 'transitionrun', 'transitionstart', 'webkitanimationend', 'webkitanimationiteration', 'webkitanimationstart', 'webkittransitionend'];
    var mediaElementEventNames = ['encrypted', 'waitingforkey', 'msneedkey', 'mozinterruptbegin', 'mozinterruptend'];
    var ieElementEventNames = ['activate', 'afterupdate', 'ariarequest', 'beforeactivate', 'beforedeactivate', 'beforeeditfocus', 'beforeupdate', 'cellchange', 'controlselect', 'dataavailable', 'datasetchanged', 'datasetcomplete', 'errorupdate', 'filterchange', 'layoutcomplete', 'losecapture', 'move', 'moveend', 'movestart', 'propertychange', 'resizeend', 'resizestart', 'rowenter', 'rowexit', 'rowsdelete', 'rowsinserted', 'command', 'compassneedscalibration', 'deactivate', 'help', 'mscontentzoom', 'msmanipulationstatechanged', 'msgesturechange', 'msgesturedoubletap', 'msgestureend', 'msgesturehold', 'msgesturestart', 'msgesturetap', 'msgotpointercapture', 'msinertiastart', 'mslostpointercapture', 'mspointercancel', 'mspointerdown', 'mspointerenter', 'mspointerhover', 'mspointerleave', 'mspointermove', 'mspointerout', 'mspointerover', 'mspointerup', 'pointerout', 'mssitemodejumplistitemremoved', 'msthumbnailclick', 'stop', 'storagecommit'];
    var webglEventNames = ['webglcontextrestored', 'webglcontextlost', 'webglcontextcreationerror'];
    var formEventNames = ['autocomplete', 'autocompleteerror'];
    var detailEventNames = ['toggle'];
    var frameEventNames = ['load'];
    var frameSetEventNames = ['blur', 'error', 'focus', 'load', 'resize', 'scroll', 'messageerror'];
    var marqueeEventNames = ['bounce', 'finish', 'start'];
    var XMLHttpRequestEventNames = ['loadstart', 'progress', 'abort', 'error', 'load', 'progress', 'timeout', 'loadend', 'readystatechange'];
    var IDBIndexEventNames = ['upgradeneeded', 'complete', 'abort', 'success', 'error', 'blocked', 'versionchange', 'close'];
    var websocketEventNames = ['close', 'error', 'open', 'message'];
    var workerEventNames = ['error', 'message'];
    var eventNames = globalEventHandlersEventNames.concat(webglEventNames, formEventNames, detailEventNames, documentEventNames, windowEventNames, htmlElementEventNames, ieElementEventNames);
    function filterProperties(target, onProperties, ignoreProperties) {
        if (!ignoreProperties) {
            return onProperties;
        }
        var tip = ignoreProperties.filter(function (ip) {
            return ip.target === target;
        });
        if (!tip || tip.length === 0) {
            return onProperties;
        }
        var targetIgnoreProperties = tip[0].ignoreProperties;
        return onProperties.filter(function (op) {
            return targetIgnoreProperties.indexOf(op) === -1;
        });
    }
    function patchFilteredProperties(target, onProperties, ignoreProperties, prototype) {
        var filteredProperties = filterProperties(target, onProperties, ignoreProperties);
        patchOnProperties(target, filteredProperties, prototype);
    }
    function propertyDescriptorPatch(api, _global) {
        if (isNode && !isMix) {
            return;
        }
        var supportsWebSocket = typeof WebSocket !== 'undefined';
        if (canPatchViaPropertyDescriptor()) {
            var ignoreProperties = _global.__Zone_ignore_on_properties;
            // for browsers that we can patch the descriptor:  Chrome & Firefox
            if (isBrowser) {
                // in IE/Edge, onProp not exist in window object, but in WindowPrototype
                // so we need to pass WindowPrototype to check onProp exist or not
                patchFilteredProperties(window, eventNames.concat(['messageerror']), ignoreProperties, Object.getPrototypeOf(window));
                patchFilteredProperties(Document.prototype, eventNames, ignoreProperties);
                if (typeof window['SVGElement'] !== 'undefined') {
                    patchFilteredProperties(window['SVGElement'].prototype, eventNames, ignoreProperties);
                }
                patchFilteredProperties(Element.prototype, eventNames, ignoreProperties);
                patchFilteredProperties(HTMLElement.prototype, eventNames, ignoreProperties);
                patchFilteredProperties(HTMLMediaElement.prototype, mediaElementEventNames, ignoreProperties);
                patchFilteredProperties(HTMLFrameSetElement.prototype, windowEventNames.concat(frameSetEventNames), ignoreProperties);
                patchFilteredProperties(HTMLBodyElement.prototype, windowEventNames.concat(frameSetEventNames), ignoreProperties);
                patchFilteredProperties(HTMLFrameElement.prototype, frameEventNames, ignoreProperties);
                patchFilteredProperties(HTMLIFrameElement.prototype, frameEventNames, ignoreProperties);
                var HTMLMarqueeElement_1 = window['HTMLMarqueeElement'];
                if (HTMLMarqueeElement_1) {
                    patchFilteredProperties(HTMLMarqueeElement_1.prototype, marqueeEventNames, ignoreProperties);
                }
                var Worker_1 = window['Worker'];
                if (Worker_1) {
                    patchFilteredProperties(Worker_1.prototype, workerEventNames, ignoreProperties);
                }
            }
            patchFilteredProperties(XMLHttpRequest.prototype, XMLHttpRequestEventNames, ignoreProperties);
            var XMLHttpRequestEventTarget = _global['XMLHttpRequestEventTarget'];
            if (XMLHttpRequestEventTarget) {
                patchFilteredProperties(XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype, XMLHttpRequestEventNames, ignoreProperties);
            }
            if (typeof IDBIndex !== 'undefined') {
                patchFilteredProperties(IDBIndex.prototype, IDBIndexEventNames, ignoreProperties);
                patchFilteredProperties(IDBRequest.prototype, IDBIndexEventNames, ignoreProperties);
                patchFilteredProperties(IDBOpenDBRequest.prototype, IDBIndexEventNames, ignoreProperties);
                patchFilteredProperties(IDBDatabase.prototype, IDBIndexEventNames, ignoreProperties);
                patchFilteredProperties(IDBTransaction.prototype, IDBIndexEventNames, ignoreProperties);
                patchFilteredProperties(IDBCursor.prototype, IDBIndexEventNames, ignoreProperties);
            }
            if (supportsWebSocket) {
                patchFilteredProperties(WebSocket.prototype, websocketEventNames, ignoreProperties);
            }
        } else {
            // Safari, Android browsers (Jelly Bean)
            patchViaCapturingAllTheEvents();
            patchClass('XMLHttpRequest');
            if (supportsWebSocket) {
                apply(api, _global);
            }
        }
    }
    function canPatchViaPropertyDescriptor() {
        if ((isBrowser || isMix) && !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') && typeof Element !== 'undefined') {
            // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
            // IDL interface attributes are not configurable
            var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
            if (desc && !desc.configurable) return false;
        }
        var xhrDesc = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'onreadystatechange');
        // add enumerable and configurable here because in opera
        // by default XMLHttpRequest.prototype.onreadystatechange is undefined
        // without adding enumerable and configurable will cause onreadystatechange
        // non-configurable
        // and if XMLHttpRequest.prototype.onreadystatechange is undefined,
        // we should set a real desc instead a fake one
        if (xhrDesc) {
            Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {
                enumerable: true,
                configurable: true,
                get: function get() {
                    return true;
                }
            });
            var req = new XMLHttpRequest();
            var result = !!req.onreadystatechange;
            // restore original desc
            Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', xhrDesc || {});
            return result;
        } else {
            var SYMBOL_FAKE_ONREADYSTATECHANGE_1 = zoneSymbol('fakeonreadystatechange');
            Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {
                enumerable: true,
                configurable: true,
                get: function get() {
                    return this[SYMBOL_FAKE_ONREADYSTATECHANGE_1];
                },
                set: function set(value) {
                    this[SYMBOL_FAKE_ONREADYSTATECHANGE_1] = value;
                }
            });
            var req = new XMLHttpRequest();
            var detectFunc = function detectFunc() {};
            req.onreadystatechange = detectFunc;
            var result = req[SYMBOL_FAKE_ONREADYSTATECHANGE_1] === detectFunc;
            req.onreadystatechange = null;
            return result;
        }
    }
    var unboundKey = zoneSymbol('unbound');
    // Whenever any eventListener fires, we check the eventListener target and all parents
    // for `onwhatever` properties and replace them with zone-bound functions
    // - Chrome (for now)
    function patchViaCapturingAllTheEvents() {
        var _loop_1 = function _loop_1(i) {
            var property = eventNames[i];
            var onproperty = 'on' + property;
            self.addEventListener(property, function (event) {
                var elt = event.target,
                    bound,
                    source;
                if (elt) {
                    source = elt.constructor['name'] + '.' + onproperty;
                } else {
                    source = 'unknown.' + onproperty;
                }
                while (elt) {
                    if (elt[onproperty] && !elt[onproperty][unboundKey]) {
                        bound = Zone.current.wrap(elt[onproperty], source);
                        bound[unboundKey] = elt[onproperty];
                        elt[onproperty] = bound;
                    }
                    elt = elt.parentElement;
                }
            }, true);
        };
        for (var i = 0; i < eventNames.length; i++) {
            _loop_1(i);
        }
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function eventTargetPatch(_global, api) {
        var WTF_ISSUE_555 = 'Anchor,Area,Audio,BR,Base,BaseFont,Body,Button,Canvas,Content,DList,Directory,Div,Embed,FieldSet,Font,Form,Frame,FrameSet,HR,Head,Heading,Html,IFrame,Image,Input,Keygen,LI,Label,Legend,Link,Map,Marquee,Media,Menu,Meta,Meter,Mod,OList,Object,OptGroup,Option,Output,Paragraph,Pre,Progress,Quote,Script,Select,Source,Span,Style,TableCaption,TableCell,TableCol,Table,TableRow,TableSection,TextArea,Title,Track,UList,Unknown,Video';
        var NO_EVENT_TARGET = 'ApplicationCache,EventSource,FileReader,InputMethodContext,MediaController,MessagePort,Node,Performance,SVGElementInstance,SharedWorker,TextTrack,TextTrackCue,TextTrackList,WebKitNamedFlow,Window,Worker,WorkerGlobalScope,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload,IDBRequest,IDBOpenDBRequest,IDBDatabase,IDBTransaction,IDBCursor,DBIndex,WebSocket'.split(',');
        var EVENT_TARGET = 'EventTarget';
        var apis = [];
        var isWtf = _global['wtf'];
        var WTF_ISSUE_555_ARRAY = WTF_ISSUE_555.split(',');
        if (isWtf) {
            // Workaround for: https://github.com/google/tracing-framework/issues/555
            apis = WTF_ISSUE_555_ARRAY.map(function (v) {
                return 'HTML' + v + 'Element';
            }).concat(NO_EVENT_TARGET);
        } else if (_global[EVENT_TARGET]) {
            apis.push(EVENT_TARGET);
        } else {
            // Note: EventTarget is not available in all browsers,
            // if it's not available, we instead patch the APIs in the IDL that inherit from EventTarget
            apis = NO_EVENT_TARGET;
        }
        var isDisableIECheck = _global['__Zone_disable_IE_check'] || false;
        var isEnableCrossContextCheck = _global['__Zone_enable_cross_context_check'] || false;
        var ieOrEdge = isIEOrEdge();
        var ADD_EVENT_LISTENER_SOURCE = '.addEventListener:';
        var FUNCTION_WRAPPER = '[object FunctionWrapper]';
        var BROWSER_TOOLS = 'function __BROWSERTOOLS_CONSOLE_SAFEFUNC() { [native code] }';
        //  predefine all __zone_symbol__ + eventName + true/false string
        for (var i = 0; i < eventNames.length; i++) {
            var eventName = eventNames[i];
            var falseEventName = eventName + FALSE_STR;
            var trueEventName = eventName + TRUE_STR;
            var symbol = ZONE_SYMBOL_PREFIX + falseEventName;
            var symbolCapture = ZONE_SYMBOL_PREFIX + trueEventName;
            zoneSymbolEventNames$1[eventName] = {};
            zoneSymbolEventNames$1[eventName][FALSE_STR] = symbol;
            zoneSymbolEventNames$1[eventName][TRUE_STR] = symbolCapture;
        }
        //  predefine all task.source string
        for (var i = 0; i < WTF_ISSUE_555.length; i++) {
            var target = WTF_ISSUE_555_ARRAY[i];
            var targets = globalSources[target] = {};
            for (var j = 0; j < eventNames.length; j++) {
                var eventName = eventNames[j];
                targets[eventName] = target + ADD_EVENT_LISTENER_SOURCE + eventName;
            }
        }
        var checkIEAndCrossContext = function checkIEAndCrossContext(nativeDelegate, delegate, target, args) {
            if (!isDisableIECheck && ieOrEdge) {
                if (isEnableCrossContextCheck) {
                    try {
                        var testString = delegate.toString();
                        if (testString === FUNCTION_WRAPPER || testString == BROWSER_TOOLS) {
                            nativeDelegate.apply(target, args);
                            return false;
                        }
                    } catch (error) {
                        nativeDelegate.apply(target, args);
                        return false;
                    }
                } else {
                    var testString = delegate.toString();
                    if (testString === FUNCTION_WRAPPER || testString == BROWSER_TOOLS) {
                        nativeDelegate.apply(target, args);
                        return false;
                    }
                }
            } else if (isEnableCrossContextCheck) {
                try {
                    delegate.toString();
                } catch (error) {
                    nativeDelegate.apply(target, args);
                    return false;
                }
            }
            return true;
        };
        var apiTypes = [];
        for (var i = 0; i < apis.length; i++) {
            var type = _global[apis[i]];
            apiTypes.push(type && type.prototype);
        }
        patchEventTarget(_global, apiTypes, { validateHandler: checkIEAndCrossContext });
        api.patchEventTarget = patchEventTarget;
        return true;
    }
    function patchEvent(global, api) {
        patchEventPrototype(global, api);
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    function registerElementPatch(_global) {
        if (!isBrowser && !isMix || !('registerElement' in _global.document)) {
            return;
        }
        var _registerElement = document.registerElement;
        var callbacks = ['createdCallback', 'attachedCallback', 'detachedCallback', 'attributeChangedCallback'];
        document.registerElement = function (name, opts) {
            if (opts && opts.prototype) {
                callbacks.forEach(function (callback) {
                    var source = 'Document.registerElement::' + callback;
                    if (opts.prototype.hasOwnProperty(callback)) {
                        var descriptor = Object.getOwnPropertyDescriptor(opts.prototype, callback);
                        if (descriptor && descriptor.value) {
                            descriptor.value = Zone.current.wrap(descriptor.value, source);
                            _redefineProperty(opts.prototype, callback, descriptor);
                        } else {
                            opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
                        }
                    } else if (opts.prototype[callback]) {
                        opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
                    }
                });
            }
            return _registerElement.apply(document, [name, opts]);
        };
        attachOriginToPatched(document.registerElement, _registerElement);
    }

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    Zone.__load_patch('util', function (global, Zone, api) {
        api.patchOnProperties = patchOnProperties;
        api.patchMethod = patchMethod;
        api.patchArguments = patchArguments;
    });
    Zone.__load_patch('timers', function (global, Zone, api) {
        var set = 'set';
        var clear = 'clear';
        patchTimer(global, set, clear, 'Timeout');
        patchTimer(global, set, clear, 'Interval');
        patchTimer(global, set, clear, 'Immediate');
    });
    Zone.__load_patch('requestAnimationFrame', function (global, Zone, api) {
        patchTimer(global, 'request', 'cancel', 'AnimationFrame');
        patchTimer(global, 'mozRequest', 'mozCancel', 'AnimationFrame');
        patchTimer(global, 'webkitRequest', 'webkitCancel', 'AnimationFrame');
    });
    Zone.__load_patch('blocking', function (global, Zone, api) {
        var blockingMethods = ['alert', 'prompt', 'confirm'];
        for (var i = 0; i < blockingMethods.length; i++) {
            var name_1 = blockingMethods[i];
            patchMethod(global, name_1, function (delegate, symbol, name) {
                return function (s, args) {
                    return Zone.current.run(delegate, global, args, name);
                };
            });
        }
    });
    Zone.__load_patch('EventTarget', function (global, Zone, api) {
        // load blackListEvents from global
        var SYMBOL_BLACK_LISTED_EVENTS = Zone.__symbol__('BLACK_LISTED_EVENTS');
        if (global[SYMBOL_BLACK_LISTED_EVENTS]) {
            Zone[SYMBOL_BLACK_LISTED_EVENTS] = global[SYMBOL_BLACK_LISTED_EVENTS];
        }
        patchEvent(global, api);
        eventTargetPatch(global, api);
        // patch XMLHttpRequestEventTarget's addEventListener/removeEventListener
        var XMLHttpRequestEventTarget = global['XMLHttpRequestEventTarget'];
        if (XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype) {
            api.patchEventTarget(global, [XMLHttpRequestEventTarget.prototype]);
        }
        patchClass('MutationObserver');
        patchClass('WebKitMutationObserver');
        patchClass('IntersectionObserver');
        patchClass('FileReader');
    });
    Zone.__load_patch('on_property', function (global, Zone, api) {
        propertyDescriptorPatch(api, global);
        propertyPatch();
        registerElementPatch(global);
    });
    Zone.__load_patch('canvas', function (global, Zone, api) {
        var HTMLCanvasElement = global['HTMLCanvasElement'];
        if (typeof HTMLCanvasElement !== 'undefined' && HTMLCanvasElement.prototype && HTMLCanvasElement.prototype.toBlob) {
            patchMacroTask(HTMLCanvasElement.prototype, 'toBlob', function (self, args) {
                return { name: 'HTMLCanvasElement.toBlob', target: self, callbackIndex: 0, args: args };
            });
        }
    });
    Zone.__load_patch('XHR', function (global, Zone, api) {
        // Treat XMLHTTPRequest as a macrotask.
        patchXHR(global);
        var XHR_TASK = zoneSymbol('xhrTask');
        var XHR_SYNC = zoneSymbol('xhrSync');
        var XHR_LISTENER = zoneSymbol('xhrListener');
        var XHR_SCHEDULED = zoneSymbol('xhrScheduled');
        var XHR_URL = zoneSymbol('xhrURL');
        function patchXHR(window) {
            function findPendingTask(target) {
                var pendingTask = target[XHR_TASK];
                return pendingTask;
            }
            var SYMBOL_ADDEVENTLISTENER = zoneSymbol('addEventListener');
            var SYMBOL_REMOVEEVENTLISTENER = zoneSymbol('removeEventListener');
            var oriAddListener = XMLHttpRequest.prototype[SYMBOL_ADDEVENTLISTENER];
            var oriRemoveListener = XMLHttpRequest.prototype[SYMBOL_REMOVEEVENTLISTENER];
            if (!oriAddListener) {
                var XMLHttpRequestEventTarget = window['XMLHttpRequestEventTarget'];
                if (XMLHttpRequestEventTarget) {
                    oriAddListener = XMLHttpRequestEventTarget.prototype[SYMBOL_ADDEVENTLISTENER];
                    oriRemoveListener = XMLHttpRequestEventTarget.prototype[SYMBOL_REMOVEEVENTLISTENER];
                }
            }
            var READY_STATE_CHANGE = 'readystatechange';
            var SCHEDULED = 'scheduled';
            function scheduleTask(task) {
                XMLHttpRequest[XHR_SCHEDULED] = false;
                var data = task.data;
                var target = data.target;
                // remove existing event listener
                var listener = target[XHR_LISTENER];
                if (!oriAddListener) {
                    oriAddListener = target[SYMBOL_ADDEVENTLISTENER];
                    oriRemoveListener = target[SYMBOL_REMOVEEVENTLISTENER];
                }
                if (listener) {
                    oriRemoveListener.apply(target, [READY_STATE_CHANGE, listener]);
                }
                var newListener = target[XHR_LISTENER] = function () {
                    if (target.readyState === target.DONE) {
                        // sometimes on some browsers XMLHttpRequest will fire onreadystatechange with
                        // readyState=4 multiple times, so we need to check task state here
                        if (!data.aborted && XMLHttpRequest[XHR_SCHEDULED] && task.state === SCHEDULED) {
                            task.invoke();
                        }
                    }
                };
                oriAddListener.apply(target, [READY_STATE_CHANGE, newListener]);
                var storedTask = target[XHR_TASK];
                if (!storedTask) {
                    target[XHR_TASK] = task;
                }
                sendNative.apply(target, data.args);
                XMLHttpRequest[XHR_SCHEDULED] = true;
                return task;
            }
            function placeholderCallback() {}
            function clearTask(task) {
                var data = task.data;
                // Note - ideally, we would call data.target.removeEventListener here, but it's too late
                // to prevent it from firing. So instead, we store info for the event listener.
                data.aborted = true;
                return abortNative.apply(data.target, data.args);
            }
            var openNative = patchMethod(window.XMLHttpRequest.prototype, 'open', function () {
                return function (self, args) {
                    self[XHR_SYNC] = args[2] == false;
                    self[XHR_URL] = args[1];
                    return openNative.apply(self, args);
                };
            });
            var XMLHTTPREQUEST_SOURCE = 'XMLHttpRequest.send';
            var sendNative = patchMethod(window.XMLHttpRequest.prototype, 'send', function () {
                return function (self, args) {
                    var zone = Zone.current;
                    if (self[XHR_SYNC]) {
                        // if the XHR is sync there is no task to schedule, just execute the code.
                        return sendNative.apply(self, args);
                    } else {
                        var options = {
                            target: self,
                            url: self[XHR_URL],
                            isPeriodic: false,
                            delay: null,
                            args: args,
                            aborted: false
                        };
                        return zone.scheduleMacroTask(XMLHTTPREQUEST_SOURCE, placeholderCallback, options, scheduleTask, clearTask);
                    }
                };
            });
            var STRING_TYPE = 'string';
            var abortNative = patchMethod(window.XMLHttpRequest.prototype, 'abort', function (delegate) {
                return function (self, args) {
                    var task = findPendingTask(self);
                    if (task && _typeof(task.type) == STRING_TYPE) {
                        // If the XHR has already completed, do nothing.
                        // If the XHR has already been aborted, do nothing.
                        // Fix #569, call abort multiple times before done will cause
                        // macroTask task count be negative number
                        if (task.cancelFn == null || task.data && task.data.aborted) {
                            return;
                        }
                        task.zone.cancelTask(task);
                    }
                    // Otherwise, we are trying to abort an XHR which has not yet been sent, so there is no
                    // task
                    // to cancel. Do nothing.
                };
            });
        }
    });
    Zone.__load_patch('geolocation', function (global, Zone, api) {
        /// GEO_LOCATION
        if (global['navigator'] && global['navigator'].geolocation) {
            patchPrototype(global['navigator'].geolocation, ['getCurrentPosition', 'watchPosition']);
        }
    });
    Zone.__load_patch('getUserMedia', function (global, Zone, api) {
        var navigator = global['navigator'];
        if (navigator && navigator.getUserMedia) {
            navigator.getUserMedia = wrapFunctionArgs(navigator.getUserMedia);
        }
    });
    Zone.__load_patch('PromiseRejectionEvent', function (global, Zone, api) {
        // handle unhandled promise rejection
        function findPromiseRejectionHandler(evtName) {
            return function (e) {
                var eventTasks = findEventTasks(global, evtName);
                eventTasks.forEach(function (eventTask) {
                    // windows has added unhandledrejection event listener
                    // trigger the event listener
                    var PromiseRejectionEvent = global['PromiseRejectionEvent'];
                    if (PromiseRejectionEvent) {
                        var evt = new PromiseRejectionEvent(evtName, { promise: e.promise, reason: e.rejection });
                        eventTask.invoke(evt);
                    }
                });
            };
        }
        if (global['PromiseRejectionEvent']) {
            Zone[zoneSymbol('unhandledPromiseRejectionHandler')] = findPromiseRejectionHandler('unhandledrejection');
            Zone[zoneSymbol('rejectionHandledHandler')] = findPromiseRejectionHandler('rejectionhandled');
        }
    });

    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ApmBase = function () {
  function ApmBase(serviceFactory, disable) {
    _classCallCheck(this, ApmBase);

    this._disable = disable;
    this.serviceFactory = serviceFactory;
  }

  _createClass(ApmBase, [{
    key: 'init',
    value: function init(config) {
      if (this.isEnabled()) {
        var configService = this.serviceFactory.getService('ConfigService');
        configService.setConfig({
          agentName: 'js-base',
          agentVersion: '0.3.0'
        });
        configService.setConfig(config);
        this.serviceFactory.init();
        var errorLogging = this.serviceFactory.getService('ErrorLogging');
        errorLogging.registerGlobalEventListener();

        var performanceMonitoring = this.serviceFactory.getService('PerformanceMonitoring');
        performanceMonitoring.init();

        var transactionService = this.serviceFactory.getService('TransactionService');
        window.addEventListener('load', function (event) {
          // to make sure PerformanceTiming.loadEventEnd has a value
          setTimeout(function () {
            // need to delegate sending navigation timing to the router liberay
            if (!configService.get('hasRouterLibrary')) {
              transactionService.sendPageLoadMetrics();
            }
          });
        });
      }
      return this;
    }
  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return !this._disable;
    }
  }, {
    key: 'config',
    value: function config(_config) {
      var configService = this.serviceFactory.getService('ConfigService');
      configService.setConfig(_config);
    }
  }, {
    key: 'setUserContext',
    value: function setUserContext(userContext) {
      var configService = this.serviceFactory.getService('ConfigService');
      configService.setUserContext(userContext);
    }
  }, {
    key: 'setCustomContext',
    value: function setCustomContext(customContext) {
      var configService = this.serviceFactory.getService('ConfigService');
      configService.setCustomContext(customContext);
    }
  }, {
    key: 'setTag',
    value: function setTag(key, value) {
      var configService = this.serviceFactory.getService('ConfigService');
      configService.setTag(key, value);
    }

    // Should call this method before 'load' event on window is fired

  }, {
    key: 'setInitialPageLoadName',
    value: function setInitialPageLoadName(name) {
      if (this.isEnabled()) {
        var transactionService = this.serviceFactory.getService('TransactionService');
        transactionService.initialPageLoadName = name;
      }
    }
  }, {
    key: 'captureError',
    value: function captureError(error) {
      if (this.isEnabled()) {
        var errorLogging = this.serviceFactory.getService('ErrorLogging');
        return errorLogging.logError(error);
      }
    }
  }]);

  return ApmBase;
}();

module.exports = ApmBase;

/***/ })
/******/ ]);
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

var initElasticApm = __webpack_require__(0).init
// import init as initElasticApm from '../../..'
var createApmBase = __webpack_require__(2)
var elasticApm = createApmBase({
  debug: true,
  serverUrl: 'http://localhost:8200',
  serviceName: 'apm-agent-js-base-test-e2e-general-usecase',
  serviceVersion: '0.0.1'
})

elasticApm.setInitialPageLoadName('general-usecase-initial-page-load')

elasticApm.setUserContext({usertest: 'usertest',id: 'userId',username: 'username',email: 'email'})
elasticApm.setCustomContext({testContext: 'testContext'})
elasticApm.setTag('testTagKey', 'testTagValue')

function generateError () {
  throw new Error('timeout test error')
}

setTimeout(function () {
  generateError()
}, 100)

generateError.tmp = 'tmp'

var appEl = document.getElementById('app')
var testEl = document.createElement('h2')
testEl.setAttribute('id', 'test-element')
testEl.innerHTML = 'Passed'
appEl.appendChild(testEl)


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var initElasticApm = __webpack_require__(0).init
var apmBase = __webpack_require__(0).apmBase
var ApmServerMock = __webpack_require__(3)
function createApmBase (config) {
  // config.serverUrl = 'http://localhost:8200'
  var gc = {"testConfig":{},"serverUrl":"http://localhost:8200"} || {}
  console.log(gc)
  var apmServer
  if (!gc.useMocks) {
    apmServer = apmBase.serviceFactory.getService('ApmServer')
  }
  if (gc.serverUrl) {
    config.serverUrl = gc.serverUrl
  }
  var serverMock = new ApmServerMock(apmServer)
  apmBase.serviceFactory.registerServiceInstance('ApmServer', serverMock)

  elasticApm = initElasticApm(config)
  return elasticApm
}

module.exports = createApmBase


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var Subscription = __webpack_require__(4)
class ApmServerMock {
  constructor (apmServer) {
    var subscription = this.subscription = new Subscription()
    var _apmServer = this._apmServer = apmServer
    var calls = this.calls = {}

    function captureCall (methodName, call) {
      if (calls[methodName]) {
        calls[methodName].push(call)
      }else {
        calls[methodName] = [call]
      }
      subscription.applyAll(this, [call])
    }
    function applyMock (methodName, captureFn) {
      var args = Array.prototype.slice.call(arguments)
      args.splice(0, 2)
      var result
      var mocked = false
      if (_apmServer) {
        result = _apmServer[methodName].apply(_apmServer, args)
      }else {
        result = Promise.resolve()
        mocked = true
      }
      var call = {args: args, mocked: mocked}
      captureFn(methodName, call)
      return result
    }

    function spyOn (service, methodName) {
      var _orig = service[methodName]
      return service[methodName] = function () {
        var args = Array.prototype.slice.call(arguments)
        var call = {args: args,mocked: false}
        captureCall(methodName, call)
        return _orig.apply(service, arguments)
      }
    }

    this.sendErrors = _apmServer ?
      spyOn(_apmServer, 'sendErrors') :
      applyMock.bind(_apmServer, 'sendErrors', captureCall)
    this.sendTransactions = _apmServer ?
      spyOn(_apmServer, 'sendTransactions') :
      applyMock.bind(_apmServer, 'sendTransactions', captureCall)

    this.addError = applyMock.bind(_apmServer, 'addError', captureCall)
    this.addTransaction = applyMock.bind(_apmServer, 'addTransaction', captureCall)
  }
  init () {}
}

module.exports = ApmServerMock


/***/ }),
/* 4 */
/***/ (function(module, exports) {

function Subscription () {
  this.subscriptions = []
}

Subscription.prototype.subscribe = function (fn) {
  var self = this
  this.subscriptions.push(fn)

  return function () {
    var index = self.subscriptions.indexOf(fn)
    if (index > -1) {
      self.subscriptions.splice(index, 1)
    }
  }
}

Subscription.prototype.applyAll = function (applyTo, applyWith) {
  this.subscriptions.forEach(function (fn) {
    try {
      fn.apply(applyTo, applyWith)
    } catch (error) {
      console.log(error, error.stack)
    }
  }, this)
}

module.exports = Subscription


/***/ })
/******/ ]);
//# sourceMappingURL=app.e2e-bundle.js.map