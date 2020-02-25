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
 *  waitfor a specific number of cycles
 * @param {*} conditionFn
 * @param {*} count
 * @param {*} message
 */
export function waitFor(
  conditionFn,
  count = 1,
  message = 'Waiting for condition exceeded allowed cycles.'
) {
  const checkCondition = (resolve, reject) => {
    if (count >= 0) {
      count--
      if (conditionFn(count)) {
        resolve()
      } else {
        setTimeout(() => checkCondition(resolve, reject))
      }
    } else {
      reject(message)
    }
  }

  return new Promise(checkCondition)
}

/**
 * Conditional describe
 * @param {*} description
 * @param {*} specDefinitions
 * @param {*} condition
 */
export function describeIf(description, specDefinitions, condition) {
  let describeFn = describe
  if (arguments.length > 2) {
    if (!condition) {
      describeFn = xdescribe
    }
  }

  return describeFn.apply(this, [description, specDefinitions])
}
