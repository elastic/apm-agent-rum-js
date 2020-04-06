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

import afterFrame from '../../src/common/after-frame'

describe('AfterFrame', () => {
  it('should be called after micro tasks', done => {
    let count = 0
    afterFrame(() => {
      expect(count).toBe(2)
      done()
    })
    Promise.resolve().then(() => count++)

    new MutationObserver(() => count++).observe(document.body, {
      attributes: true
    })
    // Trigger mutation observer callback
    document.body.setAttribute('test', 'test')
  })

  it('should be called after tasks', done => {
    let count = 0
    afterFrame(() => {
      expect(count).toBe(2)
      done()
    })

    setTimeout(() => count++, 0)

    /**
     * Technique Used by react to enqueue task
     */
    const channel = new MessageChannel()
    channel.port1.onmessage = () => count++
    channel.port2.postMessage(undefined)
  })

  it('edge case test with double timeout', done => {
    let count = 0
    afterFrame(() => {
      /**
       * Varies based on how browser schedules the double setTimeout calls
       * depending on how many tasks are scheduled on the Task Queue
       * Task Scheduling is entirely up to the browser and it may render(layout
       * & paint) updates between tasks so we might not be able to account for all edge cases
       *
       * Hence the check is >= 1 instead of 2 which ensures if the browser calls
       * timers later the test should still pass as its an edge case for our
       * afterFrame code and its okay to not measure changes in this scenario
       */
      expect(count).toBeGreaterThanOrEqual(1)
      done()
    })
    setTimeout(() => count++, 0)

    /**
     * This is an Edge case, even though frameworks, user code never tries to
     * fetch something using this pattern, we are just testing to make sure we
     * include these changes in our after frame calculation depending on whether the
     * browser's event loop is busy or empty on current and next frame
     */
    setTimeout(() => {
      setTimeout(() => count++)
    })
  })
})
