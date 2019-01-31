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

function TransportMock (transport) {
  this._transport = transport
  this.transactions = []
  this.subscription = new Subscription()
  this.errors = []
  this.transactionInterceptor = undefined
}

TransportMock.prototype.sendTransaction = function (data, headers) {
  var transactinData = { data: data, headers: headers }
  this.transactions.push(transactinData)
  var trMock = this
  if (typeof trMock.transactionInterceptor === 'function') {
    return trMock.transactionInterceptor(data, headers)
  } else if (this._transport) {
    return this._transport.sendTransaction(data, headers).then(
      function () {
        trMock.subscription.applyAll(this, ['sendTransaction', transactinData])
      },
      function (reason) {
        console.log('Failed to send to apm server: ', reason)
      }
    )
  } else {
    this.subscription.applyAll(this, ['sendTransaction', transactinData])
    return new Promise(function (resolve) {
      resolve()
    })
  }
}

TransportMock.prototype.subscribe = function (fn) {
  return this.subscription.subscribe(fn)
}

TransportMock.prototype.sendError = function (data, headers) {
  var errorData = { data: data, headers: headers }
  this.errors.push(errorData)
  this.subscription.applyAll(this, ['sendError', errorData])
}

module.exports = TransportMock
