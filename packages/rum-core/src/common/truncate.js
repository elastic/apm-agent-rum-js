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
const { KEYWORD_LIMIT } = require('./constants')

/**
 * All models value holds the arrary of form
 * [ limit, required, placeholder]
 *
 * Defaults are not represented in the array to reduce the size
 */
const METADATA_MODEL = {
  service: {
    name: [KEYWORD_LIMIT, true],
    version: [],
    environment: []
  }
}

const CONTEXT_COMMON = {
  user: {
    id: [],
    email: [],
    username: []
  },
  tags: {
    '*': []
  }
}

const SPAN_MODEL = {
  name: [KEYWORD_LIMIT, true],
  type: [KEYWORD_LIMIT, true],
  id: [KEYWORD_LIMIT, true],
  trace_id: [KEYWORD_LIMIT, true],
  parent_id: [KEYWORD_LIMIT, true],
  transaction_id: [KEYWORD_LIMIT, true],
  duration: [KEYWORD_LIMIT, true],
  subtype: [],
  action: [],
  context: CONTEXT_COMMON
}

const TRANSACTION_MODEL = {
  name: [],
  parent_id: [],
  type: [KEYWORD_LIMIT, true],
  id: [KEYWORD_LIMIT, true],
  trace_id: [KEYWORD_LIMIT, true],
  span_count: {
    started: [KEYWORD_LIMIT, true]
  },
  duration: [KEYWORD_LIMIT, true],
  context: CONTEXT_COMMON
}

const ERROR_MODEL = {
  id: [KEYWORD_LIMIT, true],
  trace_id: [],
  transaction_id: [],
  parent_id: [],
  culprit: [],
  exception: {
    type: []
  },
  transaction: {
    type: []
  },
  context: CONTEXT_COMMON
}

function truncate(
  value,
  limit = KEYWORD_LIMIT,
  required = false,
  placeholder = 'N/A'
) {
  if (required && !value) {
    value = placeholder
  }
  if (typeof value === 'string') {
    return value.substr(0, limit)
  }
  return value
}

function truncateModel(model = {}, target, childTarget = target) {
  const keys = Object.keys(model)
  for (let i = 0; i < keys.length; i++) {
    const currKey = keys[i]
    const value = model[currKey]
    if (!Array.isArray(value)) {
      truncateModel(value, target, childTarget[currKey])
    } else {
      /**
       * To avoid traversing the target object, we keep a reference to
       * the current depth inorder to get the value associated with the key
       * and set the truncated value in target object
       *
       * when the key is '*', Apply truncation to all the keys in current level
       */
      if (currKey === '*') {
        Object.keys(childTarget).forEach(key => {
          const truncatedValue = truncate(childTarget[key], value[0], value[1])
          if (truncatedValue) {
            childTarget[key] = truncatedValue
          }
        })
      } else {
        const truncatedValue = truncate(
          childTarget[currKey],
          value[0],
          value[1]
        )
        if (truncatedValue) {
          childTarget[currKey] = truncatedValue
        }
      }
    }
  }
  return target
}

module.exports = {
  truncate,
  truncateModel,
  SPAN_MODEL,
  TRANSACTION_MODEL,
  ERROR_MODEL,
  METADATA_MODEL
}
