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

import Url from './url'

/**
 * Converts URL path tree in to slug based on tree depth
 */
export default function slugifyUrl(urlStr, depth = 2) {
  const parsedUrl = new Url(urlStr)
  const { origin, query, path } = parsedUrl
  const pathParts = path.substring(1).split('/')

  const redactString = ':id'
  const end = '*'
  const specialCharsRegex = /\W|_/g
  const digitsRegex = /[0-9]/g
  const lowerCaseRegex = /[a-z]/g
  const upperCaseRegex = /[A-Z]/g

  var redactedParts = []
  var redcatedBefore = false

  for (let index = 0; index < pathParts.length; index++) {
    const part = pathParts[index]

    if (redcatedBefore || index > depth - 1) {
      if (part) {
        redactedParts.push(end)
      }
      break
    }

    const numberOfSpecialChars = (part.match(specialCharsRegex) || []).length
    if (numberOfSpecialChars >= 2) {
      redactedParts.push(redactString)
      redcatedBefore = true
      continue
    }

    const numberOfDigits = (part.match(digitsRegex) || []).length
    if (
      numberOfDigits > 3 ||
      (part.length > 3 && numberOfDigits / part.length >= 0.3)
    ) {
      redactedParts.push(redactString)
      redcatedBefore = true
      continue
    }

    const numberofUpperCase = (part.match(upperCaseRegex) || []).length
    const numberofLowerCase = (part.match(lowerCaseRegex) || []).length
    const lowerCaseRate = numberofLowerCase / part.length
    const upperCaseRate = numberofUpperCase / part.length
    if (
      part.length > 5 &&
      ((upperCaseRate > 0.3 && upperCaseRate < 0.6) ||
        (lowerCaseRate > 0.3 && lowerCaseRate < 0.6))
    ) {
      redactedParts.push(redactString)
      redcatedBefore = true
      continue
    }

    part && redactedParts.push(part)
  }

  const redacted =
    origin +
    '/' +
    (redactedParts.length >= 2
      ? redactedParts.join('/')
      : redactedParts.join('')) +
    (query ? '?{query}' : '')

  return redacted
}
