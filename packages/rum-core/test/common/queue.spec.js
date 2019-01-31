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

var Queue = require('../../src/common/queue')

describe('Queue', function () {
  it('should work for default options', function (done) {
    var flushCounter = 0
    var items = []
    var queue = new Queue(function (qitems) {
      expect(qitems).toEqual(items)
      flushCounter++
    })
    for (var i = 0; i < 100; i++) {
      items.push(i)
      queue.add(i)
    }
    setTimeout(() => {
      expect(flushCounter).toBe(1)
      done()
    }, 100)
  })

  it('should flush when reaching queueLimit', function (done) {
    var flushCounter = 0
    var items = []
    var queue = new Queue(
      function (qitems) {
        flushCounter++
        if (flushCounter > 5) {
          expect(qitems.length).toBe(5)
        } else {
          expect(qitems.length).toBe(20)
        }
      },
      {
        queueLimit: 20
      }
    )

    for (var i = 0; i < 105; i++) {
      items.push(i)
      queue.add(i)
    }
    setTimeout(() => {
      expect(flushCounter).toBe(6)
      done()
    }, 100)
  })

  it('should flush according to the interval', function (done) {
    var flushCounter = 0
    var items = []
    var queue = new Queue(
      function (qitems) {
        expect(qitems).toEqual(items)
        flushCounter++
      },
      {
        flushInterval: 100
      }
    )

    for (var i = 0; i < 105; i++) {
      items.push(i)
      queue.add(i)
    }
    expect(flushCounter).toBe(0)
    setTimeout(() => {
      expect(flushCounter).toBe(1)
      done()
    }, 200)
  })
})
