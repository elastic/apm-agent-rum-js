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

const RAF_TIMEOUT = 100

/**
 * Schedule a callback to be invoked after the browser paints a new frame.
 *
 * There are multiple ways to do this like double rAF, MessageChannel, But we
 * use the requestAnimationFrame + setTimeout
 *
 * Also, RAF does not fire if the current tab is not visible, so we schedule a
 * timeout in parallel to ensure the callback is invoked
 *
 * Based on the  code from preact!
 * https://github.com/preactjs/preact/blob/f6577c495306f1e93174d69bd79f9fb8a418da75/hooks/src/index.js#L285-L297
 */
export default function afterFrame(callback) {
  const handler = () => {
    clearTimeout(timeout)
    cancelAnimationFrame(raf)
    setTimeout(callback)
  }
  const timeout = setTimeout(handler, RAF_TIMEOUT)

  const raf = requestAnimationFrame(handler)
}
