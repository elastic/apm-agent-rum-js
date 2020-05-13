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

/**
 * First Input Delay, source: https://github.com/GoogleChromeLabs/first-input-delay/blob/master/src/first-input-delay.js
 */

const metrics = {}

function polyfillFID() {
  const eventTypes = [
    'click',
    'mousedown',
    'keydown',
    'touchstart',
    'pointerdown'
  ]
  const listenerOpts = { passive: true, capture: true }
  const startTimeStamp = new Date()

  const pointerup = 'pointerup'
  const pointercancel = 'pointercancel'

  function onPointerDown(delay, event) {
    function onPointerUp() {
      recordFirstInputDelay(delay, event)
      removePointerEventListeners()
    }

    function onPointerCancel() {
      removePointerEventListeners()
    }

    function removePointerEventListeners() {
      removeEventListener(pointerup, onPointerUp, listenerOpts)
      removeEventListener(pointercancel, onPointerCancel, listenerOpts)
    }

    addEventListener(pointerup, onPointerUp, listenerOpts)
    addEventListener(pointercancel, onPointerCancel, listenerOpts)
  }

  function recordFirstInputDelay(delay, event) {
    if (!metrics.fid) {
      let firstInputTimeStamp = new Date()

      eachEventType(removeEventListener)

      if (delay >= 0 && delay < firstInputTimeStamp - startTimeStamp) {
        metrics.fid = { delay, event }
      }
    }
  }

  function onInput(event) {
    if (event.cancelable) {
      let isEpochTime = event.timeStamp > 1e12
      let now = isEpochTime ? new Date() : performance.now()

      let delay = now - event.timeStamp

      if (event.type == 'pointerdown') {
        onPointerDown(delay, event)
      } else {
        recordFirstInputDelay(delay, event)
      }
    }
  }

  function eachEventType(callback) {
    eventTypes.forEach(function(eventType) {
      callback(eventType, onInput, listenerOpts)
    })
  }

  eachEventType(addEventListener)
}

export { metrics, polyfillFID }
