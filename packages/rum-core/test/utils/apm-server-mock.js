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

var Subscription = require('../../src/common/subscription')
class ApmServerMock {
  constructor (apmServer, useMocks) {
    var subscription = (this.subscription = new Subscription())
    var _apmServer = (this._apmServer = apmServer)
    var calls = (this.calls = {})

    function captureCall (methodName, call) {
      if (calls[methodName]) {
        calls[methodName].push(call)
      } else {
        calls[methodName] = [call]
      }
      subscription.applyAll(this, [call])
    }
    // eslint-disable-next-line
    function applyMock(methodName, captureFn, mockFn) {
      var args = Array.prototype.slice.call(arguments)
      args.splice(0, 3)
      var result
      var mocked = false
      if (!mockFn) {
        result = _apmServer[methodName].apply(_apmServer, args)
      } else {
        result = mockFn.apply(this, args)
        mocked = true
      }
      var call = { args: args, mocked: mocked }
      captureFn(methodName, call)
      return result
    }

    function spyOn (service, methodName, mockFn) {
      var _orig = service[methodName]
      return (service[methodName] = function () {
        var args = Array.prototype.slice.call(arguments).map(a => JSON.parse(JSON.stringify(a)))
        var call = { args: args, mocked: false }
        if (mockFn) {
          call.mocked = true
          call.returnValue = mockFn.apply(service, arguments)
          captureCall(methodName, call)
          return call.returnValue
        } else {
          call.returnValue = _orig.apply(service, arguments)
          captureCall(methodName, call)
          return call.returnValue
        }
      })
    }
    spyOn(
      _apmServer,
      'sendErrors',
      useMocks
        ? function () {
          return Promise.resolve()
        }
        : undefined
    )

    spyOn(
      _apmServer,
      'sendTransactions',
      useMocks
        ? function () {
          return Promise.resolve()
        }
        : undefined
    )

    this.addError = _apmServer.addError.bind(_apmServer)
    this.addTransaction = _apmServer.addTransaction.bind(_apmServer)
  }
  init () {}
}

module.exports = ApmServerMock
